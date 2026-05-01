import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'hospitalProject'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalProject.settings')
django.setup()

from accounts.models import UserModel, DoctorProfileModel
from Ragapp.models import DoctorEmbeddingModel

print("--- User Audit ---")
for user in UserModel.objects.all():
    print(f"User: {user.username}, Role: {user.role}, ID: {user.id}")

print("\n--- Doctor Profile Audit ---")
for profile in DoctorProfileModel.objects.all():
    print(f"Profile User: {profile.user.username}, Role: {profile.user.role}")

print("\n--- Doctor Embedding Audit ---")
for emb in DoctorEmbeddingModel.objects.all():
    print(f"Emb User: {emb.doctor.user.username}, Active: {emb.is_active}")
    print(f"Content: {emb.content[:100]}...")
