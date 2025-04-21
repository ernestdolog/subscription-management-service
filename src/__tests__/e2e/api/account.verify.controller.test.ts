import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { faker } from '@faker-js/faker';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { AccountCreateBody } from '#app/modules/account/http/v1/request/account.create.request.js';
import { AccountResponse } from '#app/modules/account/http/v1/index.js';
import { UserCreateHandler } from '#app/modules/authentication/application/user.create.handler.js';

describe('AccountVerify', async () => {
    const subscription = await subscriptionFactory().save();
    const user = userFactory({ subscriptionId: subscription.id });
    before(async () => {
        /**
         * Hit out external functionalities:
         */
        UserCreateHandler.prototype.execute = () => user as unknown as Promise<User>;
    });

    it('successfully create account', async t => {
        const request = {
            subscriptionId: subscription.id,
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        };

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.put<AccountCreateBody, AccountResponse>(
            API_PREFIX_V1 + `/accounts`,
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 201);

        const data = await result.json();

        assert.equal(data.person?.contactDetails[0].detail, request.email);
        assert.equal(data.person?.firstName, request.firstName);
        assert.equal(data.person?.lastName, request.lastName);

        assert.equal(data.isActive, true);
    });
});
