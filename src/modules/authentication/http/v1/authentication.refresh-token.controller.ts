import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import {
    AuthenticationResponse,
    toAuthenticationResponse,
} from './response/authentication.response.js';
import { AuthenticationRefreshTokenBody } from './request/authentication.refresh-token.request.js';
import { AuthenticationRefreshTokenHandler } from '../../application/authentication.refresh-token.handler.js';

const AuthenticationRefreshTokenSchema = {
    tags: ['authentications'],
    body: AuthenticationRefreshTokenBody,
    response: {
        200: AuthenticationResponse,
        400: TServerError,
        500: TServerError,
    },
};

export const AuthenticationRefreshToken = {
    method: 'POST',
    url: API_PREFIX_V1 + '/authentications/refresh-token',
    schema: AuthenticationRefreshTokenSchema,
    handler: async (
        request: TRequest<typeof AuthenticationRefreshTokenSchema>,
        response: TResponse<typeof AuthenticationRefreshTokenSchema>,
    ) => {
        const refreshTokenHandler = new AuthenticationRefreshTokenHandler();
        const refreshTokenCommand = request.body;
        const result = await refreshTokenHandler.execute(refreshTokenCommand);
        const authenticationResponse = toAuthenticationResponse(result);
        response.status(200).send(authenticationResponse);
    },
};
