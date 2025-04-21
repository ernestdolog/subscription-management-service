import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { CognitoUser } from '#app/shared/authorization/tool/index.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { contactDetailFactory } from '#app/__tests__/factories/contact-detail.factory.js';
import { contactDetailEntityRelationFactory } from '#app/__tests__/factories/contact-detail-entity-relation.factory.js';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { LogoutCommand, UpdateUserCommand } from '#app/shared/aws-cognito/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { ContactDetailUpdateBody } from '#app/modules/contact-detail/http/v1/request/contact-detail.update.request.js';
import { ContactDetailResponse } from '#app/modules/contact-detail/http/v1/index.js';

describe('ContactDetailUpdate', async () => {
    const subscriptionId = faker.string.uuid();
    const user = userFactory({
        subscriptionId,
    });
    before(async () => {
        /**
         * Hit out clients instantiation:
         */
        CognitoIdentityProviderClient.prototype.send = (() => {}) as never;
        CognitoUser.prototype.deserialize = () => user;
    });

    it('successfully update contact detail', async t => {
        const subscription = await subscriptionFactory().save({ id: subscriptionId });

        const awsCognitoClientSend = t.mock.method(CognitoIdentityProviderClient.prototype, 'send');
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 0);

        const contactDetail = await contactDetailFactory().save();
        await contactDetailEntityRelationFactory().save({
            contactDetailId: contactDetail.id,
            entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const request = {
            type: ContactDetailType.EMAIL,
            detail: faker.internet.email(),
            tag: ContactDetailTag.APP_SIGNUP,
        };

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.put<ContactDetailUpdateBody, ContactDetailResponse>(
            API_PREFIX_V1 + `/contact-details/${contactDetail.id}`,
            request,
        );

        const data = await result.json();

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        assert.equal(data.id, contactDetail.id);

        assert.equal(data.type, request.type);
        assert.equal(data.detail, request.detail);
        assert.equal(data.tag, request.tag);

        assert.equal(data.entityType, contactDetail.entityType);
        assert.equal(data.entityId, contactDetail.entityId);

        if (
            request.tag === ContactDetailTag.APP_SIGNUP &&
            request.type === ContactDetailType.EMAIL &&
            !!request.detail
        ) {
            assert.strictEqual(awsCognitoClientSend.mock.calls.length, 2);
            /**
             * Cognito command send client was called with correct input
             */
            const updateUserCommand = new UpdateUserCommand({
                accountId: user.accountId,
                user,
                email: request.detail,
            });
            const awsCognitoClientSendCallOne = awsCognitoClientSend.mock.calls[0];
            assert.equal(
                JSON.stringify(awsCognitoClientSendCallOne.arguments[0]),
                JSON.stringify(updateUserCommand.get()),
            );
            /**
             * Cognito command send client was called with correct input
             */
            const logoutCommand = new LogoutCommand(user);
            const awsCognitoClientSendCallTwo = awsCognitoClientSend.mock.calls[1];
            assert.equal(
                JSON.stringify(awsCognitoClientSendCallTwo.arguments[0]),
                JSON.stringify(logoutCommand.get()),
            );
        }
    });
});
