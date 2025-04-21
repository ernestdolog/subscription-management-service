export type CreateUserDto = {
    /**
     * Arbitrary email.
     */
    email?: string;

    /**
     * UNENCRYPTED arbitrary password.
     * Sensitive information
     */
    temporaryPassword?: string;

    /**
     * Primary identifier of Account Domain
     */
    accountId: string;

    /**
     * Holds string of actual object's arbitrary name that this account related to. Like
     * if this account belongs to Service or Person
     */
    entityType: string;

    /**
     * Holds string of related entity's id, usually a primary key
     */
    entityId: string;

    /**
     * Holds string of related subscription's id, the primary key
     */
    subscriptionId: string;
};
