/**
 * aws-ses
 * =============
 * Purpose of the module is to provide a simple email interface to AWS SES.

 * An Email is implemented extending AbstractEmail class with Dto and (Tag) Attributes.
 * An Email send is implemented extending AbstractEmailSend class as usage example suggests
 */
export * from './send/index.js';
export * from './aws-ses.client.js';
export { SendEmailCommand } from '@aws-sdk/client-ses';
export * from './emails/index.js';
