import { dataSource } from '#app/configs/index.js';
import { EntityManager } from 'typeorm';
import { ContactDetailEntityRelationDao } from './contact-detail-entity-relation.dao.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { ContactDetailEntityRelationEntity } from '../domain/contact-detail-entity-relation.entity.js';
import { User } from '#app/shared/authorization/tool/index.js';

const getTypeOrmRepository = () =>
    dataSource
        .getRepository<ContactDetailEntityRelationDao>(ContactDetailEntityRelationDao)
        .extend({
            async preserveNew(
                input: Partial<ContactDetailEntityRelationEntity> &
                    Pick<
                        ContactDetailEntityRelationEntity,
                        'contactDetailId' | 'entityId' | 'entityType'
                    >,
                user: User,
            ) {
                const accountEntityRelationCandidate = this.create({
                    ...input,
                    createdBy: user.accountId,
                    updatedBy: user.accountId,
                });
                const res = await this.save(accountEntityRelationCandidate);
                return res.toEntity;
            },
        });

export function getTypeOrmContactDetailEntityRelationRepository(
    manager: AbstractTransactionManager,
) {
    const typeOrmContactDetailEntityRelationRepository = getTypeOrmRepository();
    if (!manager.context) return typeOrmContactDetailEntityRelationRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(typeOrmContactDetailEntityRelationRepository);
}
