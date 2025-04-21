/**
 * aws-cognito
 * ===========
 * Purpose of the module is to provide a simple command send interface to AWS Cognito, masking technical implementations like client id

 * A Command is implemented extending AbstractCommand class along with Dto and input-Output.
 * Use the awsCognitoClient to send commands
 */
export { getAwsCognitoClient, disconnectAwsCognitoClient } from './aws-cognito.client.js';
export * from './commands/index.js';
