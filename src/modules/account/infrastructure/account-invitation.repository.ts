import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { getTypeOrmAccountInvitationRepository } from './account-invitation.typeorm.repository.js';
import { AccountInvitationEntity } from '../domain/account-invitation.entity.js';
import { AccountEntity } from '../domain/index.js';

export interface AccountInvitationRepository {
    getOne(token: string): Promise<AccountInvitationEntity | undefined>;
    provide(accountId: string, user: User): Promise<AccountInvitationEntity>;
    preserve(id: string, input: Partial<AccountEntity>): Promise<void>;
}

export function getAccountInvitationRepository(
    manager: AbstractTransactionManager,
): AccountInvitationRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmAccountInvitationRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `AccountInvitationRepository ${manager.infrastructure} extension`,
    });
}
