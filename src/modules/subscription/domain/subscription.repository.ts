import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { CommonError } from '#app/shared/error/index.js';
import { getTypeOrmSubscriptionRepository } from '../infrastructure/index.js';
import { SubscriptionEntity } from './subscription.entity.js';
import { User } from '#app/shared/authorization/tool/index.js';

export interface SubscriptionRepository {
    getOne(id: string, user?: User): Promise<SubscriptionEntity | undefined>;
    getOneWithRelations(id: string, user?: User): Promise<SubscriptionEntity | undefined>;
    preserveNew(
        input: Partial<SubscriptionEntity> & Pick<SubscriptionEntity, 'name'>,
        user?: User,
    ): Promise<SubscriptionEntity>;
    preserve(id: string, update: Partial<SubscriptionEntity>): Promise<void>;
}

export function getSubscriptionRepository(
    manager: AbstractTransactionManager,
): SubscriptionRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmSubscriptionRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `SubscriptionRepository ${manager.infrastructure} extension`,
    });
}
