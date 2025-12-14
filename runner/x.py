import google.generativeai as genai
import os

genai.configure(api_key="AIzaSyB_nBq6Fx8tjPcS14Nt7aP1pp-YldBLJNM")

for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(model.name)
