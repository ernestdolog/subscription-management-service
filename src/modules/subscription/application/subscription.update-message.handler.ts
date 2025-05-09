import { getLogger } from '#app/shared/logging/index.js';
import { messages } from '#app/shared/kafka/index.js';
import { AbstractService } from '#app/shared/abstract.service.js';
import { SubscriptionEntity } from '#app/modules/subscription/domain/subscription.entity.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import {
    getSubscriptionRepository,
    SubscriptionRepository,
} from '#app/modules/subscription/domain/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

export class SubscriptionUpdateMessageHandler extends AbstractService<
    messages.v1.SubscriptionsSubscriptionUpdateMessage,
    SubscriptionEntity | undefined
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        message: messages.v1.SubscriptionsSubscriptionUpdateMessage,
    ): Promise<SubscriptionEntity | undefined> {
        const l = this.l.child({ ctx: message });
        l.info('start');

        const existing = await this.subscriptionRepository.getOneWithRelations(
            message.content.subscriptionId,
        );

        const isUpdateReflected =
            existing?.id === message.content.subscriptionId &&
            existing?.name === message.content.name &&
            existing?.createdAt.toString() === message.content.createdAt &&
            existing?.createdBy === message.content.createdBy &&
            existing?.updatedAt.toString() === message.content.updatedAt &&
            existing?.updatedBy === message.content.updatedBy;

        if (existing && !isUpdateReflected) {
            const updated = existing.update(message.content, {
                accountId: message.content.updatedBy,
            } as User);
            await this.subscriptionRepository.preserve(message.content.subscriptionId, updated);

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
            cls: 'SubscriptionUpdateMessageHandler',
        });
    }
}
