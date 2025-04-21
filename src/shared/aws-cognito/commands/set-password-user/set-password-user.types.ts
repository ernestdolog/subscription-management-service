export type SetPasswordUserDto = {
    /**
     * Primary identifier of Account Domain
     */
    accountId: string;

    /**
     * UNENCRYPTED arbitrary password.
     * Sensitive information
     */
    password: string;
};
