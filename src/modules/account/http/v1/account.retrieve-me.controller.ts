import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import {
    AccountRetrieveResponse,
    toAccountRetrieveResponse,
} from './response/account.retrieve.response.js';
import { AccountRetrieveHandler } from '../../application/account.retrieve.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { SubscriptionRetrieveHandler } from '#app/modules/subscription/application/subscription.retrieve.handler.js';

export const AccountRetrieveMeSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    response: {
        200: AccountRetrieveResponse,
        500: TServerError,
    },
};

export const AccountRetrieveMe = {
    method: 'GET',
    url: API_PREFIX_V1 + '/accounts/me',
    schema: AccountRetrieveMeSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountRetrieveMeSchema>,
        response: TResponse<typeof AccountRetrieveMeSchema>,
    ) => {
        const transaction = new TypeOrmTransactionManager();
        const retrieveAccount = new AccountRetrieveHandler(transaction);
        const account = await retrieveAccount.run({
            id: request.user?.accountId!,
            user: request.user!,
        });

        const retrieveSubscription = new SubscriptionRetrieveHandler(transaction);
        const subscription = await retrieveSubscription.run({
            id: request.user?.subscriptionId!,
            user: request.user!,
        });

        const res = toAccountRetrieveResponse(account, subscription);
        response.status(200).send(res);
    },
};
