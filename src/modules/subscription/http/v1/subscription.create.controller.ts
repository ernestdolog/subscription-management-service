import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { SubscriptionResponse, toSubscriptionResponse } from './response/subscription.response.js';
import { SubscriptionCreateHandler } from '../../application/subscription.create.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { SubscriptionCreateBody } from './request/subscription.create.request.js';

export const SubscriptionCreateSchema = {
    tags: ['subscriptions'],
    body: SubscriptionCreateBody,
    response: {
        201: SubscriptionResponse,
        500: TServerError,
    },
};

export const SubscriptionCreate = {
    method: 'POST',
    url: API_PREFIX_V1 + '/subscriptions',
    schema: SubscriptionCreateSchema,
    handler: async (
        request: TRequest<typeof SubscriptionCreateSchema>,
        response: TResponse<typeof SubscriptionCreateSchema>,
    ) => {
        const createSubscriptionHandler = new SubscriptionCreateHandler(
            new TypeOrmTransactionManager(),
        );
        const createSubscriptionCommand = request.body;
        const result = await createSubscriptionHandler.run(createSubscriptionCommand);

        const subscriptionResponse = toSubscriptionResponse(result);
        response.status(201).send(subscriptionResponse);
    },
};
