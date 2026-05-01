from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.views import TokenObtainPairView  # type: ignore

from .serializers import (
    UserSerializer,
    PatientRegisterSerializer,
    DoctorCreateSerializer,
    StaffCreateSerializer,
    AdminCreateSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer,
    StaffProfileSerializer,
    AdminProfileSerializer,
)
from .models import UserModel, DoctorProfileModel, StaffProfileModel


# ---------------------------------------------------------
# CUSTOM PERMISSION CLASSES
# ---------------------------------------------------------

class IsAdmin(permissions.BasePermission):
    """শুধুমাত্র এডমিন (is_staff) এক্সেস পাবে।"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsDoctor(permissions.BasePermission):
    """শুধুমাত্র ডাক্তার এক্সেস পাবে।"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "DOCTOR"


# ---------------------------------------------------------
# AUTHENTICATION & REGISTRATION VIEWS
# ---------------------------------------------------------

class LoginView(TokenObtainPairView):
    """JWT টোকেন প্রদান করে লগইন সম্পন্ন করে।"""
    pass


class PatientRegisterView(APIView):
    """পেশেন্টরা পাবলিকলি এই এন্ডপয়েন্ট ব্যবহার করে একাউন্ট খুলতে পারবে।"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PatientRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "success", "message": "Patient registered successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# ADMIN MANAGEMENT VIEWS (ADMIN ONLY)
# ---------------------------------------------------------

class CreateDoctorView(APIView):
    """এডমিন নতুন ডাক্তার অ্যাকাউন্ট তৈরি করতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = DoctorCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "success", "message": "Doctor created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateStaffView(APIView):
    """এডমিন নতুন স্টাফ অ্যাকাউন্ট তৈরি করতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = StaffCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "success", "message": "Staff created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateAdminView(APIView):
    """এডমিন নতুন এডমিন অ্যাকাউন্ট তৈরি করতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Admin created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------
# LIST VIEWS (READ-ONLY)
# ---------------------------------------------------------

class DoctorListView(APIView):
    """সব ডাক্তারের প্রোফাইল লিস্ট — appointment booking এর জন্য।"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctors = DoctorProfileModel.objects.select_related("user").all()
        data = []
        for doc in doctors:
            data.append(
                {
                    "id": doc.id,
                    "user": {
                        "id": doc.user.id,
                        "username": doc.user.username,
                        "first_name": doc.user.first_name,
                        "last_name": doc.user.last_name,
                        "email": doc.user.email,
                    },
                    "speciality": doc.speciality,
                    "experience": doc.experience,
                    "qualification": doc.qualification,
                    "hospital_name": doc.hospital_name,
                    "consultation_fee": str(doc.consultation_fee),
                }
            )
        return Response(data)


class StaffListView(APIView):
    """সব স্টাফের প্রোফাইল লিস্ট — শুধু Admin দেখতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        staffs = StaffProfileModel.objects.select_related("user").all()
        data = []
        for s in staffs:
            data.append(
                {
                    "id": s.id,
                    "user": UserSerializer(s.user).data,
                    "department": s.department,
                    "designation": s.designation,
                }
            )
        return Response(data)


class PatientListView(APIView):
    """সব পেশেন্টের লিস্ট — শুধু Admin দেখতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        from .models import PatientProfileModel
        patients = PatientProfileModel.objects.select_related("user").all()
        data = []
        for p in patients:
            data.append({
                "id": p.id,
                "user": UserSerializer(p.user).data,
                "age": p.age,
                "gender": p.gender,
                "blood_group": p.blood_group,
                "medical_history": p.medical_history,
            })
        return Response(data)


class HospitalStatsView(APIView):
    """হাসপাতালের সার্বিক পরিসংখ্যান — শুধু Admin দেখতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        from .models import PatientProfileModel, StaffProfileModel, DoctorProfileModel
        from appointmentsapp.models import AppointmentModel
        from django.utils import timezone

        today = timezone.now().date()
        
        stats = {
            "total_doctors": DoctorProfileModel.objects.count(),
            "total_patients": PatientProfileModel.objects.count(),
            "total_staff": StaffProfileModel.objects.count(),
            "total_appointments": AppointmentModel.objects.count(),
            "today_appointments": AppointmentModel.objects.filter(date=today).count(),
            "pending_appointments": AppointmentModel.objects.filter(status='PENDING').count(),
        }
        return Response(stats)


# ---------------------------------------------------------
# USER PROFILE & UPDATE VIEWS (LOGGED-IN USER)
# ---------------------------------------------------------

class UserProfileView(APIView):
    """লগইন করা ইউজারের প্রোফাইল দেখা এবং রোল অনুযায়ী আংশিক আপডেট করা।"""
    permission_classes = [permissions.IsAuthenticated]

    def _get_profile_serializer(self, user, data=None, partial=False):
        """রোলের ওপর ভিত্তি করে সঠিক প্রোফাইল সিরিয়ালাইজার রিটার্ন করে।"""
        profile_obj = None
        serializer_class = None

        if user.role == "ADMIN":
            profile_obj = getattr(user, "admin_profile", None)
            serializer_class = AdminProfileSerializer
        elif user.role == "DOCTOR":
            profile_obj = getattr(user, "doctor_profile", None)
            serializer_class = DoctorProfileSerializer
        elif user.role == "PATIENT":
            profile_obj = getattr(user, "patient_profile", None)
            serializer_class = PatientProfileSerializer
        elif user.role == "STAFF":
            profile_obj = getattr(user, "staff_profile", None)
            serializer_class = StaffProfileSerializer

        if not serializer_class or not profile_obj:
            return None

        if data is None:
            return serializer_class(instance=profile_obj)

        return serializer_class(instance=profile_obj, data=data, partial=partial)

    def get(self, request):
        """ইউজারের বেসিক ডাটা ও প্রোফাইলের বিস্তারিত ডাটা প্রদান করে।"""
        user_serializer = UserSerializer(request.user)
        response_data = user_serializer.data

        profile_serializer = self._get_profile_serializer(request.user)
        response_data["profile_details"] = (
            profile_serializer.data if profile_serializer else None
        )
        return Response(response_data)

    def patch(self, request):
        """ইউজার মডেল ও প্রোফাইল মডেল একসাথে আপডেট করে।"""
        user = request.user
        user_serializer = UserSerializer(user, data=request.data, partial=True)

        if user_serializer.is_valid():
            user_serializer.save()

            profile_data = request.data.get("profile_details")
            if profile_data:
                profile_serializer = self._get_profile_serializer(
                    user, data=profile_data, partial=True
                )
                if profile_serializer:
                    if profile_serializer.is_valid():
                        profile_serializer.save()
                    else:
                        return Response(
                            profile_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            return self.get(request)

        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserDetailView(APIView):
    """এডমিন যেকোনো ইউজারকে আপডেট বা ডিলিট করতে পারবে।"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = UserModel.objects.get(pk=pk)
            user_serializer = UserSerializer(user, data=request.data, partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
                
                profile_data = request.data.get("profile_details")
                if profile_data:
                    # ইউজার রোল অনুযায়ী প্রোফাইল আপডেট
                    view = UserProfileView()
                    profile_serializer = view._get_profile_serializer(user, data=profile_data, partial=True)
                    if profile_serializer and profile_serializer.is_valid():
                        profile_serializer.save()
                    elif profile_serializer:
                        return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({"message": "User updated successfully"})
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except UserModel.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            user = UserModel.objects.get(pk=pk)
            if user.is_superuser or user.role == 'ADMIN':
                # নিরাপত্তার স্বার্থে এডমিন সরাসরি অন্য এডমিন ডিলিট করতে পারবে না (superuser বাদে)
                if not request.user.is_superuser:
                    return Response({"error": "Only superusers can delete admins"}, status=status.HTTP_403_FORBIDDEN)
            
            user.delete()
            return Response({"message": "User deleted successfully"})
        except UserModel.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)