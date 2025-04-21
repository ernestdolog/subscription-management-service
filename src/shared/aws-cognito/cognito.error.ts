import { ErrorMessage } from '../error/index.js';

export class CognitoError extends ErrorMessage {
    static MISSING_ACCESS_KEY = {
        httpCode: 500,
        name: 'MISSING_ACCESS_KEY',
        message: 'One access key must be filled. Email or Account Id',
    };
    static INVALID_LOGIN_CREDIDENTALS = {
        httpCode: 401,
        name: 'INVALID_LOGIN_CREDIDENTALS',
        message: 'Invalid login credidentals.',
    };
    static USER_NOT_FOUND = {
        httpCode: 400,
        name: 'USER_NOT_FOUND',
        message: 'Cognito user not found.',
    };
    static COGNITO_ERROR = {
        httpCode: 500,
        name: 'COGNITO_RUNTIME_ERROR',
        message: 'Cognito service available but an error occurred on access.',
    };
}
