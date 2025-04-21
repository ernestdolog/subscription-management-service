import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { LoginCommand } from '#app/shared/aws-cognito/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { AuthenticationLoginRequest } from '#app/modules/authentication/http/v1/request/authentication.login.request.js';
import { AuthenticationResponse } from '#app/modules/authentication/http/v1/index.js';

describe('AuthenticationLogin', async () => {
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

    it('successfully authenticate user', async t => {
        const request = {
            email: faker.internet.email(),
            password: faker.internet.password(),
        };

        const awsCognitoClientSend = t.mock.method(CognitoIdentityProviderClient.prototype, 'send');
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 0);

        const testApi = useTestApplication({
            isAuthorized: false,
        });
        const result = await testApi.post<AuthenticationLoginRequest, AuthenticationResponse>(
            API_PREFIX_V1 + '/authentications/login',
            request,
        );

        const expectedResult = {
            token: commandResult.AuthenticationResult!.IdToken!,
            refreshToken: commandResult.AuthenticationResult!.RefreshToken!,
            expires: Number(commandResult.AuthenticationResult!.ExpiresIn!),
        };

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.deepEqual(data, expectedResult);

        /**
         * clients called 1-1 time
         */
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 1);
        /**
         * Cognito command send client was called with correct input
         */
        const loginCommand = new LoginCommand({
            email: request.email,
            password: request.password,
        });
        const awsCognitoClientSendCall = awsCognitoClientSend.mock.calls[0];
        assert.equal(
            JSON.stringify(awsCognitoClientSendCall.arguments[0]),
            JSON.stringify(loginCommand.get()),
        );
    });
});
