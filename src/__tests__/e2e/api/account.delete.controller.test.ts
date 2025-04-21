import '#app/__tests__/database.setup.js';
import assert from 'node:assert/strict';
import { useTestApplication } from '#app/__tests__//api-client.setup.js';
import { it, describe, before } from 'node:test';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { personFactory } from '#app/__tests__/factories/person.factory.js';
import { personEntityRelationFactory } from '#app/__tests__/factories/person-entity-relation.factory.js';
import { contactDetailEntityRelationFactory } from '#app/__tests__/factories/contact-detail-entity-relation.factory.js';
import { contactDetailFactory } from '#app/__tests__/factories/contact-detail.factory.js';
import { accountEntityRelationFactory } from '#app/__tests__/factories/account-entity-relation.factory.js';
import { accountFactory } from '#app/__tests__/factories/account.factory.js';
import { UserEntityType } from '#app/shared/authorization/tool/authorization.user.enum.js';
import { accountInvitationFactory } from '#app/__tests__/factories/account-invitation.factory.js';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { UserDeleteHandler } from '#app/modules/authentication/application/user.delete.handler.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { AccountEntityRelationType } from '#app/modules/account/domain/index.js';
import { AccountResponse } from '#app/modules/account/http/v1/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { getTypeOrmAccountRepository } from '#app/modules/account/infrastructure/account.typeorm.repository.js';
import { getTypeOrmAccountInvitationRepository } from '#app/modules/account/infrastructure/account-invitation.typeorm.repository.js';
import { getTypeOrmContactDetailRepository } from '#app/modules/contact-detail/infrastructure/contact-detail.typeorm.repository.js';
import { getTypeOrmPersonRepository } from '#app/modules/person/infrastructure/person.typeorm.repository.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

describe('AccountDelete', async () => {
    before(async () => {
        /**
         * Hit out external functionalities:
         */
        UserDeleteHandler.prototype.execute = (() => {}) as never;
    });

    it('successfully delete account', async t => {
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
        await accountInvitationFactory().save({ accountId: account.id, isValid: true });

        const actingPerson = await personFactory().save();
        const actingAccount = await accountFactory().save({
            entityId: actingPerson.id,
            entityType: UserEntityType.PERSON,
        });

        const user = userFactory({
            accountId: actingAccount.id,
            entityId: actingPerson.id,
            entityType: UserEntityType.PERSON,
            subscriptionId: subscription.id,
        });

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.delete<AccountResponse>(
            API_PREFIX_V1 + `/accounts/${account.id}`,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 200);

        const data = await result.json();

        assert.equal(data.id, account.id);

        assert.equal(data.person?.id, person.id);
        assert.equal(data.person?.firstName, person.firstName);
        assert.equal(data.person?.lastName, person.lastName);

        assert.equal(data.person?.contactDetails[0].id, contactDetail.id);
        assert.equal(data.person?.contactDetails[0].detail, contactDetail.detail);

        assert.equal(data.isActive, false);

        /**
         * find created records in database
         */
        const transaction = new TypeOrmTransactionManager();

        const accountRepository = getTypeOrmAccountRepository(transaction);
        const accountInvitationRepository = getTypeOrmAccountInvitationRepository(transaction);
        const personRepository = getTypeOrmPersonRepository(transaction);
        const contactDetailRepository = getTypeOrmContactDetailRepository(transaction);

        const activeAccounts = await accountRepository.count({ where: { id: account.id } });
        assert.equal(activeAccounts, 0);
        const accountsWithDeleted = await accountRepository.count({
            where: { id: account.id },
            withDeleted: true,
        });
        assert.equal(accountsWithDeleted, 1);

        const activeAccountInvitations = await accountInvitationRepository.count({
            where: { accountId: account.id },
        });
        assert.equal(activeAccountInvitations, 0);
        const accountInvitationsWithDeleted = await accountInvitationRepository.count({
            where: { accountId: account.id },
            withDeleted: true,
        });
        assert.equal(accountInvitationsWithDeleted, 1);

        const activePersons = await personRepository.count({ where: { id: person.id } });
        assert.equal(activePersons, 0);
        const personsWithDeleted = await personRepository.count({
            where: { id: person.id },
            withDeleted: true,
        });
        assert.equal(personsWithDeleted, 1);

        const activeContactDetails = await contactDetailRepository.count({
            where: { id: contactDetail.id },
        });
        assert.equal(activeContactDetails, 0);
        const contactDetailsWithDeleted = await contactDetailRepository.count({
            where: { id: contactDetail.id },
            withDeleted: true,
        });
        assert.equal(contactDetailsWithDeleted, 1);
    });
});
