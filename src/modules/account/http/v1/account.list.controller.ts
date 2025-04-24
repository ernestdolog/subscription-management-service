import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { getTypeOrmAccountRepository } from '../../infrastructure/account.typeorm.repository.js';
import { AccountTypeOrmConnection } from './query/account-connection.js';
import { AccountListParams } from './query/account-list.body.js';
import { FilterInputType } from '#app/shared/rest-typeorm-query/index.js';
import { AccountConnectionResponse } from './query/account.connection.response.js';

export const AccountListSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    params: AccountListParams,
    response: {
        200: AccountConnectionResponse,
        500: TServerError,
    },
};

export const AccountList = {
    method: 'GET',
    url: API_PREFIX_V1 + '/accounts',
    schema: AccountListSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountListSchema>,
        response: TResponse<typeof AccountListSchema>,
    ) => {
        const qb = getTypeOrmAccountRepository(
            new TypeOrmTransactionManager(),
        ).createQueryBuilder();

        const connection = new AccountTypeOrmConnection(
            qb,
            request.params.filters as FilterInputType,
            request.params.orderBy,
            {
                first: request.params.first,
                after: request.params.after,
            },
            undefined,
            request.user!,
        );

        const data = await connection.data();

        response.status(200).send(data);
    },
};
