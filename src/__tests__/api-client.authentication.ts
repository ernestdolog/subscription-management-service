/**
 * The Test Client Authorization
 * =============================
 * Provides caller authorization to the test server.
 *
 */
import { before } from 'node:test';
import { faker } from '@faker-js/faker';
import { CognitoJwtPayload } from 'aws-jwt-verify/jwt-model';
import {
    User,
    ACCOUNT_ID_FIELD,
    AUTHORIZATION_TOKEN_HEADER,
    getAuthorizationVerifyClient,
    ENTITY_TYPE_FIELD,
    ENTITY_ID_FIELD,
    SUBSCRIPTION_ID_FIELD,
    UserEntityType,
} from '#app/shared/authorization/tool/index.js';
import { CognitoJwtVerifier } from 'aws-jwt-verify/cognito-verifier';
import { appConfig } from '#app/configs/app.config.js';

before(async () => {
    /**
     * Hit out client instantiation:
     */
    CognitoJwtVerifier.create = (() => {}) as never;
});

/**
 * Ensure granted login for one fake User
 */
export function getAuthHeaders(user?: Partial<User>) {
    const accountId = user?.accountId ?? faker.string.uuid();
    const entityType =
        user?.entityType ??
        faker.helpers.arrayElement<UserEntityType>(Object.values(UserEntityType));
    const entityId = user?.entityId ?? faker.string.uuid();
    const subscriptionId = user?.subscriptionId ?? faker.string.uuid();
    const cognitoUser = {
        [ACCOUNT_ID_FIELD]: accountId,
        [ENTITY_TYPE_FIELD]: entityType,
        [ENTITY_ID_FIELD]: entityId,
        [SUBSCRIPTION_ID_FIELD]: subscriptionId,
    };
    /**
     * JWT verification to pass for the user
     */
    getAuthorizationVerifyClient({
        userPoolId: appConfig.aws.cognito.userPoolId,
        clientId: appConfig.aws.cognito.clientId,
    }).verify = () => cognitoUser as unknown as Promise<CognitoJwtPayload>;

    return {
        [AUTHORIZATION_TOKEN_HEADER]: `Bearer ${faker.hacker.phrase()}`,
    };
}
