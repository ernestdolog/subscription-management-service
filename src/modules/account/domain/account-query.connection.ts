import { QueryConnection } from '#app/shared/query-connection/pagination/index.js';
import { AccountNode } from '../http/v1/index.js';
import { AccountTypeOrmConnection } from '../infrastructure/account-query.typeorm.connection.js';

export function getAccountConnection(): QueryConnection<AccountNode> {
    return AccountTypeOrmConnection;
}
