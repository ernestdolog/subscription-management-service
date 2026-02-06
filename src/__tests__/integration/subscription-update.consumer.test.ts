import '#app/__tests__/database.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { appConfig } from '#app/configs/index.js';
import { kafkaPayloadFactory } from '#app/__tests__/factories/kafka-payload.factory.js';
import { Kafka } from 'kafkajs';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';
import { EventListenerDaemon } from '#app/event-listener/event-listener.daemon.js';
import { events } from '#app/shared/kafka/index.js';
import { SubscriptionUpdatedListener } from '#app/modules/subscription/application/listeners/subscription-updated.listener.js';

describe('SubscriptionUpdatedListener', async () => {
    before(async () => {
        Kafka.prototype.consumer = (() => ({ commitOffsets: () => {} })) as never;
    });

    it('successfully consume events.v1.SubscriptionsSubscriptionUpdatedEvent', async testContext => {
        const listenMock = testContext.mock.method(SubscriptionUpdatedListener.prototype, 'listen');
        assert.strictEqual(listenMock.mock.calls.length, 0);

        const event = new events.v1.SubscriptionsSubscriptionUpdatedEvent({
            type: EventType.UPDATE,
            entityType: EventEntityType.SUBSCRIPTION,
            entityId: faker.string.uuid(),
            subscriptionId: faker.string.uuid(),
            name: faker.company.name(),
            updatedAt: faker.date.past().toUTCString(),
            updatedBy: faker.string.uuid(),
            createdAt: faker.date.past().toUTCString(),
            createdBy: faker.string.uuid(),
        });
        const kafkaPayload = kafkaPayloadFactory(event);

        const consumer = new EventListenerDaemon(appConfig);
        await (consumer as any).onEvent(kafkaPayload);

        assert.strictEqual(listenMock.mock.calls.length, 1);
        const listenCall = listenMock.mock.calls[0];
        assert.equal(listenCall.arguments[0].type, EventType.UPDATE);
        assert.equal(listenCall.arguments[0].entityType, EventEntityType.SUBSCRIPTION);
    });
});
