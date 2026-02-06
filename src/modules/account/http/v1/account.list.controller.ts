import { API_PREFIX_V1, TRequest, TResponse } from '#app/api-server/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { FilterInputType } from '#app/shared/query-connection/index.js';
import { getAccountConnection } from '../../domain/index.js';
import { AccountListQuery } from './request/account.list.request.js';
import { AccountConnectionResponse } from './response/account.list.response.js';

export const AccountListSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    querystring: AccountListQuery,
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
        const AccountConnection = getAccountConnection();

        const connection = new AccountConnection(
            request.query.filters as FilterInputType,
            request.query.orderBy,
            {
                first: request.query.first,
                after: request.query.after,
            },
            undefined,
            undefined,
            request.user!,
        );

        const data = await connection.data();

        response.status(200).send(data);
    },
};
