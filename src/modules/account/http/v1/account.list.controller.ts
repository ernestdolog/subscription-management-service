import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { FilterInputType } from '#app/shared/query-connection/index.js';
import { getAccountConnection } from '../../domain/index.js';
import { AccountListParams } from './request/account.list.request.js';
import { AccountConnectionResponse } from './response/account.list.response.js';

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
        const AccountConnection = getAccountConnection();

        const connection = new AccountConnection(
            request.params.filters as FilterInputType,
            request.params.orderBy,
            {
                first: request.params.first,
                after: request.params.after,
            },
            undefined,
            undefined,
            request.user!,
        );

        const data = await connection.data();

        response.status(200).send(data);
    },
};
