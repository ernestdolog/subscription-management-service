import { ProducerRecord } from 'kafkajs';
import { AbstractKafkaMessage } from '../messages/abstract.kafka.message.js';
import { AbstractKafkaMessageDto } from '../messages/kafka.message.dto.js';

/**
 * Implement the class on all Kafka Producers.
 */
export abstract class AbstractKafkaProducer<
    TMessage extends AbstractKafkaMessage<AbstractKafkaMessageDto, never>,
    TResponse,
> {
    /**
     * Wraps Dto to message and publishes it
     */
    async publish(msg: TMessage): Promise<TResponse> {
        const message = msg.get();
        return this._publish(message);
    }

    /**
     * Implement this method for specific publishing logic.
     */
    protected abstract _publish(msg: ProducerRecord): Promise<TResponse>;
}
