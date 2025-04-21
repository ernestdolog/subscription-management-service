import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import {
    GetUserCommand,
    InternalConfirmForgotPasswordCommand,
} from '#app/shared/aws-cognito/index.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { CognitoUser } from '#app/shared/authorization/tool/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { UserForgotPasswordConfirmationBody } from '#app/modules/authentication/http/v1/request/user.forgot-password-confirmation.request.js';
import { UserResponse } from '#app/modules/authentication/http/v1/index.js';

describe('UserForgotPasswordConfirmation', async () => {
    let user = userFactory();
    before(async () => {
        /**
         * Hit out clients instantiation:
         */
        CognitoIdentityProviderClient.prototype.send = (() => {}) as never;
        CognitoUser.prototype.deserialize = () => user;
    });

    it('successfully registers forgot-password', async t => {
        const request = {
            accountId: faker.internet.email(),
            confirmationCode: faker.number.int({ min: 0, max: 1_000_000 }).toString(),
            newPassword: faker.internet.password(),
        };
        /**
         * Spy on Aws Cognito Client
         * assert that it was not yet called
         */
        const awsCognitoClientSend = t.mock.method(CognitoIdentityProviderClient.prototype, 'send');
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 0);

        const fromCognitoUserMock = t.mock.method(CognitoUser.prototype, 'deserialize');
        assert.strictEqual(fromCognitoUserMock.mock.calls.length, 0);

        /**
         * Authorized test API Client
         * Header as in real life scenarion
         */
        const testApi = useTestApplication({
            isAuthorized: false,
        });

        const result = await testApi.put<UserForgotPasswordConfirmationBody, UserResponse>(
            API_PREFIX_V1 + '/users/forgot-password',
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        /**
         * returns correct reponse
         */
        assert.equal(JSON.stringify(data), JSON.stringify(user));

        /**
         * cognito user conversion called 1 time
         */
        assert.strictEqual(fromCognitoUserMock.mock.calls.length, 1);
        /**
         * client called 2 times
         */
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 2);
        /**
         * Cognito command client was called with correct input
         */
        const confirmForgotPassword = new InternalConfirmForgotPasswordCommand({
            accountId: request.accountId,
            confirmationCode: request.confirmationCode,
            newPassword: request.newPassword,
        });
        const awsCognitoClientFirstCall = awsCognitoClientSend.mock.calls[0];
        assert.equal(
            JSON.stringify(awsCognitoClientFirstCall.arguments[0]),
            JSON.stringify(confirmForgotPassword.get()),
        );
        /**
         * Cognito get user called with correct command
         */
        const getUserCommand = new GetUserCommand({
            accountId: request.accountId,
        });
        const awsCognitoClientSecondCall = awsCognitoClientSend.mock.calls[1];
        assert.equal(
            JSON.stringify(awsCognitoClientSecondCall.arguments[0]),
            JSON.stringify(getUserCommand.get()),
        );
    });
});
