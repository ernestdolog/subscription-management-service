import { OrderByInput, TypeOrmConnection } from '#app/shared/query-connection/pagination/index.js';
import { AccountDao } from './account.dao.js';
import { addUserViewPermissionFiltertoAccount } from '#app/modules/account/infrastructure/account.user.is-viewer.js';
import { CustomFiltering, FilterInputType } from '#app/shared/query-connection/index.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { getTypeOrmAccountRepository } from './account.typeorm.repository.js';
import { AccountNode, toAccountNode } from '../http/v1/index.js';

export class AccountTypeOrmConnection extends TypeOrmConnection<AccountDao, AccountNode> {
    constructor(
        protected filters: FilterInputType,
        protected orderBy?: OrderByInput,
        protected page?: { first: number; after?: string },
        protected search?: string | undefined,
        protected customFiltering?: CustomFiltering,
        protected user?: User,
    ) {
        const qb = getTypeOrmAccountRepository(
            new TypeOrmTransactionManager(),
        ).createQueryBuilder();

        if (user) addUserViewPermissionFiltertoAccount(user, qb);

        super(qb, filters, orderBy, page, search);
    }

    protected toResponseObject(literal: AccountDao): AccountNode {
        return toAccountNode(literal.toEntity);
    }
}
