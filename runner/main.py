
import os
import json
import time
import requests
import re


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

    # Remove the ```json or ``` wrapper
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

def save_json_to_file(json_text, file_path="result-real-estate.json"):
    """Safely save the extracted JSON to file."""
    try:
        # The model returns JSON *as text*, so we parse and rewrite it cleanly
        parsed = json.loads(json_text)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=4, ensure_ascii=False)
        print(f"JSON result saved to {file_path}")
    except json.JSONDecodeError:
        raise ValueError("Model response did not contain valid JSON.")

def main():
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """
You are an advanced financial‑document extraction AI. You will receive an image or PDF page containing an invoice or receipt. Your task is to extract **all relevant information** and return a **strictly valid JSON object** with no additional text or explanations.

### OUTPUT RULES

1. Output **only JSON** — no markdown, no comments, no text before or after the JSON.
2. If a field does not exist in the document, return it as **null**.
3. All numbers must be plain numbers with no currency symbols.
4. All dates must be in **YYYY-MM-DD** format.
5. Line items must be a clean array with one object per listed item.
6. Include **all mandatory and optional invoice fields**.
7. Identify the currency from the document and if it doesn't exist return it as **null**.

### JSON STRUCTURE TO RETURN

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

Now analyze the provided invoice document and return the JSON exactly in this structure.
                    """
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": "https://www.getjobber.com/wp-content/uploads/2024/04/receipt-template-handyman.webp"
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

    save_json_to_file(clean_json)

    print(f"⏱️ Time taken: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    main()
