import { SelectQueryBuilder } from 'typeorm';
import {
    OrderByInput,
    TypeOrmConnection,
} from '#app/shared/rest-typeorm-query/pagination/index.js';
import { AccountDao } from '#app/modules/account/infrastructure/account.dao.js';
import { AccountResponse } from '../response/account.response.js';
import { addUserViewPermissionFiltertoAccount } from '#app/modules/account/infrastructure/account.user.is-viewer.js';
import { FilterInputType } from '#app/shared/rest-typeorm-query/index.js';
import { User } from '#app/shared/authorization/tool/index.js';

export class AccountTypeOrmConnection extends TypeOrmConnection<AccountDao, AccountResponse> {
    constructor(
        qb: SelectQueryBuilder<AccountDao>,
        protected filters: FilterInputType,
        protected orderBy?: OrderByInput,
        protected page?: { first: number; after?: string },
        protected search?: string | undefined,
        protected user?: User,
    ) {
        if (user) addUserViewPermissionFiltertoAccount(user, qb);

        super(qb, filters, orderBy, page, search);
    }

    protected toGQLObject(literal: AccountDao): AccountResponse {
        return AccountResponse.from(literal);
    }
}
