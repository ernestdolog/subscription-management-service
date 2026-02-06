import {
    ContextConfigDefault,
    FastifyReply,
    FastifyRequest,
    FastifySchema,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
    RouteGenericInterface,
} from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

export type TRequest<TSchema extends FastifySchema = FastifySchema> = FastifyRequest<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    TSchema,
    TypeBoxTypeProvider
>;

export type TResponse<TSchema extends FastifySchema = FastifySchema> = FastifyReply<
    RouteGenericInterface,
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    ContextConfigDefault,
    TSchema,
    TypeBoxTypeProvider
>;
