import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-2.0-flash-lite")
    response = model.generate_content("Hi")
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Failed: {e}")
