import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { PersonRetrieveHandler } from '../../application/person.retrieve.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { dataSource } from '#app/configs/index.js';
import { PersonResponse, toPersonResponse } from './response/person.response.js';

export const PersonMeRetrieveSchema = {
    tags: ['persons'],
    security: [{ BearerAuth: [] }],
    response: {
        200: PersonResponse,
        500: TServerError,
    },
};

export const PersonMeRetrieve = {
    method: 'GET',
    url: API_PREFIX_V1 + '/persons/me',
    schema: PersonMeRetrieveSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof PersonMeRetrieveSchema>,
        response: TResponse<typeof PersonMeRetrieveSchema>,
    ) => {
        const retrieveHandler = new PersonRetrieveHandler(
            new TypeOrmTransactionManager(dataSource),
        );
        const query = {
            id: request.user!.entityId!,
            user: request.user!,
        };
        const result = await retrieveHandler.run(query);

        const Person = toPersonResponse(result);
        response.status(200).send(Person);
    },
};
