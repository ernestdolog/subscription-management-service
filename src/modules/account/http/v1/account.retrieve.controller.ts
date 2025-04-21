import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AccountResponse, toAccountResponse } from './response/account.response.js';
import { AccountRetrieveParams } from './request/account.retrieve.request.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { AccountRetrieveHandler } from '../../application/index.js';

export const AccountRetrieveSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    params: AccountRetrieveParams,
    response: {
        200: AccountResponse,
        500: TServerError,
    },
};

export const AccountRetrieve = {
    method: 'GET',
    url: API_PREFIX_V1 + '/accounts/:id',
    schema: AccountRetrieveSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountRetrieveSchema>,
        response: TResponse<typeof AccountRetrieveSchema>,
    ) => {
        const retrieveAccount = new AccountRetrieveHandler(new TypeOrmTransactionManager());
        const result = await retrieveAccount.run({ id: request.params.id, user: request.user! });

        const account = toAccountResponse(result);
        response.status(200).send(account);
    },
};
