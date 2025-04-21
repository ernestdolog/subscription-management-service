import { appConfig } from '#app/configs/app.config.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { AccountCreateEmail } from '#app/shared/aws-ses/index.js';
import { accountCreateEmailSendClient } from '#app/shared/email/account-create.email.client.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { getRequestId } from '#app/shared/logging/plugins/fastify/fastify.request-id.context.js';
import { AccountEntity } from '../domain/account.entity.js';
import { AccountInvitationEntity } from '../domain/account-invitation.entity.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/infrastructure/index.js';
import {
    AccountInvitationRepository,
    AccountRepository,
    getAccountInvitationRepository,
    getAccountRepository,
} from '../infrastructure/index.js';
import { ContactDetailTag, ContactDetailType } from '#app/modules/contact-detail/domain/index.js';
import { PersonEntity } from '#app/modules/person/domain/person.entity.js';

type PersonAccountSendInvitationCommand = {
    id: string;
    user: User;
};

export class PersonAccountSendInvitationHandler extends AbstractService<
    PersonAccountSendInvitationCommand,
    AccountEntity
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        command: PersonAccountSendInvitationCommand,
    ): Promise<AccountEntity> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const account: AccountEntity<UserEntityType.PERSON> | undefined =
            await this.accountRepository.getOneWithRelations(command.id, command.user);
        if (!account) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Account' });
        }
        if (account.entityType !== UserEntityType.PERSON) {
            throw new InternalServerError(CommonError.FORBIDDEN);
        }
        if (!account.entity) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Person' });
        }
        const person = account.entity;

        if (!account.isInvited()) {
            const invitation = await this.accountInvitationRepository.provide(
                account.id,
                command.user,
            );
            account.addInvitation(invitation);
        }

        await this.sendEmail(command.user, person, account.invitations[0]);

        l.info('success');
        return account;
    }

    private async sendEmail(
        user: User,
        person: PersonEntity,
        accountInvitation: AccountInvitationEntity,
    ) {
        const contactDetail = person.contactDetails.find(
            contactDetail =>
                contactDetail.type === ContactDetailType.EMAIL &&
                contactDetail.tag === ContactDetailTag.APP_SIGNUP,
        )!;
        const subscription = await this.subscriptionRepository.getOne(user.subscriptionId, user);
        if (!subscription)
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Subscription' });

        const to = [contactDetail.detail];
        const email = this.getEmail(
            accountInvitation.token,
            subscription.name,
            contactDetail.detail,
        );

        const l = this.l.child({
            ctx: { to, email, accountInvitation },
            fn: 'sendEmail',
        });
        l.info('receive');

        await accountCreateEmailSendClient.send({ email, to });

        l.info('success');
    }

    private getEmail(
        invitationToken: string,
        subscriptionName: string,
        emailAddress: string,
    ): AccountCreateEmail {
        const email = new AccountCreateEmail({
            variables: {
                link: this.getProfileLink(invitationToken, emailAddress),
                subscriptionName: subscriptionName,
            },
            tagAttributes: {
                message_id: getRequestId(),
            },
        });
        return email;
    }

    private getProfileLink(invitationToken: string, emailAddress: string) {
        return `${appConfig.aws.cloudFront.url}/register/complete?token=${invitationToken}&email=${emailAddress}`;
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
    }

    private get accountRepository(): AccountRepository {
        return getAccountRepository(this.manager);
    }

    private get accountInvitationRepository(): AccountInvitationRepository {
        return getAccountInvitationRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'PersonAccountSendInvitationHandler',
        });
    }
}
