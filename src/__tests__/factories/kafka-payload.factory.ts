import { AbstractKafkaMessage } from '#app/shared/kafka/messages/abstract.kafka.message.js';
import { faker } from '@faker-js/faker';
import { EachMessagePayload } from 'kafkajs';

export const kafkaPayloadFactory = (
    message: AbstractKafkaMessage<any, never>,
): EachMessagePayload => ({
    topic: message.topic,
    partition: faker.number.int(),
    message: {
        key: Buffer.from(faker.string.uuid(), 'utf-8'),
        value: Buffer.from(JSON.stringify(message.content), 'utf-8'),
        timestamp: faker.date.past({ years: 1, refDate: new Date() }).getTime().toString(),
        attributes: message.attributes,
        offset: faker.string.nanoid(),
        size: faker.number.int(),
    },
    heartbeat: (() => {}) as never,
    pause: (() => {}) as never,
});
