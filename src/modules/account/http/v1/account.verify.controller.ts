import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AccountVerifyBody } from './request/account.verify.request.js';
import { AccountResponse, toAccountResponse } from './response/account.response.js';
import { PersonAccountVerifyHandler } from '../../application/person-account.verify.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const AccountCreateSchema = {
    tags: ['accounts'],
    body: AccountVerifyBody,
    response: {
        201: AccountResponse,
        500: TServerError,
    },
};

export const AccountVerify = {
    method: 'PUT',
    url: API_PREFIX_V1 + '/accounts/password',
    schema: AccountCreateSchema,
    handler: async (
        request: TRequest<typeof AccountCreateSchema>,
        response: TResponse<typeof AccountCreateSchema>,
    ) => {
        const createAccount = new PersonAccountVerifyHandler(new TypeOrmTransactionManager());
        const result = await createAccount.run(request.body);

        const account = toAccountResponse(result);
        response.status(201).send(account);
    },
};
