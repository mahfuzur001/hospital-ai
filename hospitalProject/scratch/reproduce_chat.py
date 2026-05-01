import os
import django
import sys
import io

# Set stdout encoding to utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Setup django environment
sys.path.append('d:/WADP-NSDA-B7/final-prepatations/SmartHospital/hospitalProject')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalProject.settings')
django.setup()

from Ragapp.rag_services import RAGService

print("--- Testing RAGService.ask_ai('ক্লান্ত') ---")
response = RAGService.ask_ai('ক্লান্ত')
print("Response Length:", len(response))
print("Contains 'admin'?", 'admin' in response.lower())
print("Response Snippet:")
print(response)
