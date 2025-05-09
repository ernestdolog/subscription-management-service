import { AbstractService } from '#app/shared/abstract.service.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getLogger } from '#app/shared/logging/index.js';
import { SubscriptionEntity } from '../domain/subscription.entity.js';
import { getSubscriptionRepository, SubscriptionRepository } from '../domain/index.js';

type SubscriptionRetrieveQuery = {
    id: string;
    user: User;
};

export class SubscriptionRetrieveHandler extends AbstractService<
    SubscriptionRetrieveQuery,
    SubscriptionEntity
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    protected async runInTransaction(
        query: SubscriptionRetrieveQuery,
    ): Promise<SubscriptionEntity> {
        const l = this.l.child({ ctx: query });
        l.info('receive');

        const subscription = await this.subscriptionRepository.getOneWithRelations(
            query.id,
            query.user,
        );
        if (!subscription) {
            throw new InternalServerError(CommonError.NOT_FOUND, { resource: 'Subbscription' });
        }

        l.info('success');
        return subscription;
    }

    private get subscriptionRepository(): SubscriptionRepository {
        return getSubscriptionRepository(this.manager);
    }

    private get l() {
        return getLogger().child({
            cls: 'SubscriptionRetrieveHandler',
        });
    }
}
