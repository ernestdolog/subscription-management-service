import { Message, ProducerRecord } from 'kafkajs';
import { Topic } from './kafka.message.enum.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { KafkaMessageError } from './kafka.message.error.js';
import { AbstractKafkaMessageDto } from './kafka.message.dto.js';
import { randomUUID } from 'node:crypto';

export type MessageVersion = 'v1' | 'v2';
/**
 * Base class for all the Kafka messages.
 *
 * It has to be extended by all the messages along with Dto.
 */
export abstract class AbstractKafkaMessage<
    Dto extends AbstractKafkaMessageDto = AbstractKafkaMessageDto,
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
     * Message version. For migrations.
     */
    abstract get version(): MessageVersion;
    /**
     * Implement for message content validation.
     */
    abstract isValid: boolean;
    /**
     * Content to be send to the topic.
     */
    readonly content: Dto;
    /**
     * PubSub message attributes.
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
     * Overwrite to convert a message to a Kafka message.
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
            throw new InternalServerError(KafkaMessageError.MESSAGE_VALIDATION, {
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
