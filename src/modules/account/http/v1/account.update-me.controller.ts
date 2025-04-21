import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AccountResponse, toAccountResponse } from './response/account.response.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { AccountUpdateMeBody } from './request/account.update-me.request.js';
import { AccountUpdateMeHandler } from '#app/modules/account/application/account.update-me.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const AccountRetrieveSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    body: AccountUpdateMeBody,
    response: {
        200: AccountResponse,
        500: TServerError,
    },
};

export const AccountUpdateMe = {
    method: 'PUT',
    url: API_PREFIX_V1 + '/accounts/me',
    schema: AccountRetrieveSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountRetrieveSchema>,
        response: TResponse<typeof AccountRetrieveSchema>,
    ) => {
        const updateMe = new AccountUpdateMeHandler(new TypeOrmTransactionManager());
        const result = await updateMe.run({ ...request.body, user: request.user! });

        const account = toAccountResponse(result);
        response.status(200).send(account);
    },
};
