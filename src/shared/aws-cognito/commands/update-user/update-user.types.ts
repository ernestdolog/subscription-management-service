import { User } from '#app/shared/authorization/tool/index.js';

export type UpdateUserDto = {
    /**
     * Primary identifier of Account Domain
     */
    accountId: string;

    /**
     * Arbitrary email.
     */
    email?: string;

    /**
     * The User entity as it is
     */
    user: User;
};
