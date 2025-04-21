import { appConfig } from '#app/configs/index.js';
import { AbstractEmail } from '../abstract.email.js';
import { AbstractEmailAttributes } from '../cloud-watch.types.js';
import { SubscriptionCreateDto } from './subscription-create-email.types.js';

export class SubscriptionCreateEmail extends AbstractEmail<
    SubscriptionCreateDto,
    AbstractEmailAttributes
> {
    constructor(props: {
        variables: SubscriptionCreateDto;
        tagAttributes: AbstractEmailAttributes;
    }) {
        super(props);
    }

    get subject(): string {
        return `Deine Reise beginnt – Aktiviere deinen Zugang!`;
    }

    get body(): string {
        return `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Aktiviere dein Konto</title>
            </head>
            <body>
                <div>Willkommen!</div>
                <br/>
                <p>Entdecke alles, was zu bieten hat – von Finanzübersichten bis hin zu nützlichen Tools rund um dein Unternehmen.</p>
                <br/>
                <p>Aktiviere jetzt deinen Zugang:</p>
                <p>Klicke auf den folgenden Link, um dein Konto zu aktivieren und loszulegen: <a href=":link" target="_blank">:link</a></p>
                <br/>
                <p>Wir freuen uns, dich an Bord zu haben!</p>
                <br/>
                <p>Beste Grüße,</p>
                <p>Das HudriWudri-Team</p>
                <br/>
                <p>Diese E-Mail wurde automatisch generiert. Bitte nicht darauf antworten.</p>
            </body>
            </html>
        `;
    }

    get from(): string {
        return appConfig.aws.ses.fromNoReplyEmail;
    }
}
