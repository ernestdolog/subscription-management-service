import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { ContactDetailEntityRelationEntity } from '../domain/index.js';
import { getTypeOrmContactDetailEntityRelationRepository } from './contact-detail-entity-relation.typeorm.repository.js';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';

export interface ContactDetailEntityRelationRepository {
    preserveNew(
        input: Partial<ContactDetailEntityRelationEntity> &
            Pick<ContactDetailEntityRelationEntity, 'contactDetailId' | 'entityId' | 'entityType'>,
        user: User,
    ): Promise<ContactDetailEntityRelationEntity>;
}

export function getContactDetailEntityRelationRepository(
    manager: AbstractTransactionManager,
): ContactDetailEntityRelationRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmContactDetailEntityRelationRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `ContactDetailEntityRelationRepository ${manager.infrastructure} extension`,
    });
}
