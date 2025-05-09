export abstract class ErrorMessage {}

export class CommonError extends ErrorMessage {
    static UNAUTHORIZED = {
        httpCode: 401,
        name: 'UNAUTHORIZED',
        message: 'Requires authorization.',
    };
    static FORBIDDEN = {
        httpCode: 403,
        name: 'FORBIDDEN',
        message: 'User not permitted to perform action.',
    };
    static NOT_FOUND = {
        httpCode: 404,
        name: 'NOT_FOUND',
        message: ':resource not found',
    };
    static NOT_IMPLEMENTED = {
        httpCode: 501,
        name: 'NOT_IMPLEMENTED',
        message: ':resource not implemented',
    };
    static INTERNAL_SERVER_ERROR = {
        httpCode: 500,
        name: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
    };
    static CONFLICT = {
        httpCode: 409,
        name: 'CONFLICT',
        message: 'Same :resource :value already exists.',
    };
    static NOT_CREATE_REQUEST = {
        httpCode: 422,
        name: 'UNPROCESSABLE_CONTENT',
        message: 'This request is updating an existing resource. Not creating a new one.',
    };
}
