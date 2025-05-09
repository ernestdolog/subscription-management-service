import '#app/__tests__/database.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { appConfig } from '#app/configs/app.config.js';
import { kafkaPayloadFactory } from '#app/__tests__/factories/kafka-payload.factory.js';
import { Kafka } from 'kafkajs';
import { EventEntityType, EventType } from '#app/shared/kafka/messages/kafka.message.enum.js';
import { ConsumerDaemon } from '#app/consumer/consumer.daemon.js';
import { messages } from '#app/shared/kafka/index.js';
import { SubscriptionCreateMessageHandler } from '#app/modules/subscription/application/subscription.create-message.handler.js';

describe('SubscriptionCreateMessageHandler', async () => {
    before(async () => {
        /**
         * Hit out Kafka client:
         */
        Kafka.prototype.consumer = (() => ({ commitOffsets: () => {} })) as never;
    });

    it('successfully consume messages.v1.SubscriptionsSubscriptionCreateMessage', async testContext => {
        const runSubscriptionCreateHandlerMock = testContext.mock.method(
            SubscriptionCreateMessageHandler.prototype,
            'run',
        );
        assert.strictEqual(runSubscriptionCreateHandlerMock.mock.calls.length, 0);

        const message = new messages.v1.SubscriptionsSubscriptionCreateMessage({
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
        const kafkaPayload = kafkaPayloadFactory(message);

        const consumer = new ConsumerDaemon(appConfig);
        await (consumer as any).onEvent(kafkaPayload);

        /**
         * responsible service called once
         */
        assert.strictEqual(runSubscriptionCreateHandlerMock.mock.calls.length, 1);
        /**
         * with the message
         */
        const runAccountingAreaCreateConsumerServiceCall =
            runSubscriptionCreateHandlerMock.mock.calls[0];
        assert.equal(
            JSON.stringify(runAccountingAreaCreateConsumerServiceCall.arguments[0]),
            JSON.stringify(message),
        );
    });
});
