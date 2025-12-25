import { SelectQueryBuilder } from 'typeorm';
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
        super(filters, orderBy, page, search, customFiltering);
    }

    protected _query(): SelectQueryBuilder<AccountDao> {
        const queryBuilder = getTypeOrmAccountRepository(new TypeOrmTransactionManager())
            .createQueryBuilder('account')
            .select([
                'account.id',
                'account.entityType',
                'account.entityId',
                'account.createdAt',
                'account.createdBy',
                'account.updatedAt',
                'account.updatedBy',
            ])
            .leftJoin('account.person', 'person')
            .addSelect(['person.id', 'person.firstName', 'person.lastName']);

        if (this.user) {
            addUserViewPermissionFiltertoAccount(this.user, queryBuilder);
        }

        return queryBuilder;
    }

    protected toResponseObject(literal: AccountDao): AccountNode {
        return toAccountNode(literal);
    }
}
