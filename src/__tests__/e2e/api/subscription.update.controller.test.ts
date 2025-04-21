import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { messageProducer } from '#app/shared/producers/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { SubscriptionUpdateBody } from '#app/modules/subscription/http/v1/request/subscription.update.request.js';
import { SubscriptionUpdateResponse } from '#app/modules/subscription/http/v1/index.js';

describe('SubscriptionUpdate', async () => {
    before(async () => {
        /**
         * Hit out messaging client:
         */
        messageProducer.publish = (() => {}) as never;
    });

    it('successfully update subscription', async t => {
        const subscription = await subscriptionFactory().save();

        const request = {
            name: faker.company.name(),
        };

        const user = userFactory({
            subscriptionId: subscription.id,
        });

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.put<SubscriptionUpdateBody, SubscriptionUpdateResponse>(
            API_PREFIX_V1 + `/subscriptions/${subscription.id}`,
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.name, request.name);
    });
});
