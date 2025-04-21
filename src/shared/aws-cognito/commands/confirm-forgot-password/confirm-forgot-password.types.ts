export type ConfirmForgotPasswordDto = {
    /**
     * Account domain id field.
     */
    accountId: string;

    /**
     * Arbitrary string value
     * Sent out by Aws Cognito to the users email address
     */
    confirmationCode: string;

    /**
     * UNENCRYPTED arbitrary password.
     * Sensitive information
     */
    newPassword: string;
};
