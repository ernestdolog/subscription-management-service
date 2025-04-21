import {
    AbstractEmailSend,
    getSesClient,
    AccountCreateEmail,
    SendEmailCommand,
} from '#app/shared/aws-ses/index.js';

export class AccountCreateEmailSendClient extends AbstractEmailSend<AccountCreateEmail> {
    protected _send(emailCommand: SendEmailCommand): Promise<unknown> {
        return getSesClient().send(emailCommand);
    }
}

export const accountCreateEmailSendClient = new AccountCreateEmailSendClient();
