import { dataSource } from '#app/configs/index.js';
import { EntityManager } from 'typeorm';
import { PersonEntityRelationDao } from './person-entity-relation.dao.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { PersonEntityRelationEntity } from '../domain/person-entity-relation.entity.js';
import { User } from '#app/shared/authorization/tool/index.js';

const TypeOrmPersonEntityRelationRepository = dataSource
    .getRepository<PersonEntityRelationDao>(PersonEntityRelationDao)
    .extend({
        async preserveNew(
            input: Partial<PersonEntityRelationEntity> &
                Pick<PersonEntityRelationEntity, 'personId' | 'entityId' | 'entityType'>,
            user: User,
        ) {
            const create = {
                id: input.id,
                personId: input.personId,
                entityType: input.entityType,
                entityId: input.entityId,
                createdAt: input.createdAt,
                createdBy: input.createdBy,
                updatedAt: input.updatedAt,
                updatedBy: input.updatedBy,
                deletedBy: input.deletedBy,
                deletedAt: input.deletedAt,
            };
            const accountEntityRelationCandidate = this.create({
                ...create,
                createdBy: user.accountId,
                updatedBy: user.accountId,
            });
            const res = await this.save(accountEntityRelationCandidate);
            return res.toEntity;
        },
    });

export function getTypeOrmPersonEntityRelationRepository(
    manager: AbstractTransactionManager,
): typeof TypeOrmPersonEntityRelationRepository {
    if (!manager.context) return TypeOrmPersonEntityRelationRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(TypeOrmPersonEntityRelationRepository);
}
