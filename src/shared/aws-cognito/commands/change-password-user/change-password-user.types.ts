export type ChangePasswordUserDto = {
    /**
     * JWT Token Provided by Aws stored in the Clients Cookies.
     */
    accessToken: string;

    /**
     * UNENCRYPTED arbitrary password.
     * Sensitive information
     */
    oldPassword: string;

    /**
     * UNENCRYPTED arbitrary password.
     * Sensitive information
     */
    newPassword: string;
};
