import { getLogger } from '#app/shared/logging/index.js';
import { toMessage } from '../error.parse-message.js';
import { toInternal } from '../error.to-internal.js';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { InternalServerError } from './server.error.js';
import { isInternalError } from '../error.is-internal.js';
/**
 * Return JSON
 * If thrown error isnt implemented explicitly
 * Return 500 internal
 * @param {FastifyError} error
 */
export const ErrorHandler = async (
    error: FastifyError,
    _: FastifyRequest,
    reply: FastifyReply,
): Promise<void> => {
    const l = getLogger();
    const isInternal = isInternalError(error);
    if (isInternal) {
        l.child({
            cls: 'ErrorHandler',
            ctx: error,
        }).error('server error caught');
        reply.status(Number(error.code)).send(JSON.parse(JSON.stringify(error)));
    } else {
        const internalServerError = new InternalServerError(toInternal(error), {
            message: toMessage(error),
        });
        l.child({
            cls: 'ErrorHandler',
            ctx: { error, internalServerError },
        }).error('3rd party error caught');
        reply
            .status(Number(internalServerError.code))
            .send(JSON.parse(JSON.stringify(internalServerError)));
    }
};
