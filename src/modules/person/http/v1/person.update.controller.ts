import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { PersonUpdateParams, PersonUpdateBody } from './request/person.update.request.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import { PersonUpdateResponse, toPersonUpdateResponse } from './response/person.update.response.js';
import { PersonUpdateHandler } from '../../application/person.update.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const PersonUpdateSchema = {
    tags: ['persons'],
    security: [{ BearerAuth: [] }],
    body: PersonUpdateBody,
    params: PersonUpdateParams,
    response: {
        200: PersonUpdateResponse,
        500: TServerError,
    },
};

export const PersonUpdate = {
    method: 'POST',
    url: API_PREFIX_V1 + '/persons/:id',
    schema: PersonUpdateSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof PersonUpdateSchema>,
        response: TResponse<typeof PersonUpdateSchema>,
    ) => {
        const updatedPersonHandler = new PersonUpdateHandler(new TypeOrmTransactionManager());
        const updatedPersonCommand = {
            id: request.params.id,
            ...request.body,
            user: request.user!,
        };
        const result = await updatedPersonHandler.run(updatedPersonCommand);

        const Person = toPersonUpdateResponse(result);
        response.status(200).send(Person);
    },
};
