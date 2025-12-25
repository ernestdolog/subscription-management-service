import '#app/__tests__/database.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { appConfig } from '#app/configs/app.config.js';
import { kafkaPayloadFactory } from '#app/__tests__/factories/kafka-payload.factory.js';
import { Kafka } from 'kafkajs';
import { EventEntityType, EventType } from '#app/shared/kafka/events/kafka.event.enum.js';
import { ConsumerDaemon } from '#app/consumer/consumer.daemon.js';
import { events } from '#app/shared/kafka/index.js';
import { SubscriptionCreatedEventHandler } from '#app/modules/subscription/application/subscription.created.event-handler.js';

describe('SubscriptionCreatedEventHandler', async () => {
    before(async () => {
        /**
         * Hit out Kafka client:
         */
        Kafka.prototype.consumer = (() => ({ commitOffsets: () => {} })) as never;
    });

    it('successfully consume events.v1.SubscriptionsSubscriptionCreatedEvent', async testContext => {
        const runSubscriptionCreatedHandlerMock = testContext.mock.method(
            SubscriptionCreatedEventHandler.prototype,
            'run',
        );
        assert.strictEqual(runSubscriptionCreatedHandlerMock.mock.calls.length, 0);

        const event = new events.v1.SubscriptionsSubscriptionCreatedEvent({
            type: EventType.CREATE,
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

        const consumer = new ConsumerDaemon(appConfig);
        await (consumer as any).onEvent(kafkaPayload);

        /**
         * responsible service called once
         */
        assert.strictEqual(runSubscriptionCreatedHandlerMock.mock.calls.length, 1);
        /**
         * with the event
         */
        const runSubscriptionCreatedEventHandlerCall =
            runSubscriptionCreatedHandlerMock.mock.calls[0];
        assert.equal(
            JSON.stringify(runSubscriptionCreatedEventHandlerCall.arguments[0]),
            JSON.stringify(event),
        );
    });
});
