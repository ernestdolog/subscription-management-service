import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { getTypeOrmPersonRepository } from '../infrastructure/person.typeorm.repository.js';
import { PersonEntity } from './index.js';

export interface PersonRepository {
    getOneWithAllRelated(id: string, user: User): Promise<PersonEntity | undefined>;
    getOne(id: string, user: User): Promise<PersonEntity | undefined>;
    preserve(id: string, update: Partial<PersonEntity>): Promise<void>;
    preserveNew(
        input: Partial<PersonEntity> & Pick<PersonEntity, 'firstName' | 'lastName'>,
        user?: User,
    ): Promise<PersonEntity>;
    softDelete(
        entity: Partial<PersonEntity> & Pick<PersonEntity, 'id'>,
        user: User,
    ): Promise<PersonEntity>;
}

export function getPersonRepository(manager: AbstractTransactionManager): PersonRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmPersonRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `PersonRepository ${manager.infrastructure} extension`,
    });
}
