import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { RefresTokenCommand } from '#app/shared/aws-cognito/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { AuthenticationRefreshTokenBody } from '#app/modules/authentication/http/v1/request/authentication.refresh-token.request.js';
import { AuthenticationResponse } from '#app/modules/authentication/http/v1/index.js';

describe('AuthenticationRefreshToken', async () => {
    /**
     * @todo move to factory
     */
    let commandResult = {
        AuthenticationResult: {
            IdToken: faker.string.hexadecimal({ length: 21 }),
            RefreshToken: faker.string.hexadecimal({ length: 21 }),
            ExpiresIn: faker.number.int({ max: 1_000 }).toString(),
        },
    };

    before(async () => {
        /**
         * Hit out clients instantiation:
         */
        CognitoIdentityProviderClient.prototype.send = (() => commandResult) as never;
    });

    it('successfully refresh token of user', async t => {
        const request = {
            refreshToken: faker.internet.password(),
        };

        const awsCognitoClientSend = t.mock.method(CognitoIdentityProviderClient.prototype, 'send');
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 0);

        const result = await useTestApplication({
            isAuthorized: false,
        }).post<AuthenticationRefreshTokenBody, AuthenticationResponse>(
            API_PREFIX_V1 + '/authentications/refresh-token',
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        const expectedResult = {
            token: commandResult.AuthenticationResult!.IdToken!,
            refreshToken: commandResult.AuthenticationResult!.RefreshToken!,
            expires: Number(commandResult.AuthenticationResult!.ExpiresIn!),
        };

        assert.deepEqual(data, expectedResult);

        /**
         * client called 1 time
         */
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 1);
        /**
         * Cognito command send client was called with correct input
         */
        const refreshSessionCommand = new RefresTokenCommand({
            refreshToken: request.refreshToken,
        });
        const awsCognitoClientSendCall = awsCognitoClientSend.mock.calls[0];
        assert.equal(
            JSON.stringify(awsCognitoClientSendCall.arguments[0]),
            JSON.stringify(refreshSessionCommand.get()),
        );
    });
});
