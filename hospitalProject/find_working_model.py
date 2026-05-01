import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

models_to_test = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-flash-latest",
    "gemini-1.5-pro",
    "gemini-pro",
    "gemini-2.0-flash",
]

for model_name in models_to_test:
    print(f"Testing model: {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Hi")
        print(f"  Success! Response: {response.text[:50]}...")
        break
    except Exception as e:
        print(f"  Failed: {e}")
