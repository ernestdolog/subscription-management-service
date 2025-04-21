import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AccountCreateBody } from './request/account.create.request.js';
import { AccountResponse, toAccountResponse } from './response/account.response.js';
import { auth } from '#app/shared/authorization/plugins/fastify/fastify.authenticated.route.js';
import { AccountCreateHandler } from '../../application/account.create.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const AccountCreateSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    body: AccountCreateBody,
    response: {
        201: AccountResponse,
        500: TServerError,
    },
};

export const AccountCreate = {
    method: 'POST',
    url: API_PREFIX_V1 + '/accounts',
    schema: AccountCreateSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountCreateSchema>,
        response: TResponse<typeof AccountCreateSchema>,
    ) => {
        const createAccountHandler = new AccountCreateHandler(new TypeOrmTransactionManager());
        const createAccountCommand = { ...request.body, user: request.user! };
        const result = await createAccountHandler.run(createAccountCommand);

        const account = toAccountResponse(result);
        response.status(201).send(account);
    },
};
