import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { AccountEntity } from '../domain/account.entity.js';
import { AccountInvitationRepository, getAccountInvitationRepository } from '../domain/index.js';
import { UserCreateHandler } from '#app/modules/authentication/application/index.js';
import { AccountEntityRelationType } from '../domain/index.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/domain/subscription.repository.js';
import { ContactDetailTag, ContactDetailType } from '#app/modules/contact-detail/domain/index.js';

type PersonAccountVerifyCommand = {
    token: string;
    password: string;
};

export class PersonAccountVerifyHandler extends AbstractService<
    PersonAccountVerifyCommand,
    AccountEntity<UserEntityType.PERSON>
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        command: PersonAccountVerifyCommand,
    ): Promise<AccountEntity<UserEntityType.PERSON>> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const invitation = await this.accountInvitationRepository.getOne(command.token);
        if (!invitation) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Invitation' });
        }
        if (!invitation.account) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Account' });
        }

        const account = invitation.account;
        const user = await this.provideLoginUser(account, command.password);

        const revokedIncitation = invitation.revoke(user);

        await this.accountInvitationRepository.preserve(invitation.id, revokedIncitation);

        l.info('success');
        return account;
    }

    private async provideLoginUser(
        account: AccountEntity<UserEntityType.PERSON>,
        password: string,
    ): Promise<User> {
        const l = this.l.child({ ctx: { account, password }, fn: 'provideLoginUser' });
        l.info('receive');

        if (!account.entity) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Person' });
        }
        const person = account.entity;

        const subscriptionId = account.entityRelations?.find(
            entityRelation => entityRelation.entityType === AccountEntityRelationType.SUBSCRIPTION,
        )?.entityId!;
        const subscription = await this.subscriptionRepository.getOne(subscriptionId);
        if (!subscription) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Subscription' });
        }

        const contactDetail = person?.contactDetails.find(
            contactDetail =>
                contactDetail.type === ContactDetailType.EMAIL &&
                contactDetail.tag === ContactDetailTag.APP_SIGNUP,
        )!;

        const createUserCommand = {
            email: contactDetail.detail,
            password: password,
            accountId: account.id,
            entityType: UserEntityType.PERSON,
            entityId: person.id,
            subscriptionId: subscription.id,
        };

        const user = await this.createUser.execute(createUserCommand);

        l.info('success');
        return user;
    }

    private get createUser(): UserCreateHandler {
        return new UserCreateHandler();
    }

    private get accountInvitationRepository(): AccountInvitationRepository {
        return getAccountInvitationRepository(this.manager);
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'PersonAccountVerifyHandler',
        });
    }
}
