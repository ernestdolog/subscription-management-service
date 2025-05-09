import { API_PREFIX_V1 } from '#app/http/http-server.constants.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { auth } from '#app/shared/authorization/plugins/fastify/index.js';
import {
    ContactDetailUpdateParams,
    ContactDetailUpdateBody,
} from './request/contact-detail.update.request.js';
import {
    ContactDetailResponse,
    toContactDetailResponse,
} from './response/contact-detail.response.js';
import { ContactDetailUpdateHandler } from '../../application/contact-detail.update.handler.js';
import { dataSource } from '#app/configs/index.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import { TRequest, TResponse } from '#app/http/index.js';

export const ContactDetailUpdateSchema = {
    tags: ['contact-details'],
    security: [{ BearerAuth: [] }],
    body: ContactDetailUpdateBody,
    params: ContactDetailUpdateParams,
    response: {
        200: ContactDetailResponse,
        500: TServerError,
    },
};

export const ContactDetailUpdate = {
    method: 'PUT',
    url: API_PREFIX_V1 + '/contact-details/:id',
    schema: ContactDetailUpdateSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof ContactDetailUpdateSchema>,
        response: TResponse<typeof ContactDetailUpdateSchema>,
    ) => {
        const updateContactDetailHandler = new ContactDetailUpdateHandler(
            new TypeOrmTransactionManager(dataSource),
        );
        const updateContactDetailCommand = {
            id: request.params.id,
            ...request.body,
            user: request.user!,
        };
        const result = await updateContactDetailHandler.run(updateContactDetailCommand);

        const constactDetail = toContactDetailResponse(result);
        response.status(200).send(constactDetail);
    },
};
