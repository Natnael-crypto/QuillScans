import json
import sys
import os

# Add runner directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock functions
def mock_Processer(prompt, image_url):
    print(f"  [MOCK] Processer called with image_url: {image_url}")
    # Return valid JSON based on what is expected
    if "invoice" in prompt.lower():
        return json.dumps({
            "invoice": {"invoice_number": "MOCK-INV-001", "grand_total": 100.0, "currency": "USD"},
            "vendor": {"name": "Mock Vendor", "email": "vendor@test.com"},
            "line_items": [{"description": "Item 1", "quantity": 1, "unit_price": 100.0, "amount": 100.0}],
            "totals": {"subtotal": 100.0, "grand_total": 100.0}
        })
    elif "pos" in prompt.lower():
        return json.dumps({
            "transaction": {"transaction_id": "MOCK-POS-001", "grand_total": 50.0},
            "store": {"name": "Mock Store"},
            "items": [{"description": "POS Item", "quantity": 1, "unit_price": 50.0, "amount": 50.0}],
            "totals": {"grand_total": 50.0}
        })
    elif "receipt" in prompt.lower():
         return json.dumps({
            "receipt": {"receipt_number": "MOCK-RCP-001", "grand_total": 25.0},
            "merchant": {"name": "Mock Merchant"},
            "items": [{"description": "Receipt Item", "quantity": 1, "unit_price": 25.0, "amount": 25.0}]
        })
    return "{}"

def mock_insert_record(table, data):
    print(f"  [MOCK] Inserting into {table}: {json.dumps(data, default=str)}")
    return {"id": "mock-uuid-1234"}

# Patch modules
import services.supabase
services.supabase.insert_record = mock_insert_record

import processer
processer.Processer = mock_Processer

# Import processors after patching
from processors.invoice import process_invoice
from processors.pos import process_pos
from processors.receipt import process_receipt

def test_invoice():
    print("\n--- Testing Invoice Processor ---")
    payload = {
        "document_id": "doc-inv-1",
        "user_id": "user-1",
        "files": [{"file_url": "http://example.com/invoice.jpg"}]
    }
    process_invoice(payload)

def test_pos():
    print("\n--- Testing POS Processor ---")
    payload = {
        "document_id": "doc-pos-1",
        "user_id": "user-1",
        "files": [{"file_url": "http://example.com/pos.jpg"}]
    }
    process_pos(payload)

def test_receipt():
    print("\n--- Testing Receipt Processor ---")
    payload = {
        "document_id": "doc-receipt-1",
        "user_id": "user-1",
        "files": [{"file_url": "http://example.com/receipt.jpg"}]
    }
    process_receipt(payload)

if __name__ == "__main__":
    test_invoice()
    test_pos()
    test_receipt()
