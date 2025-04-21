import { SendEmailCommand } from '@aws-sdk/client-ses';
import { AbstractEmail } from '../emails/abstract.email.js';
import { AbstractEmailAttributes } from '../emails/cloud-watch.types.js';

/**
 * Example usage:
 *
 * class InviteAccountEmailSendClient extends AbstractEmailSend<InviteAccountEmail> {
 *   protected _send(emailCmd: SendEmailCommand): Promise<unknown> {
 *       return getSesClient().send(emailCmd);
 *   }
 * }
 *
 * class InviteAccountEmailSendClientWithError extends AbstractEmailSend<InviteAccountEmail> {
 *  protected _send(emailCmd: SendEmailCommand): Promise<unknown> {
 *      try {
 *         return getSesClient().send(emailCmd);
 *       } catch (error) {
 *         throw new RoutingControllersError(CommonError.EMAIL_ERROR, { field: `Email had some issue` });
 *       }
 *   }
 * }
 */

/**
 * Base class for all the email send classes.
 */
export abstract class AbstractEmailSend<T extends AbstractEmail<unknown, AbstractEmailAttributes>> {
    /**
     * Wraps addressee(-s) and email message
     * Sends it
     */
    async send(props: { to: string[]; cc?: string[]; bcc?: string[]; email: T }): Promise<unknown> {
        const emailCommand = props.email.get();
        emailCommand.input.Destination!.ToAddresses = props.to;
        emailCommand.input.Destination!.CcAddresses = props.cc;
        emailCommand.input.Destination!.BccAddresses = props.bcc;
        return this._send(emailCommand);
    }

    /**
     * Implement this method to the given email send logic.
     */
    protected abstract _send(emailCommand: SendEmailCommand): Promise<unknown>;
}
