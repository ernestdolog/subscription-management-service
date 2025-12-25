import { AbstractKafkaEvent } from '#app/shared/kafka/events/abstract.kafka.event.js';
import { faker } from '@faker-js/faker';
import { EachMessagePayload } from 'kafkajs';

export const kafkaPayloadFactory = (event: AbstractKafkaEvent<any, never>): EachMessagePayload => ({
    topic: event.topic,
    partition: faker.number.int(),
    message: {
        key: Buffer.from(faker.string.uuid(), 'utf-8'),
        value: Buffer.from(JSON.stringify(event.content), 'utf-8'),
        timestamp: faker.date.past({ years: 1, refDate: new Date() }).getTime().toString(),
        attributes: event.attributes,
        offset: faker.string.nanoid(),
        size: faker.number.int(),
    },
    heartbeat: (() => {}) as never,
    pause: (() => {}) as never,
});
