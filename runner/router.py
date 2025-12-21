from processors.invoice import process_invoice
from processors.receipt import process_receipt
from processors.pos import process_pos

def route(document_type: str, payload: dict):
    match document_type.lower():
        case "invoice":
            return process_invoice(payload)
        case "receipt":
            return process_receipt(payload)
        case "purchase_order":
            return process_pos(payload)
        case _:
            raise ValueError(f"Unsupported document type: {document_type}")
