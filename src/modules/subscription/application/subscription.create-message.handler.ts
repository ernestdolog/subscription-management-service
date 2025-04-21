import { getLogger } from '#app/shared/logging/index.js';
import { messages } from '#app/shared/kafka/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { SubscriptionEntity } from '#app/modules/subscription/domain/index.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/infrastructure/index.js';

export class SubscriptionCreateMessageHandler extends AbstractService<
    messages.v1.SubscriptionsSubscriptionCreateMessage,
    SubscriptionEntity | undefined
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        message: messages.v1.SubscriptionsSubscriptionCreateMessage,
    ): Promise<SubscriptionEntity | undefined> {
        const l = this.l.child({ ctx: message });
        l.info('start');

        const existing = await this.subscriptionRepository.getOneWithRelations(
            message.content.subscriptionId,
        );

        if (!existing) {
            const subscription = await this.subscriptionRepository.preserveNew({
                id: message.content.subscriptionId,
                name: message.content.name,
                createdAt: new Date(message.content.createdAt),
                createdBy: message.content.createdBy,
                updatedAt: new Date(message.content.updatedAt),
                updatedBy: message.content.updatedBy,
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
            cls: 'SubscriptionCreateMessageHandler',
        });
    }
}
