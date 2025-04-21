import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { GetUserCommand, InternalForgotPasswordCommand } from '#app/shared/aws-cognito/index.js';
import { CognitoUser } from '#app/shared/authorization/tool/index.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { UserForgotPasswordBody } from '#app/modules/authentication/http/v1/request/user.forgot-password.request.js';
import { UserResponse } from '#app/modules/authentication/http/v1/index.js';

describe('UserForgotPassword', async () => {
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
            email: faker.internet.email(),
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

        const result = await testApi.post<UserForgotPasswordBody, UserResponse>(
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
        const forgotPasswordCommand = new InternalForgotPasswordCommand({
            email: request.email,
        });
        const awsCognitoClientSendCall = awsCognitoClientSend.mock.calls[0];
        assert.equal(
            JSON.stringify(awsCognitoClientSendCall.arguments[0]),
            JSON.stringify(forgotPasswordCommand.get()),
        );
        /**
         * Cognito get user called with correct command
         */
        const getUserCommand = new GetUserCommand({
            email: request.email,
        });
        const awsCognitoClientSecondCall = awsCognitoClientSend.mock.calls[1];
        assert.equal(
            JSON.stringify(awsCognitoClientSecondCall.arguments[0]),
            JSON.stringify(getUserCommand.get()),
        );
    });
});
