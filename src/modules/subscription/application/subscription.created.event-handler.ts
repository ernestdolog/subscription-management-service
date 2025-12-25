import { getLogger } from '#app/shared/logging/index.js';
import { events } from '#app/shared/kafka/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { SubscriptionEntity } from '#app/modules/subscription/domain/index.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/domain/index.js';

export class SubscriptionCreatedEventHandler extends AbstractService<
    events.v1.SubscriptionsSubscriptionCreatedEvent,
    SubscriptionEntity | undefined
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        event: events.v1.SubscriptionsSubscriptionCreatedEvent,
    ): Promise<SubscriptionEntity | undefined> {
        const l = this.l.child({ ctx: event });
        l.info('start');

        const existing = await this.subscriptionRepository.getOneWithRelations(
            event.content.subscriptionId,
        );

        if (!existing) {
            const subscription = await this.subscriptionRepository.preserveNew({
                id: event.content.subscriptionId,
                name: event.content.name,
                createdAt: new Date(event.content.createdAt),
                createdBy: event.content.createdBy,
                updatedAt: new Date(event.content.updatedAt),
                updatedBy: event.content.updatedBy,
            });

            l.info('success save');
            return subscription;
        }

        l.info('success ensure');
        return existing;
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'SubscriptionCreatedEventHandler',
        });
    }
}
