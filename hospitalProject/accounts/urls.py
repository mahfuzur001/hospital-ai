from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import (
    PatientRegisterView,
    LoginView,
    CreateDoctorView,
    CreateStaffView,
    CreateAdminView,
    UserProfileView,
    DoctorListView,
    StaffListView,
    PatientListView,
    HospitalStatsView,
    AdminUserDetailView,
)

urlpatterns = [
    # --- Public Endpoints ---
    path('register/', PatientRegisterView.as_view(), name='patient-register'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # --- Admin Only Endpoints (Management) ---
    path('admin/create-doctor/', CreateDoctorView.as_view(), name='admin-create-doctor'),
    path('admin/create-staff/', CreateStaffView.as_view(), name='admin-create-staff'),
    path('admin/create-admin/', CreateAdminView.as_view(), name='admin-create-admin'),
    path('admin/manage-user/<int:pk>/', AdminUserDetailView.as_view(), name='admin-manage-user'),
    path('admin/stats/', HospitalStatsView.as_view(), name='hospital-stats'),

    # --- List Endpoints ---
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('staffs/', StaffListView.as_view(), name='staff-list'),
    path('patients/', PatientListView.as_view(), name='patient-list'),

    # --- Authenticated User Endpoints ---
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]