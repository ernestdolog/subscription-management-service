import { Message, ProducerRecord } from 'kafkajs';
import { Topic } from './kafka.event.enum.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { KafkaEventError } from './kafka.event.error.js';
import { AbstractKafkaEventDto } from './kafka.event.dto.js';
import { randomUUID } from 'node:crypto';

export type EventVersion = 'v1' | 'v2';
/**
 * Base class for all the Kafka events.
 *
 * It has to be extended by all the events along with Dto.
 */
export abstract class AbstractKafkaEvent<
    Dto extends AbstractKafkaEventDto = AbstractKafkaEventDto,
    Attributes extends Record<string, string> = Record<string, string>,
> {
    /**
     * Access Topic name directly from the class.
     */
    static get TOPIC(): Topic | undefined {
        return undefined;
    }
    /**
     * access Topic name within a class instance.
     */
    abstract get topic(): Topic;
    /**
     * Event version. For migrations.
     */
    abstract get version(): EventVersion;
    /**
     * Implement for event content validation.
     */
    abstract isValid: boolean;
    /**
     * Content to be send to the topic.
     */
    readonly content: Dto;
    /**
     * PubSub event attributes.
     */
    readonly attributes: Attributes;

    private provideEntityId(content: { entityId?: Dto['entityId'] }) {
        return content.entityId ?? randomUUID();
    }

    protected constructor(
        content: Omit<Dto, 'entityId'> & { entityId?: Dto['entityId'] },
        attributes?: Attributes,
    ) {
        this.content = { ...content, entityId: this.provideEntityId(content) } as Dto;
        this.attributes = attributes || ({} as Attributes);
    }
    /**
     * Overwrite to convert an event to a Kafka message.
     */
    protected compose(dto: Dto): Message {
        return {
            value: JSON.stringify(dto),
            headers: {
                version: this.version,
                topic: this.topic,
                ...this.attributes,
            },
        };
    }

    get(): ProducerRecord {
        if (!this.isValid) {
            throw new InternalServerError(KafkaEventError.EVENT_VALIDATION, {
                topic: this.topic,
                content: this.content,
            });
        }
        const messages: Message[] = [this.compose(this.content)];

        return {
            topic: this.topic,
            messages,
        };
    }
}
