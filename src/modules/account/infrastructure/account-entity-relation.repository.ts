import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { getTypeOrmAccountEntityRelationRepository } from './account-entity-relation.typeorm.repository.js';
import { AccountEntityRelationEntity } from '../domain/account-entity-relation.entity.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

export interface AccountEntityRelationRepository {
    preserveNew(
        input: Partial<AccountEntityRelationEntity> & {
            entityId: NonNullable<AccountEntityRelationEntity['entityId']>;
            accountId: NonNullable<AccountEntityRelationEntity['accountId']>;
        },
        user: User,
    ): Promise<AccountEntityRelationEntity>;
}

export function getAccountEntityRelationRepository(
    manager: AbstractTransactionManager,
): AccountEntityRelationRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmAccountEntityRelationRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `AccountEntityRelationRepository ${manager.infrastructure} extension`,
    });
}
