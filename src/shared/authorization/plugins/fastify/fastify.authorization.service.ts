import {
    AUTHORIZATION_TOKEN_HEADER,
    TAuthorizationClientProperties,
    getAuthorizationVerifyClient,
} from '../../tool/index.js';
import { CognitoUser } from '../../tool/cognito.user.entity.js';
import { FastifyRequest } from 'fastify';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { UserDeserializationError } from '../../tool/authorization.error.js';
import { UserAuthorizationAssertionParameters } from '../../tool/authorization.user.assertion.js';

export class AuthorizationService {
    constructor(
        private readonly properties: TAuthorizationClientProperties,
        private readonly authorizationParameters?: UserAuthorizationAssertionParameters,
    ) {}

    async placeUserOnRequest(request: FastifyRequest): Promise<void> {
        const token: string | null | undefined = request.headers[AUTHORIZATION_TOKEN_HEADER];
        if (!token || !token.startsWith('Bearer ')) {
            return undefined;
        }
        const authorizationClient = getAuthorizationVerifyClient(this.properties);
        const jwt = token.replace('Bearer ', '');

        const userObject = await authorizationClient.verify(jwt);
        const user = new CognitoUser(userObject).deserialize();
        request.user = user;
    }

    authenticate(request: FastifyRequest): void {
        if (!request.user) throw new InternalServerError(UserDeserializationError.UNAUTHENTICATED);
    }

    authorize(request: FastifyRequest): void {
        if (this.authorizationParameters && request) {
            /**@todo: implement authorization logic */
        }
    }
}
