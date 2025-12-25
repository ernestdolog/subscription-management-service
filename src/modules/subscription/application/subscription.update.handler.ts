import { AbstractHandler } from '#app/shared/abstract.handler.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { SubscriptionEntityEventMapper } from '../domain/index.js';
import { eventProducer } from '#app/shared/producers/index.js';
import { SubscriptionEntity } from '../domain/subscription.entity.js';
import { getSubscriptionRepository, SubscriptionRepository } from '../domain/index.js';

type SubscriptionUpdateCommand = {
    id: string;
    name?: string;
    user: User;
};

export class SubscriptionUpdateHandler extends AbstractHandler<
    SubscriptionUpdateCommand,
    SubscriptionEntity
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        command: SubscriptionUpdateCommand,
    ): Promise<SubscriptionEntity> {
        const l = this.l.child({ ctx: command });
        l.info('start');

        const subscription = await this.subscriptionRepository.getOneWithRelations(
            command.id,
            command.user,
        );
        if (!subscription)
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Subscription' });

        const updatedSubscription = subscription.update(command, command.user);
        await this.subscriptionRepository.preserve(command.id, updatedSubscription);

        await eventProducer.publish(SubscriptionEntityEventMapper.toUpdatedEvent(subscription));

        l.info('success');
        return subscription;
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'SubscriptionUpdateHandler',
        });
    }
}
