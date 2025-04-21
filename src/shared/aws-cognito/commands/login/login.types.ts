export type LoginDto = {
    /**
     * Primary identifier of Account Domain
     */
    accountId?: string;

    /**
     * Arbitrary email.
     */
    email?: string;

    /**
     * UNENCRYPTED arbitrary password.
     * Sensitive informationn
     */
    password: string;
};
