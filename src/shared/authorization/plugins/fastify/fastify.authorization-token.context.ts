import { FastifyRequest } from 'fastify';
import { AUTHORIZATION_TOKEN_HEADER } from '../../tool/authorization.constants.js';
import { TAuthorizationContext } from '../../tool/authorization.types.js';
import { requestContext } from '@fastify/request-context';

const computeAuthorizationToken = (request: FastifyRequest) => {
    return request.headers[AUTHORIZATION_TOKEN_HEADER];
};

export const AuthorizationTokenContext = (request: FastifyRequest): TAuthorizationContext => ({
    authorizationToken: computeAuthorizationToken(request),
});

export const getAuthorizationToken = (): string | null | undefined => {
    return requestContext.get('authorizationToken');
};
