import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
def list_gemini_models():
    """
    used to list all the available Gemini models in your account, you can use any of these models in main.py
    """
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    print("Available Gemini Models:")


    for m in genai.list_models():
        # show only models that support text generation
        if "generateContent" in m.supported_generation_methods:
            print(m.name)

# list_gemini_models()
