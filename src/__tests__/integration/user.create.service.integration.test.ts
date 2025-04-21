import '#app/__tests__/database.setup.js';
import { it, describe, before } from 'node:test';
import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { CreateUserCommand, SetPasswordUserCommand } from '#app/shared/aws-cognito/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { UserCreateHandler } from '#app/modules/authentication/application/user.create.handler.js';

describe('UserCreateHandler', async () => {
    before(async () => {
        /**
         * Hit out clients instantiation:
         */
        CognitoIdentityProviderClient.prototype.send = (() => {}) as never;
    });

    it('successfully confirm user', async testContext => {
        const command = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            accountId: faker.string.uuid(),
            entityType: faker.helpers.arrayElement<UserEntityType>(Object.values(UserEntityType)),
            entityId: faker.string.uuid(),
            subscriptionId: faker.string.uuid(),
        };

        const awsCognitoClientSend = testContext.mock.method(
            CognitoIdentityProviderClient.prototype,
            'send',
        );
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 0);

        const service = new UserCreateHandler();

        const data = await service.execute(command);

        /**
         * returns user
         */
        assert.equal(JSON.stringify(data), JSON.stringify(new User(command)));
        /**
         * cognito client called 2 times
         */
        assert.strictEqual(awsCognitoClientSend.mock.calls.length, 2);

        /**
         * Cognito enable user called with correct command
         */
        const createUserCommand = new CreateUserCommand({
            email: command.email,
            accountId: command.accountId,
            entityType: command.entityType,
            entityId: command.entityId,
            subscriptionId: command.subscriptionId,
        });
        const awsCognitoClientFirstCall = awsCognitoClientSend.mock.calls[0];
        assert.equal(
            JSON.stringify(awsCognitoClientFirstCall.arguments[0]),
            JSON.stringify(createUserCommand.get()),
        );
        /**
         * Cognito enable user called with correct command
         */
        const setPasswordUserCommand = new SetPasswordUserCommand({
            accountId: command.accountId,
            password: command.password,
        });
        const awsCognitoClientSecondCall = awsCognitoClientSend.mock.calls[1];
        assert.equal(
            JSON.stringify(awsCognitoClientSecondCall.arguments[0]),
            JSON.stringify(setPasswordUserCommand.get()),
        );
    });
});
