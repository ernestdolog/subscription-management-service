/**
 * The Authorization Verify Client
 * ===============================
 * 🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡
 * 🤡   As AWS made it sure, that even                 🤡
 * 🤡   When we send clientId through creation         🤡
 * 🤡   We will need to give it once again             🤡
 * 🤡   Once we use their types.                       🤡
 * 🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡🤡
 *
 */
import {
    CognitoJwtVerifier,
    CognitoJwtVerifierSingleUserPool,
    CognitoJwtVerifierProperties,
} from 'aws-jwt-verify/cognito-verifier';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import { TAuthorizationClientProperties } from './authorization.types.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { UserDeserializationError } from './authorization.error.js';

class AuthorizationVerifyClient {
    private client: CognitoJwtVerifierSingleUserPool<CognitoJwtVerifierProperties>;

    constructor(private readonly properties: TAuthorizationClientProperties) {
        this.client = CognitoJwtVerifier.create<CognitoJwtVerifierProperties>({
            userPoolId: this.properties.userPoolId,
            clientId: this.properties.clientId,
            tokenUse: 'id',
        });
    }

    async verify(jwt: string): Promise<CognitoJwtPayload> {
        try {
            const res = await this.client.verify(jwt, {
                clientId: this.properties.clientId,
                tokenUse: 'id',
            });
            return res;
        } catch (error) {
            throw new InternalServerError(UserDeserializationError.UNAUTHENTICATED, { error });
        }
    }
}

let authorizationVerifyClient: AuthorizationVerifyClient;

/**
 * Provide cached Authorization Verify client. Creates new if isn't cached.
 */
export function getAuthorizationVerifyClient(
    properties: TAuthorizationClientProperties,
): AuthorizationVerifyClient {
    if (!authorizationVerifyClient)
        authorizationVerifyClient = new AuthorizationVerifyClient(properties);
    return authorizationVerifyClient;
}
