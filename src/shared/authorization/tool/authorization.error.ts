import { ErrorMessage } from '#app/shared/error/index.js';

export class UserDeserializationError extends ErrorMessage {
    static UNAUTHENTICATED = {
        httpCode: 401,
        name: 'UNAUTHENTICATED',
        message: 'Requires authentication.',
    };
    static UNAUTHORIZED = {
        httpCode: 403,
        name: 'UNAUTHORIZED',
        message: 'User not authorized to perform action.',
    };
    static INVALID_FORMAT = {
        httpCode: 500,
        name: 'USER_INVALID_FORMAT',
        message: 'User parsing error. Cognito User provided format invalid.',
    };
    static MISSING_BUSINESS_UNITS_ROLES = {
        httpCode: 500,
        name: 'USER_MISSING_BUSINESS_UNITS_ROLES',
        message: 'User parsing error. Cognito User missing business unit roles.',
    };
    static INVALID_BUSINESS_UNITS_ROLES = {
        httpCode: 500,
        name: 'USER_INVALID_BUSINESS_UNITS_ROLES',
        message: 'User parsing error. Cognito User business unit roles format invalid.',
    };
    static MISSING_ORGANISATION_ID = {
        httpCode: 500,
        name: 'USER_MISSING_ORGANISATION_ID',
        message: 'User parsing error. Cognito User missing business organisation id.',
    };
    static INVALID_ORGANISATION_ID = {
        httpCode: 500,
        name: 'USER_INVALID_ORGANISATION_ID',
        message: 'User parsing error. Cognito User business organisation id format invalid.',
    };
    static MISSING_ORGANISATION_ROLE = {
        httpCode: 500,
        name: 'USER_MISSING_ORGANISATION_ROLE',
        message: 'User parsing error. Cognito User missing business organisation role.',
    };
    static INVALID_ORGANISATION_ROLE = {
        httpCode: 500,
        name: 'USER_INVALID_ORGANISATION_ROLE',
        message: 'User parsing error. Cognito User business organisation role format invalid.',
    };
    static MISSING_ACCOUNT_ID = {
        httpCode: 500,
        name: 'USER_MISSING_ACCOUNT_ID',
        message: 'User parsing error. Cognito User missing account id.',
    };
    static INVALID_ACCOUNT_ID = {
        httpCode: 500,
        name: 'USER_INVALID_ACCOUNT_ID',
        message: 'User parsing error. Cognito User account id invalid.',
    };
    static MISSING_ENTITY_ID = {
        httpCode: 500,
        name: 'USER_MISSING_ENTITY_ID',
        message: 'User parsing error. Cognito User missing entity id.',
    };
    static INVALID_ENTITY_ID = {
        httpCode: 500,
        name: 'USER_INVALID_ENTITY_ID',
        message: 'User parsing error. Cognito User entity id invalid.',
    };
    static MISSING_ENTITY_TYPE = {
        httpCode: 500,
        name: 'USER_MISSING_ENTITY_TYPE',
        message: 'User parsing error. Cognito User missing entity type.',
    };
    static INVALID_ENTITY_TYPE = {
        httpCode: 500,
        name: 'USER_INVALID_ENTITY_TYPE',
        message: 'User parsing error. Cognito User entity type invalid.',
    };
    static MISSING_SUBSCRIPTION_ID = {
        httpCode: 500,
        name: 'USER_MISSING_SUBSCRIPTION_ID',
        message: 'User parsing error. Cognito User missing subscription id.',
    };
    static INVALID_SUBSCRIPTION_ID = {
        httpCode: 500,
        name: 'USER_INVALID_SUBSCRIPTION_ID',
        message: 'User parsing error. Cognito User subscription id invalid.',
    };
    static MISSING_SUBSCRIPTION_DOMAINS = {
        httpCode: 500,
        name: 'USER_MISSING_SUBSCRIPTION_DOMAINS',
        message: 'User parsing error. Cognito User missing subscription domains.',
    };
    static INVALID_SUBSCRIPTION_DOMAINS = {
        httpCode: 500,
        name: 'USER_INVALID_SUBSCRIPTION_DOMAINS',
        message: 'User parsing error. Cognito User subscription domains invalid.',
    };
}
