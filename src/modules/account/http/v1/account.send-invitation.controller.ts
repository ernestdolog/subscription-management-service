import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { AccountSendInvitationParams } from './request/account.send-invitation.request.js';
import { AccountResponse, toAccountResponse } from './response/account.response.js';
import { auth } from '#app/shared/authorization/plugins/fastify/fastify.authenticated.route.js';
import { PersonAccountSendInvitationHandler } from '#app/modules/account/application/person-account.send-invitation.handler.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';

export const AccountSendInvitationSchema = {
    tags: ['accounts'],
    security: [{ BearerAuth: [] }],
    params: AccountSendInvitationParams,
    response: {
        200: AccountResponse,
        500: TServerError,
    },
};

export const AccountSendInvitation = {
    method: 'POST',
    url: API_PREFIX_V1 + '/accounts/:id/send-invitation',
    schema: AccountSendInvitationSchema,
    onRequest: auth().check,
    handler: async (
        request: TRequest<typeof AccountSendInvitationSchema>,
        response: TResponse<typeof AccountSendInvitationSchema>,
    ) => {
        const sendInvitation = new PersonAccountSendInvitationHandler(
            new TypeOrmTransactionManager(),
        );
        const result = await sendInvitation.run({ id: request.params.id, user: request.user! });

        const account = toAccountResponse(result);
        response.status(201).send(account);
    },
};
