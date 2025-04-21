import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AccountResponse, toAccountResponse } from './response/account.response.js';
import { AccountDeleteParams } from './request/account.delete.request.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { AccountDeleteHandler } from '../../application/account.delete.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const AccountDeleteSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    params: AccountDeleteParams,
    response: {
        200: AccountResponse,
        500: TServerError,
    },
};

export const AccountDelete = {
    method: 'DELETE',
    url: API_PREFIX_V1 + '/accounts/:id',
    schema: AccountDeleteSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountDeleteSchema>,
        response: TResponse<typeof AccountDeleteSchema>,
    ) => {
        const deleteAccountHandler = new AccountDeleteHandler(new TypeOrmTransactionManager());
        const deleteAccountCommand = { id: request.params.id, user: request.user! };
        const result = await deleteAccountHandler.run(deleteAccountCommand);

        const account = toAccountResponse(result);
        response.status(200).send(account);
    },
};
