import os
from dotenv import load_dotenv

load_dotenv()

# Kafka (mTLS)
# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Kafka (mTLS)
KAFKA_BROKER = os.environ["KAFKA_BROKER"]
KAFKA_TOPIC = os.environ["KAFKA_TOPIC"]
KAFKA_GROUP_ID = os.getenv("KAFKA_GROUP_ID", "document-processor")

KAFKA_CA_CERT_PATH = os.path.join(BASE_DIR, os.environ["KAFKA_CA_CERT_PATH"])
KAFKA_CLIENT_CERT_PATH = os.path.join(BASE_DIR, os.environ["KAFKA_CLIENT_CERT_PATH"])
KAFKA_CLIENT_KEY_PATH = os.path.join(BASE_DIR, os.environ["KAFKA_CLIENT_KEY_PATH"])

# Supabase
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]