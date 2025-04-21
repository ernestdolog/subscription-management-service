import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { UserResponse } from './response/user.response.js';
import { UserForgotPasswordBody } from './request/user.forgot-password.request.js';
import { UserSetForgotPasswordHandler } from '../../application/user.set-forgot-password.handler.js';

const UserForgotPasswordSchema = {
    tags: ['users'],
    body: UserForgotPasswordBody,
    response: {
        200: UserResponse,
        400: TServerError,
        500: TServerError,
    },
};

export const UserForgotPassword = {
    method: 'POST',
    url: API_PREFIX_V1 + '/users/forgot-password',
    schema: UserForgotPasswordSchema,
    handler: async (
        request: TRequest<typeof UserForgotPasswordSchema>,
        response: TResponse<typeof UserForgotPasswordSchema>,
    ) => {
        const setForgotPasswordHandler = new UserSetForgotPasswordHandler();
        const setForgotPasswordCommand = request.body;
        const user = await setForgotPasswordHandler.execute(setForgotPasswordCommand);
        response.status(200).send(user);
    },
};
