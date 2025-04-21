/**
 * Http Server Context
 * ===================
 * Information available at each requests asynchroniously.
 */
import { TAuthorizationContext, User } from '#app/shared/authorization/tool/index.js';
import { TRequestIdContext } from '#app/shared/logging/index.js';

export type TRequestContext = TAuthorizationContext & TRequestIdContext;

declare module '@fastify/request-context' {
    interface RequestContextData extends TRequestContext {}
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: User;
    }
}
