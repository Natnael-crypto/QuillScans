
import os
import json
import time
import requests
import re
from promtes.invoice_promte import INVOICE_PROMPT


API_URL = "https://router.huggingface.co/v1/chat/completions"
headers = {
    "Authorization": "Bearer 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",
}

def extract_json_from_content(content):
    """
    Extract JSON from markdown code blocks or raw JSON.
    Removes ```json and ``` automatically.
    """
    if not isinstance(content, str):
        raise ValueError("Expected string content from model")

    cleaned = re.sub(r"^```json|^```|```$", "", content, flags=re.MULTILINE).strip()

    return cleaned

def query(payload):
    """Send request to HuggingFace Router endpoint."""
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise SystemExit(f"Request failed: {e}")

# def save_json_to_file(json_text, file_path="result-real-estate.json"):
#     """Safely save the extracted JSON to file."""
#     try:
#         # The model returns JSON *as text*, so we parse and rewrite it cleanly
#         parsed = json.loads(json_text)
#         with open(file_path, "w", encoding="utf-8") as f:
#             json.dump(parsed, f, indent=4, ensure_ascii=False)
#         print(f"JSON result saved to {file_path}")
#     except json.JSONDecodeError:
#         raise ValueError("Model response did not contain valid JSON.")

def Processer(PROMPT,IMAGE_URL):
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": PROMPT
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": IMAGE_URL
                        }
                    }
                ]
            }
        ],
        "model": "google/gemma-3-27b-it:nebius"
    }

    start_time = time.time()
    response = query(payload)
    end_time = time.time()

    raw_content = response["choices"][0]["message"]["content"]

    clean_json = extract_json_from_content(raw_content)


    print(f"⏱️ Time taken: {end_time - start_time:.2f} seconds")

    return clean_json


