import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { accountEntityRelationFactory } from '#app/__tests__/factories/account-entity-relation.factory.js';
import { accountFactory } from '#app/__tests__/factories/account.factory.js';
import { contactDetailEntityRelationFactory } from '#app/__tests__/factories/contact-detail-entity-relation.factory.js';
import { contactDetailFactory } from '#app/__tests__/factories/contact-detail.factory.js';
import { personEntityRelationFactory } from '#app/__tests__/factories/person-entity-relation.factory.js';
import { personFactory } from '#app/__tests__/factories/person.factory.js';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { UserEntityType } from '#app/shared/authorization/tool/index.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { AccountEntityRelationType } from '#app/modules/account/domain/account-entity-relation.enum.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';
import { OrderByDirection } from '#app/shared/query-connection/index.js';
import { AccountConnectionResponse } from '#app/modules/account/http/v1/response/account.list.response.js';
import { AccountListQuery } from '#app/modules/account/http/v1/request/account.list.request.js';

describe('AccountList', async () => {
    it('successfully list accounts', async t => {
        const subscription = await subscriptionFactory().save();
        const person = await personFactory().save();
        await personEntityRelationFactory().save({
            personId: person.id,
            entityType: PersonEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });
        const contactDetail = await contactDetailFactory().save({
            tag: ContactDetailTag.APP_SIGNUP,
            type: ContactDetailType.EMAIL,
            entityType: ContactDetailEntityType.PERSON,
            entityId: person.id,
        });
        await contactDetailEntityRelationFactory().save({
            contactDetailId: contactDetail.id,
            entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });
        const accountOne = await accountFactory().save({
            entityId: person.id,
            entityType: UserEntityType.PERSON,
        });
        await accountEntityRelationFactory().save({
            accountId: accountOne.id,
            entityType: AccountEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const user = userFactory({
            accountId: accountOne.id,
            entityId: person.id,
            entityType: UserEntityType.PERSON,
            subscriptionId: subscription.id,
        });

        const accountTwo = await accountFactory().save({
            entityId: person.id,
            entityType: UserEntityType.PERSON,
        });
        await accountEntityRelationFactory().save({
            accountId: accountTwo.id,
            entityType: AccountEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const accountThree = await accountFactory().save({
            entityId: person.id,
            entityType: UserEntityType.PERSON,
        });
        await accountEntityRelationFactory().save({
            accountId: accountThree.id,
            entityType: AccountEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.get<AccountConnectionResponse, AccountListQuery>(
            API_PREFIX_V1 + '/accounts',
            {
                orderBy: { field: 'created_at', direction: OrderByDirection.DESC },
                first: 10,
            },
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.pageInfo.totalCount, 3);

        assert.equal(!!data.edges.find(edge => edge.node.id === accountOne.id), true);
        assert.equal(!!data.edges.find(edge => edge.node.id === accountTwo.id), true);
        assert.equal(!!data.edges.find(edge => edge.node.id === accountThree.id), true);
    });

    it('filters accounts by person lastName and returns entity with person data', async t => {
        const subscription = await subscriptionFactory().save();

        const personSmith = await personFactory().save({
            firstName: 'John',
            lastName: 'Smith',
        });
        await personEntityRelationFactory().save({
            personId: personSmith.id,
            entityType: PersonEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });
        const contactDetailSmith = await contactDetailFactory().save({
            tag: ContactDetailTag.APP_SIGNUP,
            type: ContactDetailType.EMAIL,
            entityType: ContactDetailEntityType.PERSON,
            entityId: personSmith.id,
        });
        await contactDetailEntityRelationFactory().save({
            contactDetailId: contactDetailSmith.id,
            entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });
        const accountSmith = await accountFactory().save({
            entityId: personSmith.id,
            entityType: UserEntityType.PERSON,
        });
        await accountEntityRelationFactory().save({
            accountId: accountSmith.id,
            entityType: AccountEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const personJones = await personFactory().save({
            firstName: 'Jane',
            lastName: 'Jones',
        });
        await personEntityRelationFactory().save({
            personId: personJones.id,
            entityType: PersonEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });
        const contactDetailJones = await contactDetailFactory().save({
            tag: ContactDetailTag.APP_SIGNUP,
            type: ContactDetailType.EMAIL,
            entityType: ContactDetailEntityType.PERSON,
            entityId: personJones.id,
        });
        await contactDetailEntityRelationFactory().save({
            contactDetailId: contactDetailJones.id,
            entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });
        const accountJones = await accountFactory().save({
            entityId: personJones.id,
            entityType: UserEntityType.PERSON,
        });
        await accountEntityRelationFactory().save({
            accountId: accountJones.id,
            entityType: AccountEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const user = userFactory({
            accountId: accountSmith.id,
            entityId: personSmith.id,
            entityType: UserEntityType.PERSON,
            subscriptionId: subscription.id,
        });

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });

        const result = await testApi.get<AccountConnectionResponse, AccountListQuery>(
            API_PREFIX_V1 + '/accounts',
            {
                filters: [{ person__lastName: { eq: 'Smith' } }],
                orderBy: { field: 'created_at', direction: OrderByDirection.DESC },
                first: 10,
            },
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.pageInfo.totalCount, 1);
        assert.equal(data.edges.length, 1);

        const node = data.edges[0].node;
        assert.equal(node.id, accountSmith.id);
        assert.equal(node.entityType, UserEntityType.PERSON);
        assert.equal(node.entityId, personSmith.id);

        assert.equal(node.entity.id, personSmith.id);
        assert.equal(node.entity.firstName, 'John');
        assert.equal(node.entity.lastName, 'Smith');
    });
});
