import requests
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

BASE_URL = f"{SUPABASE_URL}/functions/v1"

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

def update_document_status(document_id: str, status: str):
    res = requests.post(
        f"{BASE_URL}/update-document-status",
        headers=HEADERS,
        json={
            "document_id": document_id,
            "status": status,
        },
        timeout=10,
    )
    res.raise_for_status()


def get_document_files(document_id: str) -> list[dict]:
    res = requests.get(
        f"{BASE_URL}/get-document-files?document_id={document_id}",
        headers=HEADERS,
        timeout=10,
    )
    res.raise_for_status()
    return res.json()["files"]


def insert_record(table: str, data: dict) -> dict:
    """
    Inserts a record into a Supabase table using the PostgREST API.
    Returns the inserted record.
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    
    res = requests.post(url, headers=headers, json=data, timeout=10)
    
    if res.status_code >= 400:
        print(f"Error inserting into {table}: {res.text}")
        
    res.raise_for_status()
    
    # PostgREST returns a list of inserted records
    return res.json()[0]
