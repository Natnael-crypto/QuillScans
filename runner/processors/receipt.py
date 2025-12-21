import json
import time
import random
import uuid
from datetime import datetime, timedelta
from services.supabase import insert_record
from processer import Processer
from promtes.receipt_promte import RECEIPT_PROMPT

def process_receipt(payload: dict):
    print(f"[RECEIPT] Processing document {payload['document_id']}")
    
    image_url = payload.get('files')[0].get('file_url')

    # Get extracted data from LLM
    json_response = Processer(RECEIPT_PROMPT, image_url)

    print(json_response)
    
    try:
        data = json.loads(json_response)
    except json.JSONDecodeError as e:
        print(f"[RECEIPT] Error parsing JSON response: {e}")
        return

    user_id = payload.get('user_id')
    if not user_id and 'files' in payload and payload['files']:
        user_id = payload['files'][0].get('user_id')
        
    if not user_id:
        print("[RECEIPT] Warning: No user_id found in payload")
        return
        
    document_id = payload['document_id']
    
    # Extract sections
    receipt_info = data.get('receipt', {}) or {}
    merchant_info = data.get('merchant', {}) or {}
    customer_info = data.get('customer', {}) or {}
    items = data.get('items', []) or []
    payment_info = data.get('payment', {}) or {}
    additional_info = data.get('additional_info', {}) or {}
    
    # 1. Prepare Receipt Data (ids needed for contacts first? No, contacts first usually)
    # The original code created contacts first, let's stick to that pattern if possible, 
    # but receipts table has merchant_contact_id and customer_contact_id foreign keys, so contacts MUST be created first.

    receipt_number = receipt_info.get('receipt_number') or additional_info.get('receipt_number') or f"RCP-{uuid.uuid4().hex[:12].upper()}"
    
    # Handle dates
    transaction_date = receipt_info.get('transaction_date')
    transaction_time = receipt_info.get('transaction_time')
    if transaction_date:
        if transaction_time:
             try:
                dt = datetime.fromisoformat(f"{transaction_date}T{transaction_time}")
                transaction_date = dt.isoformat()
             except ValueError:
                 pass
    else:
        transaction_date = datetime.utcnow().isoformat()

    # 2. Create Contacts (Merchant & Customer)
    
    # Merchant
    merchant_name = merchant_info.get('name') or "Unknown Merchant"
    merchant_data = {
        "user_id": user_id or "",
        "name": merchant_name or "",
        "email": merchant_info.get('email') or "",
        "phone": merchant_info.get('phone') or "",
        "type": "sender",
    }
    merchant_record = insert_record("contacts", merchant_data)
    
    # Customer
    customer_name = customer_info.get('name') or "Unknown Customer"
    customer_data = {
        "user_id": user_id or "",
        "name": customer_name or "",
        "email": customer_info.get('email') or "",
        "type": "recipient"
    }
    customer_record = insert_record("contacts", customer_data)
    
    # 3. Create Receipt
    
    # Calculate totals from LLM or items
    subtotal = receipt_info.get('subtotal') or 0
    tax_total = receipt_info.get('tax_total') or 0
    tip = receipt_info.get('tip', 0)
    grand_total = receipt_info.get('grand_total') or 0
    
    # We will refine totals after items if needed
    
    receipt_data = {
        "receipt_number": receipt_number,
        "user_id": user_id or "",
        "transaction_date": transaction_date,
        "merchant_contact_id": merchant_record['id'],
        "customer_contact_id": customer_record['id'],
        "subtotal": subtotal or 0, # Placeholder
        "tax_total": tax_total or 0,
        "tip": tip,
        "grand_total": grand_total or 0, # Placeholder
        "currency": receipt_info.get('currency') or 'USD',
        "status": receipt_info.get('status') or 'completed',
        "source_document_id": document_id
    }
    
    print(f"[RECEIPT] Inserting receipt {receipt_number}...")
    receipt_record = insert_record("receipts", receipt_data)
    receipt_id = receipt_record['id']
    print(f"[RECEIPT] Created receipt {receipt_id}")

    # 4. Create Receipt Items
    calc_subtotal = 0
    
    for item in items:
        qty = item.get('quantity') or 1
        unit_price = item.get('unit_price') or 0
        amount = item.get('amount') or 0
        
        if amount is None and unit_price is not None:
             amount = qty * unit_price
        if amount is None: amount = 0
            
        calc_subtotal += amount
        
        item_data = {
            "receipt_id": receipt_id,
            "description": item.get('description') or "",
            "quantity": qty,
            "unit_price": unit_price,
            "amount": amount,
            "tax_rate": item.get('tax_rate', 0)
        }
        insert_record("receipt_items", item_data)
        
    # Recalculate totals if missing
    if subtotal is None:
        receipt_data['subtotal'] = calc_subtotal
        
    if grand_total is None:
        receipt_data['grand_total'] = calc_subtotal + (tax_total or 0) + (tip or 0)
        
    # 5. Create Receipt Payment
    payment_data = {
        "receipt_id": receipt_id,
        "method": payment_info.get('method', 'cash') or "cash",
        "provider": payment_info.get('provider') or "",
        "transaction_reference": payment_info.get('transaction_reference') or "",
        "last4": payment_info.get('last4') or "",
        "auth_code": payment_info.get('auth_code') or ""
    }
    insert_record("receipt_payments", payment_data)
    
    print(f"[RECEIPT] Completed processing for {document_id}")
    
    return {
        "receipt_id": receipt_id,
        "total": receipt_data['grand_total'],
        "currency": receipt_data['currency'],
        "merchant": merchant_name
    }

    