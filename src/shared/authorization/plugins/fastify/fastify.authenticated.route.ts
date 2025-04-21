import { appConfig } from '#app/configs/index.js';
import { FastifyRequest } from 'fastify';
import { AuthorizationService } from './fastify.authorization.service.js';
import { UserAuthorizationAssertionParameters } from '../../tool/authorization.user.assertion.js';

export const auth = (authorizationParameters?: UserAuthorizationAssertionParameters) => {
    const svc = new AuthorizationService(
        {
            clientId: appConfig.aws.cognito.clientId,
            userPoolId: appConfig.aws.cognito.userPoolId,
        },
        authorizationParameters,
    );
    return {
        check: async (request: FastifyRequest) => {
            await svc.placeUserOnRequest(request);
            svc.authenticate(request);
            if (authorizationParameters) {
                svc.authorize(request);
            }
        },
    };
};
