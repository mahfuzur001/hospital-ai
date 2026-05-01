import os
import django
import sys

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'hospitalProject'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalProject.settings')
django.setup()

from accounts.models import UserModel, DoctorProfileModel
from Ragapp.models import DoctorEmbeddingModel
from Ragapp.rag_services import RAGService

print("--- Cleaning up non-doctor profiles ---")
# 1. Delete DoctorProfileModel for non-doctor users
bad_profiles = DoctorProfileModel.objects.exclude(user__role='DOCTOR')
count_profiles = bad_profiles.count()
for p in bad_profiles:
    print(f"Deleting profile for {p.user.username} (Role: {p.user.role})")
    p.delete()

# 2. Delete DoctorEmbeddingModel for non-doctor users (though cascading delete might have done it)
bad_embs = DoctorEmbeddingModel.objects.exclude(doctor__user__role='DOCTOR')
count_embs = bad_embs.count()
for e in bad_embs:
    print(f"Deleting embedding for {e.doctor.user.username}")
    e.delete()

print(f"\nDeleted {count_profiles} profiles and {count_embs} embeddings.")

# 3. Sync data again to ensure everything is correct
print("\n--- Syncing doctor data ---")
res = RAGService.sync_doctor_data()
print(res)

print("\n--- Final Audit ---")
for emb in DoctorEmbeddingModel.objects.all():
    print(f"Emb User: {emb.doctor.user.username}, Role: {emb.doctor.user.role}")
