import { getLogger } from '#app/shared/logging/index.js';
import { events } from '#app/shared/kafka/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { SubscriptionEntity } from '#app/modules/subscription/domain/subscription.entity.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/domain/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

export class SubscriptionUpdatedEventHandler extends AbstractService<
    events.v1.SubscriptionsSubscriptionUpdatedEvent,
    SubscriptionEntity | undefined
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        event: events.v1.SubscriptionsSubscriptionUpdatedEvent,
    ): Promise<SubscriptionEntity | undefined> {
        const l = this.l.child({ ctx: event });
        l.info('start');

        const existing = await this.subscriptionRepository.getOneWithRelations(
            event.content.subscriptionId,
        );

        const isUpdateReflected =
            existing?.id === event.content.subscriptionId &&
            existing?.name === event.content.name &&
            existing?.createdAt.toString() === event.content.createdAt &&
            existing?.createdBy === event.content.createdBy &&
            existing?.updatedAt.toString() === event.content.updatedAt &&
            existing?.updatedBy === event.content.updatedBy;

        if (existing && !isUpdateReflected) {
            const updated = existing.update(event.content, {
                accountId: event.content.updatedBy,
            } as User);
            await this.subscriptionRepository.preserve(event.content.subscriptionId, updated);

            l.info('success adding changes to subscription');
            return updated;
        }

        l.info('success ensure');
        return existing;
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'SubscriptionUpdatedEventHandler',
        });
    }
}
