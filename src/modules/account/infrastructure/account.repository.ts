import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { getTypeOrmAccountRepository } from './account.typeorm.repository.js';
import { AccountEntity } from '../domain/account.entity.js';

export interface AccountRepository {
    getOneWithRelations(id: string, user: User): Promise<AccountEntity | undefined>;
    preserveNew(
        input: Partial<AccountEntity> & { entity: NonNullable<AccountEntity['entity']> },
        user?: User,
    ): Promise<AccountEntity>;
    preserve(id: string, input: Partial<AccountEntity>): Promise<void>;
    softDelete(
        account: Partial<AccountEntity> & { id: string },
        user: User,
    ): Promise<AccountEntity>;
}

export function getAccountRepository(manager: AbstractTransactionManager): AccountRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmAccountRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `AccountRepository ${manager.infrastructure} extension`,
    });
}
