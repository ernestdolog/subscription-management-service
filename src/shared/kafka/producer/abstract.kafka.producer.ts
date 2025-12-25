import { ProducerRecord } from 'kafkajs';
import { AbstractKafkaEvent } from '../events/abstract.kafka.event.js';
import { AbstractKafkaEventDto } from '../events/kafka.event.dto.js';

/**
 * Implement the class on all Kafka Producers.
 */
export abstract class AbstractKafkaProducer<
    TEvent extends AbstractKafkaEvent<AbstractKafkaEventDto, never>,
    TResponse,
> {
    /**
     * Wraps Dto to event and publishes it
     */
    async publish(event: TEvent): Promise<TResponse> {
        const record = event.get();
        return this._publish(record);
    }

    /**
     * Implement this method for specific publishing logic.
     */
    protected abstract _publish(record: ProducerRecord): Promise<TResponse>;
}
