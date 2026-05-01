import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalProject.settings')
django.setup()

from Ragapp.models import DoctorEmbeddingModel
from accounts.models import DoctorProfileModel

doctors = DoctorProfileModel.objects.all()
embeddings = DoctorEmbeddingModel.objects.all()
active_embeddings = DoctorEmbeddingModel.objects.filter(is_active=True)
with_vectors = DoctorEmbeddingModel.objects.filter(embedding_vector__isnull=False)

print(f"Total Doctors: {doctors.count()}")
print(f"Total Embeddings entries: {embeddings.count()}")
print(f"Active Embeddings: {active_embeddings.count()}")
print(f"Embeddings with vectors: {with_vectors.count()}")

print("\n--- Doctor Embeddings Content ---")
for emb in active_embeddings:
    print(f"ID: {emb.id}")
    print(f"Content:\n{emb.content}")
    print("-" * 30)
