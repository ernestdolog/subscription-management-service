import '#app/__tests__/database.setup.js';
import { useTestApplication } from '#app/__tests__/api-client.setup.js';
import { it, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { subscriptionFactory } from '#app/__tests__/factories/subscription.factory.js';
import { faker } from '@faker-js/faker';
import { userFactory } from '#app/__tests__/factories/user.factory.js';
import { accountCreateEmailSendClient } from '#app/shared/email/account-create.email.client.js';
import { AccountCreateBody } from '#app/modules/account/http/v1/request/account.create.request.js';
import { AccountResponse } from '#app/modules/account/http/v1/index.js';
import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { getTypeOrmPersonRepository } from '#app/modules/person/infrastructure/person.typeorm.repository.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import {
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/contact-detail.enum.js';

describe('AccountCreate', async () => {
    before(async () => {
        /**
         * Hit out client instantiation:
         */
        accountCreateEmailSendClient.send = (() => {}) as never;
    });

    it('successfully create account', async test => {
        const sendEmail = test.mock.method(accountCreateEmailSendClient, 'send');
        assert.strictEqual(sendEmail.mock.calls.length, 0);

        const subscription = await subscriptionFactory().save();
        const user = userFactory({ subscriptionId: subscription.id });

        const command = {
            subscriptionId: subscription.id,
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
        };

        const testApi = useTestApplication({
            isAuthorized: true,
            user,
        });
        const result = await testApi.post<AccountCreateBody, AccountResponse>(
            API_PREFIX_V1 + `/accounts`,
            command,
        );

        assert.deepEqual(result.ok, true);
        assert.deepEqual(result.status, 201);

        const data = await result.json();

        assert.equal(data.person?.contactDetails[0].detail, command.email);
        assert.equal(data.person?.firstName, command.firstName);
        assert.equal(data.person?.lastName, command.lastName);

        assert.equal(data.isActive, false);

        /**
         * sent 1 email
         */
        assert.strictEqual(sendEmail.mock.calls.length, 1);

        /**
         * find created records in database
         */
        const transaction = new TypeOrmTransactionManager();

        const personTypeOrmRepository = getTypeOrmPersonRepository(transaction);

        const person = await personTypeOrmRepository.findOneOrFail({
            where: { id: data.person.id },
            relations: { contactDetails: true },
        });

        const contactDetailEmail = person.contactDetails.find(
            contactDetail =>
                contactDetail.type === ContactDetailType.EMAIL &&
                contactDetail.tag === ContactDetailTag.APP_SIGNUP,
        );

        assert.equal(contactDetailEmail!.detail, command.email);
    });
});
