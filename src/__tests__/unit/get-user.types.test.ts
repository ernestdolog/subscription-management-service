import { faker } from '@faker-js/faker';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';
import { AdminGetUserCommandOutput, UserType } from '@aws-sdk/client-cognito-identity-provider';
import { userFactory } from '../factories/user.factory.js';
import { CognitoUser } from '#app/shared/authorization/tool/index.js';

describe('CognitoUser', { concurrency: true }, () => {
    it('converts from AdminGetUserCommandOutput class successfully', t => {
        const user = userFactory();
        /**
         * Assume AWS stores necessary parameters always in correct format
         */
        const cognitoUser = {
            Username: faker.internet.userName(),
            UserAttributes: [
                {
                    Name: 'custom:account_id',
                    Value: user.accountId,
                },
                {
                    Name: 'custom:entity_type',
                    Value: user.entityType,
                },
                {
                    Name: 'custom:entity_id',
                    Value: user.entityId,
                },
                {
                    Name: 'custom:subscription_id',
                    Value: user.subscriptionId.toString(),
                },
            ],
        } as AdminGetUserCommandOutput;

        const attributes = cognitoUser?.UserAttributes?.reduce(
            (accumulate, curr) => {
                if (!curr.Name || !curr.Value) return accumulate;
                accumulate[curr.Name] = curr.Value;
                return accumulate;
            },
            {} as Record<string, string>,
        );

        const resolvedUser = new CognitoUser(attributes).deserialize();

        assert.equal(JSON.stringify(user), JSON.stringify(resolvedUser));
    });

    it('converts from UserType class successfully', t => {
        const user = userFactory();
        /**
         * Assume AWS stores necessary parameters always in correct format
         */
        const cognitoUser = {
            Username: faker.internet.userName(),
            Attributes: [
                {
                    Name: 'custom:account_id',
                    Value: user.accountId,
                },
                {
                    Name: 'custom:entity_type',
                    Value: user.entityType,
                },
                {
                    Name: 'custom:entity_id',
                    Value: user.entityId,
                },
                {
                    Name: 'custom:subscription_id',
                    Value: user.subscriptionId.toString(),
                },
            ],
        } as UserType;

        const attributes = cognitoUser?.Attributes?.reduce(
            (accumulate, curr) => {
                if (!curr.Name || !curr.Value) return accumulate;
                accumulate[curr.Name] = curr.Value;
                return accumulate;
            },
            {} as Record<string, string>,
        );

        const resolvedUser = new CognitoUser(attributes).deserialize();

        assert.equal(JSON.stringify(user), JSON.stringify(resolvedUser));
    });
});
