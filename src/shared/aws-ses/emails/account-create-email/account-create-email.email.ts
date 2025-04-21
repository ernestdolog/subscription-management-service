import { appConfig } from '#app/configs/index.js';
import { AbstractEmail } from '../abstract.email.js';
import { AbstractEmailAttributes } from '../cloud-watch.types.js';
import { AccountCreateEmailDto } from './account-create-email.types.js';

export class AccountCreateEmail extends AbstractEmail<
    AccountCreateEmailDto,
    AbstractEmailAttributes
> {
    constructor(props: {
        variables: AccountCreateEmailDto;
        tagAttributes: AbstractEmailAttributes;
    }) {
        super(props);
    }

    get subject(): string {
        return `Aktiviere deinen Zugang`;
    }

    get body(): string {
        return `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Activation Email</title>
        </head>
        <body>
            <div>Hallo,</div>
            <br/>
            <div>Du wurdest eingeladen, alle Möglichkeiten dieser Plattform zu entdecken – von der Verwaltung deiner Finanzen bis hin zur Erkundung neuer Funktionen.</div>
            <br/>
            <div>Aktiviere jetzt deinen Zugang:</div>
            <div>Klicke auf den folgenden Link, um deinen Account zu aktivieren und sofort loszulegen: <a href=":link" target="_blank">:link</a></div>
            <br/>
            <div>Wir freuen uns darauf, dich zu begrüßen!</div>
            <br/>
            <div>Beste Grüße,</div>
            <div>Dein HudriWudri-Team</div>
            <br/>
            <div>Diese E-Mail wurde automatisch generiert. Bitte antworte nicht darauf.</div>
        </body>
        </html>
        `;
    }

    get from(): string {
        return appConfig.aws.ses.fromNoReplyEmail;
    }
}
