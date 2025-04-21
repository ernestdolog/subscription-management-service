import { FastifyRequest } from 'fastify';
import { REQUEST_ID_HEADER, RequestId, TRequestIdContext } from '../../request-id/index.js';
import { requestContext } from '@fastify/request-context';

const computeRequestId = (request: FastifyRequest): string => {
    let requestId = request.headers[REQUEST_ID_HEADER];
    if (!requestId) {
        requestId = new RequestId().value;
    }
    return requestId as string;
};

export const RequestIdContext = (request: FastifyRequest): TRequestIdContext => ({
    requestId: computeRequestId(request),
});

export const getRequestId = (): string | undefined => {
    return requestContext.get('requestId');
};
