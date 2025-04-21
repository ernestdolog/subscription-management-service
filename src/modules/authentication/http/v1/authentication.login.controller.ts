import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import {
    AuthenticationResponse,
    toAuthenticationResponse,
} from './response/authentication.response.js';
import { AuthenticationLoginRequest } from './request/authentication.login.request.js';
import { AuthenticationLoginHandler } from '../../application/authentication.login.handler.js';

export const AuthenticationLoginSchema = {
    tags: ['authentications'],
    body: AuthenticationLoginRequest,
    response: {
        200: AuthenticationResponse,
        500: TServerError,
    },
};

export const AuthenticationLogin = {
    method: 'POST',
    url: API_PREFIX_V1 + '/authentications/login',
    schema: AuthenticationLoginSchema,
    handler: async (
        request: TRequest<typeof AuthenticationLoginSchema>,
        response: TResponse<typeof AuthenticationLoginSchema>,
    ) => {
        const login = new AuthenticationLoginHandler();
        const result = await login.execute(request.body);
        const athenticationResponse = toAuthenticationResponse(result);
        response.status(200).send(athenticationResponse);
    },
};
