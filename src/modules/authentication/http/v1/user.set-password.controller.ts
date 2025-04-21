import { API_PREFIX_V1, TRequest, TResponse } from '#app/http/index.js';
import { TServerError } from '#app/shared/error/plugins/fastify/index.js';
import { UserResponse } from './response/user.response.js';
import { UserSetPasswordBody } from './request/user.set-password.request.js';
import { UserSetPasswordHandler } from '../../application/user.set-password.handler.js';

const UserSetPasswordSchema = {
    tags: ['users'],
    body: UserSetPasswordBody,
    response: {
        200: UserResponse,
        400: TServerError,
        500: TServerError,
    },
};

export const UserSetPassword = {
    method: 'PUT',
    url: API_PREFIX_V1 + '/users/password',
    schema: UserSetPasswordSchema,
    handler: async (
        request: TRequest<typeof UserSetPasswordSchema>,
        response: TResponse<typeof UserSetPasswordSchema>,
    ) => {
        const setPasswordHandler = new UserSetPasswordHandler();
        const setPasswordCommand = request.body;
        const user = await setPasswordHandler.execute(setPasswordCommand);
        response.status(200).send(user);
    },
};
