import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { SubscriptionResponse, toSubscriptionResponse } from './response/subscription.response.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { SubscriptionRetrieveHandler } from '#app/modules/subscription/application/subscription.retrieve.handler.js';
import { SubscriptionRetrieveParams } from './request/subscription.retrieve.request.js';

export const SubscriptionRetrieveSchema = {
    tags: ['subscriptions'],
    security: [{ BearerAuth: [] }],
    params: SubscriptionRetrieveParams,
    response: {
        200: SubscriptionResponse,
        500: TServerError,
    },
};

export const SubscriptionRetrieve = {
    method: 'GET',
    url: API_PREFIX_V1 + '/subscriptions/:id',
    schema: SubscriptionRetrieveSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof SubscriptionRetrieveSchema>,
        response: TResponse<typeof SubscriptionRetrieveSchema>,
    ) => {
        const retrieveSubscriptionHandler = new SubscriptionRetrieveHandler(
            new TypeOrmTransactionManager(),
        );
        const retrieveSubscriptionQuery = { id: request.params.id, user: request.user! };
        const result = await retrieveSubscriptionHandler.run(retrieveSubscriptionQuery);

        const subscriptionResponse = toSubscriptionResponse(result);
        response.status(200).send(subscriptionResponse);
    },
};
