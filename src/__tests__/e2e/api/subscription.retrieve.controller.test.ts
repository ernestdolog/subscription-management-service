import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { personFactory } from '#app/__tests__/factories/person.factory.js';
import { accountEntityRelationFactory } from '#app/__tests__/factories/account-entity-relation.factory.js';
import { accountFactory } from '#app/__tests__/factories/account.factory.js';
import { contactDetailEntityRelationFactory } from '#app/__tests__/factories/contact-detail-entity-relation.factory.js';
import { contactDetailFactory } from '#app/__tests__/factories/contact-detail.factory.js';
import { personEntityRelationFactory } from '#app/__tests__/factories/person-entity-relation.factory.js';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { SubscriptionResponse } from '#app/modules/subscription/http/v1/index.js';
import { AccountEntityRelationType } from '#app/modules/account/domain/index.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';

describe('SubscriptionUpdate', async () => {
    it('successfully retrieve subscription', async t => {
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
        const account = await accountFactory().save({
            entityId: person.id,
            entityType: UserEntityType.PERSON,
        });
        await accountEntityRelationFactory().save({
            accountId: account.id,
            entityType: AccountEntityRelationType.SUBSCRIPTION,
            entityId: subscription.id,
        });

        const user = userFactory({
            accountId: account.id,
            entityId: person.id,
            entityType: UserEntityType.PERSON,
            subscriptionId: subscription.id,
        });

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
            headers: {
                'Content-type': 'application/json',
            },
        });
        const result = await testApi.get<SubscriptionResponse>(
            API_PREFIX_V1 + `/subscriptions/${subscription.id}`,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.id, subscription.id);

        assert.equal(data.accounts[0].person?.id, person.id);
        assert.equal(data.accounts[0].id, account.id);

        assert.equal(data.accounts[0].person?.contactDetails[0].id, contactDetail.id);
    });
});
