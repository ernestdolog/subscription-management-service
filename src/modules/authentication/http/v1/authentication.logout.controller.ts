import { Type } from '@sinclair/typebox';
import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AuthenticationLogoutBody } from './request/authentication.logout.request.js';
import { AuthenticationLogoutHandler } from '../../application/authentication.logout.handler.js';

const AuthenticationLogoutSchema = {
    tags: ['authentications'],
    body: AuthenticationLogoutBody,
    response: {
        200: Type.Boolean(),
        500: TServerError,
    },
};

export const AuthenticationLogout = {
    method: 'POST',
    url: API_PREFIX_V1 + '/authentications/logout',
    schema: AuthenticationLogoutSchema,
    handler: async (
        request: TRequest<typeof AuthenticationLogoutSchema>,
        response: TResponse<typeof AuthenticationLogoutSchema>,
    ) => {
        const logoutHandler = new AuthenticationLogoutHandler();
        const logoutCommand = request.body;
        const result = await logoutHandler.execute(logoutCommand);
        response.status(200).send(result);
    },
};
