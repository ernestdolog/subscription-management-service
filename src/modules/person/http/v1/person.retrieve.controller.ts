import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { PersonRetrieveParams } from './request/person.retrieve.request.js';
import { PersonResponse, toPersonResponse } from './response/person.response.js';
import { PersonRetrieveHandler } from '../../application/person.retrieve.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const PersonRetrieveSchema = {
    tags: ['persons'],
    security: [{ BearerAuth: [] }],
    params: PersonRetrieveParams,
    response: {
        200: PersonResponse,
        500: TServerError,
    },
};

export const PersonRetrieve = {
    method: 'GET',
    url: API_PREFIX_V1 + '/persons/:id',
    schema: PersonRetrieveSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof PersonRetrieveSchema>,
        response: TResponse<typeof PersonRetrieveSchema>,
    ) => {
        const updatedPersonHandler = new PersonRetrieveHandler(new TypeOrmTransactionManager());
        const updatedPersonQuery = {
            id: request.params.id,
            user: request.user!,
        };
        const result = await updatedPersonHandler.run(updatedPersonQuery);

        const Person = toPersonResponse(result);
        response.status(200).send(Person);
    },
};
