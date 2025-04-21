import { ProducerRecord } from 'kafkajs';
import { AbstractKafkaProducer, getKafkaProducerClient } from '#app/shared/kafka/index.js';
import { AbstractKafkaMessage } from '#app/shared/kafka/messages/abstract.kafka.message.js';
import { AbstractKafkaMessageDto } from '#app/shared/kafka/messages/kafka.message.dto.js';

class MessageProducer extends AbstractKafkaProducer<
    AbstractKafkaMessage<AbstractKafkaMessageDto, never>,
    void
> {
    protected async _publish(message: ProducerRecord): Promise<void> {
        const producer = await getKafkaProducerClient();
        await producer.send(message);
    }
}

export const messageProducer = new MessageProducer();
