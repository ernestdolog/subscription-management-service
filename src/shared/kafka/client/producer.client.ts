import { Partitioners, Producer, ProducerConfig } from 'kafkajs';
import { getKafkaClient } from './client.js';

let producer: Producer;

/**
 * Provides cached and connected Kafka producer client. Creates new if isn't cached.
 */
export async function getKafkaProducerClient(producerConfig?: ProducerConfig): Promise<Producer> {
    if (!producer) {
        await initializeKafkaProducerClient(producerConfig);
    }
    return producer;
}

export async function initializeKafkaProducerClient(
    producerConfig?: ProducerConfig,
): Promise<void> {
    const kafkaInstance = getKafkaClient();
    producer = kafkaInstance.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
        ...producerConfig,
    });
    await producer.connect();
}
