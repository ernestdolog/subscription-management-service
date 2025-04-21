import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import { subscriptionCreateEmailSendClient } from '#app/shared/email/subscription-create.email.client.js';
import { messageProducer } from '#app/shared/producers/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { ContactDetailTag, ContactDetailType } from '#app/modules/contact-detail/domain/index.js';
import { SubscriptionCreateBody } from '#app/modules/subscription/http/v1/request/subscription.create.request.js';
import { SubscriptionResponse } from '#app/modules/subscription/http/v1/index.js';

describe('SubscriptionCreate', async () => {
    before(async () => {
        /**
         * Hit out email client instantiation:
         */
        subscriptionCreateEmailSendClient.send = (() => {}) as never;
        /**
         * Hit out messaging client:
         */
        messageProducer.publish = (() => {}) as never;
    });

    it('successfully create subscription', async t => {
        const sendEmail = t.mock.method(subscriptionCreateEmailSendClient, 'send');
        assert.strictEqual(sendEmail.mock.calls.length, 0);

        const request = {
            subscriptionName: faker.company.name(),
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        } as SubscriptionCreateBody;

        const testApi = useTestApplication({
            isAuthorized: false,
        });
        const result = await testApi.post<SubscriptionCreateBody, SubscriptionResponse>(
            API_PREFIX_V1 + '/subscriptions',
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 201);

        const data = await result.json();

        assert.equal(data.name, request.subscriptionName);

        assert.equal(data.accounts[0].person?.firstName, request.firstName);
        assert.equal(data.accounts[0].person?.lastName, request.lastName);
        assert.equal(data.accounts[0].entityType, UserEntityType.PERSON);

        assert.equal(data.accounts[0].person?.contactDetails[0].detail, request.email);
        assert.equal(data.accounts[0].person?.contactDetails[0].type, ContactDetailType.EMAIL);
        assert.equal(data.accounts[0].person?.contactDetails[0].tag, ContactDetailTag.APP_SIGNUP);

        /**
         * sent 1 email
         */
        assert.strictEqual(sendEmail.mock.calls.length, 1);
    });
});
