import json
import signal
from kafka_consumer import create_consumer
from config import KAFKA_TOPIC
from router import route
from services.supabase import (
    update_document_status,
    get_document_files,
)

running = True

def shutdown(sig, frame):
    global running
    running = False

signal.signal(signal.SIGINT, shutdown)
signal.signal(signal.SIGTERM, shutdown)

consumer = create_consumer()
consumer.subscribe([KAFKA_TOPIC])

print("🚀 Document processor started...")

while running:
    msg = consumer.poll(1.0)

    if msg is None:
        continue

    if msg.error():
        print("Kafka error:", msg.error())
        continue

    document_id = None

    try:
        payload = json.loads(msg.value().decode())
        document_id = payload["document_id"]
        document_type = payload["document_type"]

        # 1️⃣ Mark processing
        update_document_status(document_id, "processing")

        # 2️⃣ Fetch signed file URLs
        files = get_document_files(document_id)

        # 3️⃣ Route processing by document type
        result = route(
            document_type=document_type,
            payload={
                **payload,
                "files": files,  # signed URLs
            },
        )

        # 4️⃣ Mark processed
        update_document_status(document_id, "processed")

        consumer.commit(msg)

    except Exception as e:
        print("❌ Processing failed:", e)

        if document_id:
            try:
                update_document_status(document_id, "failed")
            except Exception as inner:
                print("❌ Failed to update status:", inner)

        consumer.commit(msg)  # avoid poison-message loops

consumer.close()
