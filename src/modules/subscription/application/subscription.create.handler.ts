import { appConfig } from '#app/configs/app.config.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import { SubscriptionCreateEmail } from '#app/shared/aws-ses/index.js';
import { subscriptionCreateEmailSendClient } from '#app/shared/email/subscription-create.email.client.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { messages } from '#app/shared/kafka/index.js';
import { EventEntityType, EventType } from '#app/shared/kafka/messages/kafka.message.enum.js';
import { getLogger } from '#app/shared/logging/index.js';
import { getRequestId } from '#app/shared/logging/plugins/fastify/fastify.request-id.context.js';
import { messageProducer } from '#app/shared/producers/index.js';
import { SubscriptionEntity } from '../domain/subscription.entity.js';
import {
    ContactDetailEntityRelationType,
    ContactDetailEntityType,
    ContactDetailTag,
    ContactDetailType,
} from '#app/modules/contact-detail/domain/index.js';
import { AccountEntity } from '#app/modules/account/domain/account.entity.js';
import { PersonEntityRelationType } from '#app/modules/person/domain/index.js';
import {
    AccountEntityRelationType,
    AccountInvitationEntity,
} from '#app/modules/account/domain/index.js';
import { getSubscriptionRepository, SubscriptionRepository } from '../infrastructure/index.js';
import {
    getPersonEntityRelationRepository,
    getPersonRepository,
    PersonEntityRelationRepository,
    PersonRepository,
} from '#app/modules/person/infrastructure/index.js';
import {
    AccountEntityRelationRepository,
    AccountInvitationRepository,
    AccountRepository,
    getAccountEntityRelationRepository,
    getAccountInvitationRepository,
    getAccountRepository,
} from '#app/modules/account/infrastructure/index.js';
import {
    ContactDetailEntityRelationRepository,
    ContactDetailRepository,
    getContactDetailEntityRelationRepository,
    getContactDetailRepository,
} from '#app/modules/contact-detail/infrastructure/index.js';

type SubscriptionCreateCommand = {
    subscriptionName: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
};

export class SubscriptionCreateHandler extends AbstractService<
    SubscriptionCreateCommand,
    SubscriptionEntity
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        command: SubscriptionCreateCommand,
    ): Promise<SubscriptionEntity> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        await this.validate(command);

        const subscription = await this.subscriptionRepository.preserveNew({
            name: command.subscriptionName,
        });

        const account = await this.createAccount(command, subscription.id);
        subscription.addAccount(account);

        const invitation = await this.createInvitation(account);

        await this.sendEmail(account, invitation);

        const message = new messages.v1.SubscriptionsSubscriptionCreateMessage({
            type: EventType.CREATE,
            entityType: EventEntityType.SUBSCRIPTION,
            entityId: subscription.id,
            subscriptionId: subscription.id,
            name: subscription.name,
            updatedAt: subscription.updatedAt.toString(),
            updatedBy: subscription.updatedBy,
            createdAt: subscription.createdAt.toString(),
            createdBy: subscription.createdBy,
        });

        await messageProducer.publish(message);

        l.info('success');
        return subscription;
    }

    private async validate(command: SubscriptionCreateCommand) {
        const isEmailAlreadyTaken = await this.contactDetailRepository.isEmailAlreadyTaken(
            command.email,
        );
        if (isEmailAlreadyTaken) {
            throw new InternalServerError(CommonError.CONFLICT, {
                resource: ContactDetailType.EMAIL,
                value: command.email,
            });
        }
    }

    private async createAccount(
        properties: Omit<SubscriptionCreateCommand, 'subscriptionName'>,
        subscriptionId: string,
    ): Promise<AccountEntity> {
        const l = this.l.child({ ctx: { properties, subscriptionId }, fn: 'createAccount' });
        l.info('receive');
        const person = await this.personRepository.preserveNew({
            firstName: properties.firstName,
            lastName: properties.lastName,
        });
        l.info('person created');
        const account = await this.accountRepository.preserveNew({
            entityType: UserEntityType.PERSON,
            entity: person,
        });
        const user: User = {
            accountId: account.id,
            entityId: person.id,
            entityType: UserEntityType.PERSON,
            subscriptionId,
        };
        const accountEntityRelation = await this.accountEntityRelationRepository.preserveNew(
            {
                accountId: account.id,
                entityType: AccountEntityRelationType.SUBSCRIPTION,
                entityId: subscriptionId,
            },
            user,
        );
        account.addEntityRelation(accountEntityRelation);
        l.info('account created');

        const personEntityRelation = await this.personEntityRelationRepository.preserveNew(
            {
                personId: person.id,
                entityType: PersonEntityRelationType.SUBSCRIPTION,
                entityId: subscriptionId,
            },
            user,
        );

        person.addEntityRelation(personEntityRelation);

        const contactDetail = await this.contactDetailRepository.preserveNew(
            {
                entityType: ContactDetailEntityType.PERSON,
                entityId: person.id,
                type: ContactDetailType.EMAIL,
                tag: ContactDetailTag.APP_SIGNUP,
                detail: properties.email,
            },
            user,
        );
        l.info('contact detail created');
        const contactDetailEntityRelation =
            await this.contactDetailEntityRelationRepository.preserveNew(
                {
                    contactDetailId: contactDetail.id,
                    entityType: ContactDetailEntityRelationType.SUBSCRIPTION,
                    entityId: subscriptionId,
                },
                user,
            );
        contactDetail.addEntityRelation(contactDetailEntityRelation);
        person.addContactDetails(contactDetail);

        l.info('success');
        return account;
    }

    private async createInvitation(account: AccountEntity) {
        const l = this.l.child({ ctx: { account }, fn: 'createInvitation' });
        l.info('receive');

        const accountInvitation = await this.accountInvitationRepository.provide(
            account.id,
            account.toUser(),
        );
        account.invitations = [accountInvitation];
        l.info('success');
        return accountInvitation;
    }

    private async sendEmail(account: AccountEntity, accountInvitation: AccountInvitationEntity) {
        const contactDetail = account.entity!.contactDetails.find(
            contactDetail =>
                contactDetail.type === ContactDetailType.EMAIL &&
                contactDetail.tag === ContactDetailTag.APP_SIGNUP,
        )!;
        const to = [contactDetail.detail];
        const email = this.getEmail(accountInvitation.token, contactDetail.detail);
        const l = this.l.child({
            ctx: { to, email, accountInvitation },
            fn: 'createSubscriptionSendVerificationEmail',
        });
        l.info('receive');
        await subscriptionCreateEmailSendClient.send({ to: [contactDetail.detail], email });
        l.info('success');
    }

    private getEmail(invitationToken: string, emailAddress: string): SubscriptionCreateEmail {
        const email = new SubscriptionCreateEmail({
            variables: {
                link: `${appConfig.aws.cloudFront.url}/register/complete?token=${invitationToken}&email=${emailAddress}`,
            },
            tagAttributes: {
                message_id: getRequestId(),
            },
        });
        return email;
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
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

    private get accountInvitationRepository(): AccountInvitationRepository {
        return getAccountInvitationRepository(this.manager);
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

    private get l() {
        return getLogger().child({
            cls: 'SubscriptionCreateHandler',
        });
    }
}
