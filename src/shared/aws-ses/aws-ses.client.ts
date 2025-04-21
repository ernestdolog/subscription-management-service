import { SESClient } from '@aws-sdk/client-ses';

let sesClient: SESClient;

/**
 * Provides cached Aws Ses client. Creates new if isn't cached.
 */
export function getSesClient(): SESClient {
    if (!sesClient) sesClient = new SESClient();
    return sesClient;
}

/**
 * Disconnect the Aws Ses client.
 */
export async function disconnectSesClient(): Promise<void> {
    if (sesClient) sesClient.destroy();
}
