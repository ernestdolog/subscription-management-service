import { getLogger } from '#app/shared/logging/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import {
    AccountEntityRelationRepository,
    AccountRepository,
    getAccountEntityRelationRepository,
    getAccountRepository,
} from '#app/modules/account/domain/index.js';
import {
    getPersonEntityRelationRepository,
    getPersonRepository,
    PersonEntityRelationRepository,
    PersonRepository,
} from '#app/modules/person/domain/index.js';
import {
    ContactDetailEntityRelationRepository,
    ContactDetailRepository,
    getContactDetailEntityRelationRepository,
    getContactDetailRepository,
} from '#app/modules/contact-detail/domain/index.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { AccountEntity, AccountEntityRelationType } from '../domain/index.js';
import { PersonAccountSendInvitationHandler } from './person-account.send-invitation.handler.js';

type AccountCreateHandlerCommand = {
    firstName: string | null;
    lastName: string | null;
    email: string;
    user: User;
};

export class AccountCreateHandler extends AbstractService<
    AccountCreateHandlerCommand,
    AccountEntity
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(command: AccountCreateHandlerCommand): Promise<AccountEntity> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const account = await this.createAccount(command);

        if (account.entityType === UserEntityType.PERSON) {
            const res = await this.sendInvitation.run({ id: account.id, user: command.user });
            l.info('success');
            return res;
        }

        l.info('success');
        return account;
    }

    private async createAccount(command: AccountCreateHandlerCommand): Promise<AccountEntity> {
        const l = this.l.child({ ctx: { command }, fn: 'createAccount' });
        l.info('receive');
        const person = await this.personRepository.preserveNew(
            {
                firstName: command.firstName,
                lastName: command.lastName,
            },
            command.user,
        );
        l.info('preson created');
        const account = await this.accountRepository.preserveNew(
            {
                entityType: UserEntityType.PERSON,
                entity: person,
            },
            command.user,
        );

        l.info('account created');

        const personEntityRelation = await this.personEntityRelationRepository.preserveNew(
            {
                personId: person.id,
                entityType: PersonEntityRelationType.SUBSCRIPTION,
                entityId: command.user.subscriptionId,
            },
            command.user,
        );
        person.addEntityRelation(personEntityRelation);

        const contactDetail = await this.contactDetailRepository.preserveNew(
            {
                entityType: ContactDetailEntityType.PERSON,
                entityId: person.id,
                type: ContactDetailType.EMAIL,
                tag: ContactDetailTag.APP_SIGNUP,
                detail: command.email,
            },
            command.user,
        );
        person.addContactDetails(contactDetail);
        l.info('contact detail created');
        const contactDetailEntityRelation =
            await this.contactDetailEntityRelationRepository.preserveNew(
                {
                    contactDetailId: contactDetail.id,
                    entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
                    entityId: command.user.subscriptionId,
                },
                command.user,
            );
        contactDetail.addEntityRelation(contactDetailEntityRelation);

        const accountEntityRelation = await this.accountEntityRelationRepository.preserveNew(
            {
                accountId: account.id,
                entityType: AccountEntityRelationType.SUBSCRIPTION,
                entityId: command.user.subscriptionId,
            },
            command.user,
        );
        account.addEntityRelation(accountEntityRelation);
        l.info('success');
        return account;
    }

    private get personRepository(): PersonRepository {
        return getPersonRepository(this.manager);
    }

    private get personEntityRelationRepository(): PersonEntityRelationRepository {
        return getPersonEntityRelationRepository(this.manager);
    }

    private get accountRepository(): AccountRepository {
        return getAccountRepository(this.manager);
    }

    private get accountEntityRelationRepository(): AccountEntityRelationRepository {
        return getAccountEntityRelationRepository(this.manager);
    }

    private get contactDetailRepository(): ContactDetailRepository {
        return getContactDetailRepository(this.manager);
    }

    private get contactDetailEntityRelationRepository(): ContactDetailEntityRelationRepository {
        return getContactDetailEntityRelationRepository(this.manager);
    }

    private get sendInvitation(): PersonAccountSendInvitationHandler {
        return new PersonAccountSendInvitationHandler(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'AccountCreateHandler',
        });
    }
}
