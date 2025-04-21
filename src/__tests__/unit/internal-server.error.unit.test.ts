import { CommonError, ErrorFormattedMessage } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';

describe('InternalServerError', { concurrency: true }, () => {
    it('error signature matches', async () => {
        const thrownProperties = {
            resource: 'TheResourceWeWereLookingFor',
        };
        const thrownError = new InternalServerError(CommonError.NOT_FOUND, thrownProperties);

        const callThrow = async (): Promise<unknown> => {
            throw thrownError;
        };

        await assert.rejects(callThrow, (receivedError: unknown) => {
            const formattedErrorMessage = new ErrorFormattedMessage({
                message: CommonError.NOT_FOUND.message,
                properties: thrownProperties,
            });

            assert.equal((receivedError as any).type, 'InternalServerError');
            assert.equal((receivedError as any).name, CommonError.NOT_FOUND.name);
            assert.equal((receivedError as any).message, formattedErrorMessage.text);
            assert.equal((receivedError as any).code, CommonError.NOT_FOUND.httpCode.toString());
            assert.deepEqual((receivedError as any).properties, thrownProperties);
            return true;
        });
    });
});
