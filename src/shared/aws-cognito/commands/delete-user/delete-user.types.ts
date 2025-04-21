export type DeleteUserDto = {
    /**
     * Primary identifier of Account Domain
     */
    accountId?: string;

    /**
     * Arbitrary email.
     */
    email?: string;
};
