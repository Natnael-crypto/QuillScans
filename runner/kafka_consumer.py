from confluent_kafka import Consumer
from config import (
    KAFKA_BROKER,
    KAFKA_GROUP_ID,
    KAFKA_CA_CERT_PATH,
    KAFKA_CLIENT_CERT_PATH,
    KAFKA_CLIENT_KEY_PATH,
)

def create_consumer():
    return Consumer({
        "bootstrap.servers": KAFKA_BROKER,

        # mTLS auth
        "security.protocol": "SSL",
        "ssl.ca.location": KAFKA_CA_CERT_PATH,
        "ssl.certificate.location": KAFKA_CLIENT_CERT_PATH,
        "ssl.key.location": KAFKA_CLIENT_KEY_PATH,

        # Consumer config
        "group.id": KAFKA_GROUP_ID,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
        "session.timeout.ms": 45000,
        "request.timeout.ms": 60000,
        "api.version.request": True,
    })
