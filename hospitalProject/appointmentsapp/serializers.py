from rest_framework import serializers
from .models import AppointmentModel, PrescriptionModel
from doctorsapp.models import DoctorAvailabilityModel
from django.utils import timezone


# ==========================================
# APPOINTMENT SERIALIZER (FIXED)
# ==========================================
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AppointmentModel
        fields = [
            'id', 'patient', 'patient_name', 'doctor', 'doctor_name',
            'date', 'time', 'status', 'status_display',
            'reason_for_visit', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']
        extra_kwargs = {
            'patient': {'required': False, 'allow_null': True},
        }

    def get_patient_name(self, obj):
        try:
            name = obj.patient.user.get_full_name()
            return name if name.strip() else obj.patient.user.username
        except Exception:
            return None

    def get_doctor_name(self, obj):
        try:
            name = obj.doctor.user.get_full_name()
            return name if name.strip() else obj.doctor.user.username
        except Exception:
            return None

    def validate(self, attrs):
        doctor = attrs.get("doctor")
        patient = attrs.get("patient")
        date = attrs.get("date")
        time = attrs.get("time")

        instance = getattr(self, "instance", None)

        # 1. past date check
        if date and date < timezone.now().date():
            raise serializers.ValidationError({"date": "Past date booking allowed না।"})

        if not doctor or not date or not time:
            return attrs

        # 2. day match
        day_name = date.strftime('%A')

        # 3. availability check
        is_available = DoctorAvailabilityModel.objects.filter(
            doctor=doctor,
            day=day_name,
            start_time__lte=time,
            end_time__gte=time,
            is_active=True
        ).exists()

        # Note: if no availability slots set, we allow booking anyway
        if DoctorAvailabilityModel.objects.filter(doctor=doctor, is_active=True).exists() and not is_available:
            raise serializers.ValidationError({
                "time": f"Doctor {day_name} দিনে এই সময়ে available না।"
            })

        # 4. double booking doctor
        if AppointmentModel.objects.filter(
            doctor=doctor,
            date=date,
            time=time,
            status__in=['PENDING', 'CONFIRMED']
        ).exclude(id=instance.id if instance else None).exists():
            raise serializers.ValidationError("এই slot already booked।")

        # 5. patient conflict (only if patient is known)
        if patient:
            if AppointmentModel.objects.filter(
                patient=patient,
                date=date,
                time=time,
                status__in=['PENDING', 'CONFIRMED']
            ).exclude(id=instance.id if instance else None).exists():
                raise serializers.ValidationError("আপনার এই সময়ে অন্য appointment আছে।")

        return attrs


# ==========================================
# PRESCRIPTION SERIALIZER (FIXED SAFE)
# ==========================================
class PrescriptionSerializer(serializers.ModelSerializer):
    patient_info = serializers.SerializerMethodField()
    doctor_info = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionModel
        fields = [
            'id', 'appointment', 'patient_info', 'doctor_info',
            'symptoms', 'diagnosis', 'medicines', 'advice',
            'follow_up_date', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_patient_info(self, obj):
        return {
            "name": obj.appointment.patient.user.get_full_name(),
            "age": getattr(obj.appointment.patient, 'age', 'N/A')
        }

    def get_doctor_info(self, obj):
        return {
            "name": obj.appointment.doctor.user.get_full_name(),
            "specialization": getattr(obj.appointment.doctor, 'speciality', 'N/A')
        }

    def validate_appointment(self, value):
        if PrescriptionModel.objects.filter(appointment=value).exists():
            raise serializers.ValidationError(
                "এই appointment এর জন্য prescription already আছে।"
            )

        if value.status == "CANCELLED":
            raise serializers.ValidationError(
                "Cancelled appointment এ prescription দেওয়া যাবে না।"
            )

        return value
