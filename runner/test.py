import os
import json
import time
import re
import google.generativeai as genai
import requests


# -----------------------------
# Configuration
# -----------------------------
genai.configure(api_key="AIzaSyB_nBq6Fx8tjPcS14Nt7aP1pp-YldBLJNM")

MODEL_NAME = "models/gemini-2.0-flash"
OUTPUT_FILE = "result-real-estate.json"


# -----------------------------
# Utilities
# -----------------------------
def extract_json_from_content(content: str) -> str:
    """
    Extract raw JSON from model output.
    Gemini sometimes wraps output in ```json blocks.
    """
    if not isinstance(content, str):
        raise ValueError("Expected string content from model")

    cleaned = re.sub(r"```json|```", "", content).strip()
    return cleaned


def save_json_to_file(json_text: str, file_path: str):
    """
    Parse and save JSON safely.
    Ensures valid JSON output only.
    """
    try:
        parsed = json.loads(json_text)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=4, ensure_ascii=False)
        print(f"✅ JSON result saved to {file_path}")
    except json.JSONDecodeError as e:
        raise ValueError(f"❌ Invalid JSON returned by model: {e}")


def download_image(url: str) -> bytes:
    resp = requests.get(url, timeout=20)
    resp.raise_for_status()
    return resp.content

# -----------------------------
# Main Extraction Logic
# -----------------------------
def main():
    model = genai.GenerativeModel(
        model_name=MODEL_NAME,
        generation_config={
            "temperature": 0,
            "max_output_tokens": 2048,
        },
    )

    prompt = """
You are an advanced financial-document extraction AI.

You will receive an image or PDF page containing an invoice or receipt.
Extract all relevant information and return a STRICTLY VALID JSON OBJECT.

OUTPUT RULES:
1. Output ONLY JSON — no markdown, no comments.
2. Missing fields MUST be null.
3. Numbers must be plain numbers (no symbols).
4. Dates must be YYYY-MM-DD.
5. Line items must be an array.
6. Identify currency or return null.

JSON STRUCTURE:
{
  "invoice_number": null,
  "invoice_date": null,
  "due_date": null,
  "po_number": null,
  "currency": null,

  "vendor": {
    "name": null,
    "address": null,
    "email": null,
    "phone": null,
    "tax_id": null,
    "registration_number": null,
    "website": null
  },

  "customer": {
    "name": null,
    "address": null,
    "email": null,
    "phone": null,
    "tax_id": null
  },

  "line_items": [
    {
      "description": null,
      "quantity": null,
      "unit_price": null,
      "total_price": null,
      "sku": null
    }
  ],

  "summary": {
    "subtotal": null,
    "discount": null,
    "tax_amount": null,
    "tax_rate": null,
    "shipping_fee": null,
    "other_fees": null,
    "total": null,
    "currency": null
  },

  "payment_details": {
    "payment_method": null,
    "paid_status": null,
    "paid_date": null,
    "bank_account": null,
    "iban": null,
    "swift": null,
    "payment_reference": null
  },

  "additional_info": {
    "terms": null,
    "notes": null,
    "barcode_data": null,
    "qr_data": null,
    "page_number": null
  }
}
"""

    image_url = "https://www.getjobber.com/wp-content/uploads/2024/04/receipt-template-handyman.webp"
    image_bytes = download_image(image_url)

    start = time.time()

    response = model.generate_content(
        [
            prompt,
            {
                "mime_type": "image/webp",
                "data": image_bytes,
            },
        ]
    )

    end_time = time.time()

    raw_content = response.text
    clean_json = extract_json_from_content(raw_content)
    save_json_to_file(clean_json, OUTPUT_FILE)

    print(f"⏱️ Time taken: {end_time - start_time:.2f} seconds")


if __name__ == "__main__":
    main()
