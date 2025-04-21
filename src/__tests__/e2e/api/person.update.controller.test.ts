import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { faker } from '@faker-js/faker';
import { personEntityRelationFactory } from '#app/__tests__/factories/person-entity-relation.factory.js';
import { personFactory } from '#app/__tests__/factories/person.factory.js';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { PersonUpdateBody } from '#app/modules/person/http/v1/request/person.update.request.js';
import { PersonResponse } from '#app/modules/person/http/v1/index.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';

describe('PersonUpdate', async () => {
    it('successfully update person', async t => {
        const subscription = await subscriptionFactory().save();
        const person = await personFactory().save();
        await personEntityRelationFactory().save({
            personId: person.id,
            entityType: PersonEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const request = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        };

        const user = userFactory({
            entityId: person.id,
            entityType: UserEntityType.PERSON,
            subscriptionId: subscription.id,
        });

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.post<PersonUpdateBody, PersonResponse>(
            API_PREFIX_V1 + `/persons/${person.id}`,
            request,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.id, person.id);
        assert.equal(data.firstName, request.firstName);
        assert.equal(data.lastName, request.lastName);
    });
});
