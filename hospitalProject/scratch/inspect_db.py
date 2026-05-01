import os
import django
import sys

# Setup django environment
sys.path.append('d:/WADP-NSDA-B7/final-prepatations/SmartHospital/hospitalProject')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalProject.settings')
django.setup()

from accounts.models import UserModel

print("--- Searching for 'admin' in any user field ---")
for user in UserModel.objects.all():
    found = False
    if 'admin' in user.username.lower(): found = True
    if 'admin' in user.first_name.lower(): found = True
    if 'admin' in user.last_name.lower(): found = True
    if 'admin' in user.email.lower(): found = True
    
    if found:
        print(f"ID: {user.id}, Username: {user.username}, Name: {user.get_full_name()}, Role: {user.role}")

from Ragapp.models import DoctorEmbeddingModel
print("\n--- Checking all embeddings for 'admin' ---")
for e in DoctorEmbeddingModel.objects.all():
    if 'admin' in e.content.lower():
        print(f"Emb ID: {e.id}, Content contains 'admin'!")
        print(f"Content: {e.content}")

print("\n--- Checking for 'Qui libero' in all embeddings ---")
for e in DoctorEmbeddingModel.objects.all():
    if 'qui libero' in e.content.lower():
        print(f"Emb ID: {e.id}, Content contains 'Qui libero'!")
        print(f"Content: {e.content}")
