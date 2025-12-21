import json
import time
import random
import uuid
from datetime import datetime, timedelta
from services.supabase import insert_record
from processer import Processer
from promtes.invoice_promte import INVOICE_PROMPT

def process_invoice(payload: dict):

    image_url = payload.get('files')[0].get('file_url')

    # Get extracted data from LLM
    json_response = Processer(INVOICE_PROMPT, image_url)

    
    try:
        data = json.loads(json_response)
    except json.JSONDecodeError as e:
        print(f"[INVOICE] Error parsing JSON response: {e}")
        return

    user_id = payload.get('user_id')
    if not user_id and 'files' in payload and payload['files']:
        user_id = payload['files'][0].get('user_id')
        
    if not user_id:
        print("[INVOICE] Warning: No user_id found in payload")
        return
        
    document_id = payload['document_id']
    
    # Extract sections
    invoice_info = data.get('invoice', {}) or {}
    vendor_info = data.get('vendor', {}) or {}
    customer_info = data.get('customer', {}) or {}
    line_items = data.get('line_items', []) or []
    totals_info = data.get('totals', {}) or {}
    
    # 1. Create Invoice
    invoice_number = invoice_info.get('invoice_number') or f"INV-{uuid.uuid4().hex[:12].upper()}"
    issued_at = invoice_info.get('invoice_date') or datetime.utcnow().isoformat()
    due_date = invoice_info.get('due_date') # Can be None
    
    invoice_data = {
        "invoice_number": invoice_number,
        "user_id": user_id,
        "issued_at": issued_at,
        "due_date": due_date,
        "status": invoice_info.get('status') or 'open',
        "memo": invoice_info.get('memo') or " ",
        "source_document_id": document_id,
    }

    
    invoice_record = insert_record("invoices", invoice_data)
    invoice_id = invoice_record['id']

    # 2. Create Contacts (Sender & Recipient)
    
    # Sender (Vendor)
    sender_name = vendor_info.get('name') or "Unknown Vendor"
    sender_data = {
        "invoice_id": invoice_id  or " ",
        "user_id": user_id  or " ",
        "name": sender_name  or " ",
        "email": vendor_info.get('email') or " ",
        "phone": vendor_info.get('phone') or " ",
        "type": "sender",
    }
    sender_record = insert_record("invoice_contacts", sender_data)
    
    # Recipient (Client)
    recipient_name = customer_info.get('name') or "Unknown Client"
    recipient_data = {
        "invoice_id": invoice_id  or " ",
        "user_id": user_id  or " ",
        "name": recipient_name  or " ",
        "email": customer_info.get('email') or " ",
        "phone": customer_info.get('phone') or " ",
        "type": "recipient"
    }

    recipient_record = insert_record("invoice_contacts", recipient_data)

    # 3. Create Addresses
    
    # Sender Address
    vendor_addr = vendor_info.get('address', {}) or {}
    if vendor_addr:
        sender_address_data = {
            "invoice_id": invoice_id  or " ",
            "contact_id": sender_record['id']  or " ",
            "line1": vendor_addr.get('line1') or vendor_addr.get('full_address') or " ",
            "city": vendor_addr.get('city') or " ",
            "state": vendor_addr.get('state') or " ",
            "postal_code": vendor_addr.get('postal_code') or " ",
            "country": vendor_addr.get('country') or " "
        }
        # Only insert if we have at least some address info
        if any(sender_address_data.values()):
            insert_record("invoice_addresses", sender_address_data)
    
    # Recipient Address
    customer_addr = customer_info.get('address', {}) or {}
    if customer_addr:
        recipient_address_data = {
            "invoice_id": invoice_id  or " ",
            "contact_id": recipient_record['id']  or " ",
            "line1": customer_addr.get('line1') or customer_addr.get('full_address') or " ",
            "city": customer_addr.get('city') or " ",
            "state": customer_addr.get('state') or " ",
            "postal_code": customer_addr.get('postal_code') or " ",
            "country": customer_addr.get('country') or " "
        }
        if any(recipient_address_data.values()):
            insert_record("invoice_addresses", recipient_address_data)

    # 4. Create Invoice Items
    processed_items = []
    for item in line_items:
        # Ensure numeric values
        quantity = item.get('quantity')
        unit_price = item.get('unit_price')
        amount = item.get('amount')
        
        # Basic validation/defaults
        if quantity is None: quantity = 1
        if amount is None and unit_price is not None: amount = quantity * unit_price
        if amount is None: amount = 0
            
        item_data = {
            "invoice_id": invoice_id  or " ",
            "description": item.get('description') or " ",
            "quantity": quantity,
            "unit_price": unit_price if unit_price is not None else 0,
            "amount": amount,
            "tax_rate": item.get('tax_rate') if item.get('tax_rate') is not None else 0
        }
        insert_record("invoice_items", item_data)
        processed_items.append(item_data)
    
    # 5. Create Totals
    # If totals missing from LLM, calculate from items
    subtotal = totals_info.get('subtotal')
    if subtotal is None:
        subtotal = sum(i['amount'] for i in processed_items)
        
    tax_total = totals_info.get('tax_total', 0)
    discount_total = totals_info.get('discount_total', 0)
    grand_total = totals_info.get('grand_total')
    
    if grand_total is None:
        grand_total = (subtotal or 0) + (tax_total or 0) - (discount_total or 0)
    
    totals_data = {
        "invoice_id": invoice_id  or " ",
        "subtotal": subtotal or 0,
        "tax_total": tax_total or 0,
        "discount_total": discount_total or 0,
        "grand_total": grand_total or 0,
        "currency": totals_info.get('currency') or 'USD'
    }
    insert_record("invoice_totals", totals_data)
    
    print(f"[INVOICE] Completed processing for {document_id}")
    
    return {
        "invoice_id": invoice_id,
        "total": grand_total,
        "currency": totals_info.get('currency', 'USD')
    }
