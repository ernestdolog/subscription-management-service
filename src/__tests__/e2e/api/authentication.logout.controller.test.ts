import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { LogoutCommand } from '#app/shared/aws-cognito/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { AuthenticationLogoutBody } from '#app/modules/authentication/http/v1/request/authentication.logout.request.js';

describe('AuthenticationLogout', async () => {
    /**
     * @todo move to factory
     */
    let commandResult = true;

    before(async () => {
        /**
         * Hit out clients instantiation:
         */
        CognitoIdentityProviderClient.prototype.send = (() => commandResult) as never;
    });

    it('successfully sign out user', async t => {
        const request = {
            accountId: faker.string.uuid(),
        };

        const awsCognitoClientSend = t.mock.method(CognitoIdentityProviderClient.prototype, 'send');
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 0);

        const result = await useTestApplication({
            isAuthorized: false,
        }).post<AuthenticationLogoutBody, boolean>(
            API_PREFIX_V1 + '/authentications/logout',
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);
        const data = await result.json();

        const expectedResult = commandResult;

        assert.equal(data, expectedResult);

        /**
         * clients called 1-1 time
         */
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 1);
        /**
         * Cognito command send client was called with correct input
         */
        const signOutCommand = new LogoutCommand({
            accountId: request.accountId,
        });
        const awsCognitoClientSendCall = awsCognitoClientSend.mock.calls[0];
        assert.equal(
            JSON.stringify(awsCognitoClientSendCall.arguments[0]),
            JSON.stringify(signOutCommand.get()),
        );
    });
});
