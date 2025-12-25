import { ProducerRecord } from 'kafkajs';
import { AbstractKafkaProducer, getKafkaProducerClient } from '#app/shared/kafka/index.js';
import { AbstractKafkaEvent } from '#app/shared/kafka/events/abstract.kafka.event.js';
import { AbstractKafkaEventDto } from '#app/shared/kafka/events/kafka.event.dto.js';

class EventProducer extends AbstractKafkaProducer<
    AbstractKafkaEvent<AbstractKafkaEventDto, never>,
    void
> {
    protected async _publish(record: ProducerRecord): Promise<void> {
        const producer = await getKafkaProducerClient();
        await producer.send(record);
    }
}

export const eventProducer = new EventProducer();
