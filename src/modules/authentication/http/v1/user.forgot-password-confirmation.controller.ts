import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { UserResponse } from './response/user.response.js';
import { UserForgotPasswordConfirmationBody } from './request/user.forgot-password-confirmation.request.js';
import { UserConfirmForgotPasswordHandler } from '../../application/user.confirm-forgot-password.handler.js';

const UserForgotPasswordConfirmationSchema = {
    tags: ['users'],
    body: UserForgotPasswordConfirmationBody,
    response: {
        200: UserResponse,
        400: TServerError,
        500: TServerError,
    },
};

export const UserForgotPasswordConfirmation = {
    method: 'PUT',
    url: API_PREFIX_V1 + '/users/forgot-password',
    schema: UserForgotPasswordConfirmationSchema,
    handler: async (
        request: TRequest<typeof UserForgotPasswordConfirmationSchema>,
        response: TResponse<typeof UserForgotPasswordConfirmationSchema>,
    ) => {
        const confirmationHandler = new UserConfirmForgotPasswordHandler();
        const confirmationCommand = request.body;
        const user = await confirmationHandler.execute(confirmationCommand);
        response.status(200).send(user);
    },
};
