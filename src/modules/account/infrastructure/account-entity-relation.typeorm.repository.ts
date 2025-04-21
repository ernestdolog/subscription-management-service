import { dataSource } from '#app/configs/index.js';
import { EntityManager } from 'typeorm';
import { AccountEntityRelationEntity } from '../domain/index.js';
import { AccountEntityRelationDao } from './account-entity-relation.dao.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

const TypeOrmAccountEntityRelationRepository = dataSource
    .getRepository<AccountEntityRelationDao>(AccountEntityRelationDao)
    .extend({
        async preserveNew(
            input: Partial<AccountEntityRelationEntity> & {
                entityId: NonNullable<AccountEntityRelationEntity['entityId']>;
                entityType: NonNullable<AccountEntityRelationEntity['entityType']>;
                accountId: NonNullable<AccountEntityRelationEntity['accountId']>;
            },
            user: User,
        ) {
            const accountEntityRelationDaoInput = {
                id: input.id,
                accountId: input.accountId,
                entityType: input.entityType,
                entityId: input.entityId,
                createdAt: input.createdAt,
                createdBy: user.accountId,
                updatedAt: input.updatedAt,
                updatedBy: user.accountId,
                deletedBy: input.deletedBy,
                deletedAt: input.deletedAt,
            };
            const accountEntityRelationCandidate = this.create(accountEntityRelationDaoInput);
            const res = await this.save(accountEntityRelationCandidate);
            return res.toEntity;
        },
    });

export function getTypeOrmAccountEntityRelationRepository(
    manager: AbstractTransactionManager,
): typeof TypeOrmAccountEntityRelationRepository {
    if (!manager.context) return TypeOrmAccountEntityRelationRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(TypeOrmAccountEntityRelationRepository);
}
