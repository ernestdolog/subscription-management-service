import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { getTypeOrmPersonEntityRelationRepository } from '../infrastructure/index.js';
import { PersonEntityRelationEntity } from '../domain/person-entity-relation.entity.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

export interface PersonEntityRelationRepository {
    preserveNew(
        input: Partial<PersonEntityRelationEntity> &
            Pick<PersonEntityRelationEntity, 'personId' | 'entityId' | 'entityType'>,
        user: User,
    ): Promise<PersonEntityRelationEntity>;
}

export function getPersonEntityRelationRepository(
    manager: AbstractTransactionManager,
): PersonEntityRelationRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmPersonEntityRelationRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `PersonEntityRelationRepository ${manager.infrastructure} extension`,
    });
}
