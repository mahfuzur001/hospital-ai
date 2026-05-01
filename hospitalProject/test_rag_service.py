import os
import django
import sys

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospitalProject.settings')
django.setup()

from Ragapp.rag_services import RAGService

try:
    print("Testing RAGService.ask_ai('I need a heart specialist')...")
    result = RAGService.ask_ai("I need a heart specialist")
    print(f"Result: {result}")
except Exception as e:
    import traceback
    print(f"Error occurred: {e}")
    traceback.print_exc()
