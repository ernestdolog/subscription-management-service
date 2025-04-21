import { TErrorMessage } from '../index.js';
import {
    ERROR_CODE_INTERCEPT_LIBRARY,
    CODE_INTERCEPT_DEFAULT,
    HTTP_CODE_INTERCEPT_LIBRARY,
} from './error.constants.js';

export const toInternal = (error: unknown): TErrorMessage => {
    if (error && typeof error === 'object') {
        const casedError = castError(error);
        if (casedError) return casedError;
        if ('extensions' in error && typeof error.extensions === 'object') {
            const casedError = castError(error.extensions!);
            if (casedError) return casedError;
        }
    }
    return CODE_INTERCEPT_DEFAULT;
};

const castError = (input: object) => {
    if ('httpCode' in input) {
        const httpCode = `${input.httpCode}`;
        return (
            HTTP_CODE_INTERCEPT_LIBRARY[httpCode as keyof typeof HTTP_CODE_INTERCEPT_LIBRARY] ??
            CODE_INTERCEPT_DEFAULT
        );
    }
    if ('code' in input) {
        const code = `${input.code}`;
        return (
            ERROR_CODE_INTERCEPT_LIBRARY[code as keyof typeof ERROR_CODE_INTERCEPT_LIBRARY] ??
            CODE_INTERCEPT_DEFAULT
        );
    }
};
