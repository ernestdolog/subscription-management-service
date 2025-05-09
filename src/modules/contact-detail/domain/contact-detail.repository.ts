import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getTypeOrmContactDetailRepository } from '../infrastructure/index.js';
import { ContactDetailEntity } from './index.js';

export interface ContactDetailRepository {
    getOne(id: string, user: User): Promise<ContactDetailEntity | undefined>;
    preserveNew(
        input: Partial<ContactDetailEntity> &
            Pick<ContactDetailEntity, 'detail' | 'entityId' | 'entityType' | 'type' | 'detail'>,
        user: User,
    ): Promise<ContactDetailEntity>;
    preserve(id: string, update: Partial<ContactDetailEntity>): Promise<void>;
    isEmailAlreadyTaken(email: string): Promise<boolean>;
    softDelete(
        entity: Partial<ContactDetailEntity> & Pick<ContactDetailEntity, 'id'>,
        user: User,
    ): Promise<ContactDetailEntity>;
}

export function getContactDetailRepository(
    manager: AbstractTransactionManager,
): ContactDetailRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmContactDetailRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `ContactDetailRepository ${manager.infrastructure} extension`,
    });
}
