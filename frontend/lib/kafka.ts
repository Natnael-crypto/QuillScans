import { Kafka, Partitioners, Producer } from "kafkajs";
import fs from "fs";

// Declare a global variable to maintain the producer instance across hot reloads in development
declare global {
    var kafkaProducer: Producer | undefined;
}

let producer: Producer;

function createProducer() {
    const kafka = new Kafka({
        clientId: "nextjs-kafka-producer",
        brokers: [process.env.KAFKA_BROKER!],
        connectionTimeout: 45000, // Match Python session.timeout.ms
        requestTimeout: 60000,    // Match Python request.timeout.ms
        ssl: {
            ca: [fs.readFileSync(process.env.KAFKA_CA_CERT_PATH!, "utf-8")],
            cert: fs.readFileSync(process.env.KAFKA_CLIENT_CERT_PATH!, "utf-8"),
            key: fs.readFileSync(process.env.KAFKA_CLIENT_KEY_PATH!, "utf-8"),
            rejectUnauthorized: true,
        },
    });

    return kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
    });
}

export async function getProducer(): Promise<Producer> {
    if (process.env.NODE_ENV === "development") {
        if (!global.kafkaProducer) {
            global.kafkaProducer = createProducer();
            await global.kafkaProducer.connect();
        }
        return global.kafkaProducer;
    }

    if (!producer) {
        producer = createProducer();
        await producer.connect();
    }
    return producer;
}
