import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import {
    SubscriptionUpdateResponse,
    toSubscriptionUpdateResponse,
} from './response/subscription.update.response.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import {
    SubscriptionUpdateBody,
    SubscriptionUpdateParams,
} from './request/subscription.update.request.js';
import { SubscriptionUpdateHandler } from '../../application/subscription.update.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const SubscriptionUpdateSchema = {
    tags: ['subscriptions'],
    security: [{ BearerAuth: [] }],
    body: SubscriptionUpdateBody,
    params: SubscriptionUpdateParams,
    response: {
        200: SubscriptionUpdateResponse,
        500: TServerError,
    },
};

export const SubscriptionUpdate = {
    method: 'PUT',
    url: API_PREFIX_V1 + '/subscriptions/:id',
    schema: SubscriptionUpdateSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof SubscriptionUpdateSchema>,
        response: TResponse<typeof SubscriptionUpdateSchema>,
    ) => {
        const createSubscriptionHandler = new SubscriptionUpdateHandler(
            new TypeOrmTransactionManager(),
        );
        const createSubscriptionCommand = {
            id: request.params.id,
            name: request.body.name,
            user: request.user!,
        };
        const result = await createSubscriptionHandler.run(createSubscriptionCommand);

        const subscriptionResponse = toSubscriptionUpdateResponse(result);
        response.status(200).send(subscriptionResponse);
    },
};
