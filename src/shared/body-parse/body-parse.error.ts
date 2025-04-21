import { ErrorMessage } from '#app/shared/error/index.js';

export class BodyParseError extends ErrorMessage {
    static REQUEST_BODY_PARSE_ERROR = {
        httpCode: 400,
        name: 'BODY_PARSE_ERROR',
        message: 'Request body invalid.',
    };
}
