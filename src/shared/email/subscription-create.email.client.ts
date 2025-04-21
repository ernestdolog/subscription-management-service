import {
    AbstractEmailSend,
    getSesClient,
    SubscriptionCreateEmail,
    SendEmailCommand,
} from '#app/shared/aws-ses/index.js';

class SubscriptionCreateEmailSendClient extends AbstractEmailSend<SubscriptionCreateEmail> {
    protected _send(emailCommand: SendEmailCommand): Promise<unknown> {
        return getSesClient().send(emailCommand);
    }
}

export const subscriptionCreateEmailSendClient = new SubscriptionCreateEmailSendClient();
