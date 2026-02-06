import { Type } from '@sinclair/typebox';
import { TRequest, TResponse } from '../routes/rest.routes.types.js';

export const HealthSchema = {
    response: {
        200: Type.Literal('OK'),
    },
};

export const Health = {
    method: 'GET',
    url: '/health',
    schema: {
        tags: ['health'],
        response: {
            200: Type.Literal('OK'),
        },
    },
    handler: (_: TRequest, reply: TResponse<typeof HealthSchema>) => {
        reply.status(200).send('OK');
    },
};
