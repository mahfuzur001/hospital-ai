from rest_framework import serializers
from django.db import transaction
from .models import (
    UserModel, 
    AdminProfileModel, 
    DoctorProfileModel, 
    PatientProfileModel, 
    StaffProfileModel
)

# ==========================================
# 1. BASE USER SERIALIZER
# ==========================================
class UserSerializer(serializers.ModelSerializer):
    """লগইন করা ইউজারের সাধারণ তথ্য দেখানোর জন্য সিরিয়ালাইজার।"""
    class Meta:
        model = UserModel
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name', 'mobile_number', 'address']
        read_only_fields = ['role']


# ==========================================
# 2. PROFILE SERIALIZERS (FOR UPDATES)
# ==========================================
class AdminProfileSerializer(serializers.ModelSerializer):
    """এডমিন প্রোফাইলের তথ্য হ্যান্ডেল করার জন্য।"""
    class Meta:
        model = AdminProfileModel
        exclude = ['user']

class DoctorProfileSerializer(serializers.ModelSerializer):
    """ডাক্তার প্রোফাইলের তথ্য হ্যান্ডেল করার জন্য।"""
    class Meta:
        model = DoctorProfileModel
        exclude = ['user']

class PatientProfileSerializer(serializers.ModelSerializer):
    """পেশেন্ট প্রোফাইলের তথ্য হ্যান্ডেল করার জন্য।"""
    class Meta:
        model = PatientProfileModel
        exclude = ['user']
        extra_kwargs = {
            'age': {'allow_null': True, 'required': False},
        }

    def validate_age(self, value):
        if value == "" or value is None:
            return None
        return value

class StaffProfileSerializer(serializers.ModelSerializer):
    """স্টাফ প্রোফাইলের তথ্য হ্যান্ডেল করার জন্য।"""
    class Meta:
        model = StaffProfileModel
        exclude = ['user']


# ==========================================
# 3. REGISTRATION & ACCOUNT CREATION
# ==========================================

class PatientRegisterSerializer(serializers.ModelSerializer):
    """পেশেন্টদের পাবলিক রেজিস্ট্রেশনের জন্য সিরিয়ালাইজার।"""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = UserModel
        fields = ['username', 'email', 'password']

    @transaction.atomic
    def create(self, validated_data):
        user = UserModel.objects.create_user(role='PATIENT', **validated_data)
        return user

class AdminCreateSerializer(serializers.ModelSerializer):
    """এডমিন দ্বারা নতুন এডমিন তৈরির জন্য সিরিয়ালাইজার।"""
    password = serializers.CharField(write_only=True)
    department = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = UserModel
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'department']

    @transaction.atomic
    def create(self, validated_data):
        department = validated_data.pop('department', None)
        user = UserModel.objects.create_user(role='ADMIN', **validated_data)
        if department:
            AdminProfileModel.objects.filter(user=user).update(department=department)
        return user

class DoctorCreateSerializer(serializers.ModelSerializer):
    """এডমিন দ্বারা নতুন ডাক্তার অ্যাকাউন্ট তৈরির জন্য সিরিয়ালাইজার।"""
    password = serializers.CharField(write_only=True)
    speciality = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    experience = serializers.IntegerField(required=False, default=0)
    qualification = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    hospital_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)

    class Meta:
        model = UserModel
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'speciality', 'experience', 'qualification', 'hospital_name', 'consultation_fee'
        ]

    @transaction.atomic
    def create(self, validated_data):
        profile_fields = ['speciality', 'experience', 'qualification', 'hospital_name', 'consultation_fee']
        profile_data = {field: validated_data.pop(field, None) for field in profile_fields}

        user = UserModel.objects.create_user(role='DOCTOR', **validated_data)
        # Filter out None values to avoid overwriting defaults with null if not intended
        update_payload = {k: v for k, v in profile_data.items() if v is not None}
        DoctorProfileModel.objects.filter(user=user).update(**update_payload)
        return user

class StaffCreateSerializer(serializers.ModelSerializer):
    """এডমিন দ্বারা নতুন স্টাফ অ্যাকাউন্ট তৈরির জন্য সিরিয়ালাইজার।"""
    password = serializers.CharField(write_only=True)
    department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    designation = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = UserModel
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'department', 'designation']

    @transaction.atomic
    def create(self, validated_data):
        department = validated_data.pop('department', None)
        designation = validated_data.pop('designation', None)
        user = UserModel.objects.create_user(role='STAFF', **validated_data)
        
        update_data = {}
        if department: update_data['department'] = department
        if designation: update_data['designation'] = designation
        
        if update_data:
            StaffProfileModel.objects.filter(user=user).update(**update_data)
        return user