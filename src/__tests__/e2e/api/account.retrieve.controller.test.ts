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
import { AccountResponse } from '#app/modules/account/http/v1/index.js';
import { AccountEntityRelationType } from '#app/modules/account/domain/account-entity-relation.enum.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';

describe('AccountRetrieve', async () => {
    it('successfully retrieve account', async t => {
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
        });
        const result = await testApi.get<AccountResponse>(
            API_PREFIX_V1 + `/accounts/${account.id}`,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.id, account.id);

        assert.equal(data.isActive, false);

        assert.equal(data.person?.id, person.id);
        assert.equal(data.person?.firstName, person.firstName);
        assert.equal(data.person?.lastName, person.lastName);

        assert.equal(data.person?.contactDetails[0].id, contactDetail.id);
        assert.equal(data.person?.contactDetails[0].detail, contactDetail.detail);
    });
});
