import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

print("Listing all models and testing them...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        model_name = m.name
        print(f"Testing {model_name}...")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Hi")
            print(f"  SUCCESS: {response.text[:50]}")
            # If we find one, we're done
            print(f"FOUND WORKING MODEL: {model_name}")
            break
        except Exception as e:
            print(f"  FAILED: {e}")
