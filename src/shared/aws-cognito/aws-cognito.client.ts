import { getLogger } from '#app/shared/logging/index.js';
import { FinalizeHandler, FinalizeHandlerArguments, FinalizeHandlerOutput } from '@aws-sdk/types';
import {
    CognitoIdentityProviderClient,
    CognitoIdentityProviderServiceException,
    UserNotFoundException,
    NotAuthorizedException,
    ServiceInputTypes,
    ServiceOutputTypes,
} from '@aws-sdk/client-cognito-identity-provider';
import { AbstractCommand } from './commands/abstract.command.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/index.js';
import { CommonError } from '../error/index.js';
import { CognitoError } from './cognito.error.js';

/**
 * The AWS Cognito Client
 * ======================
 * Purpose of the module is to provide a simple cached interface to AWS Cognito.
 */
export interface IAwsCognitoClient {
    send<Dto, TCommandInput extends ServiceInputTypes, TCommandOutput extends ServiceOutputTypes>(
        abstractCommand: AbstractCommand<Dto, TCommandInput, TCommandOutput>,
    ): Promise<TCommandOutput>;
}

class AwsCognitoClient implements IAwsCognitoClient {
    private client: CognitoIdentityProviderClient;

    public constructor() {
        this.client = new CognitoIdentityProviderClient();
        this._initializeCommandInterceptor();
    }

    private _initializeCommandInterceptor() {
        this.client.middlewareStack.add(this._executeCommand as never, { step: 'finalizeRequest' });
    }

    private _executeCommand(
        next: FinalizeHandler<never, never>,
    ): (args: FinalizeHandlerArguments<never>) => Promise<FinalizeHandlerOutput<never>> {
        return async (args: FinalizeHandlerArguments<never>) => {
            try {
                return await next(args);
            } catch (error) {
                if (error instanceof UserNotFoundException) {
                    throw new InternalServerError(CognitoError.USER_NOT_FOUND, { error });
                } else if (error instanceof NotAuthorizedException) {
                    if (error.message === 'Incorrect username or password.') {
                        throw new InternalServerError(CognitoError.INVALID_LOGIN_CREDIDENTALS);
                    }
                    throw new InternalServerError(CommonError.UNAUTHORIZED);
                } else if (error instanceof CognitoIdentityProviderServiceException) {
                    throw new InternalServerError(CognitoError.COGNITO_ERROR, { error });
                } else {
                    throw error;
                }
            }
        };
    }

    async send<
        Dto,
        TCommandInput extends ServiceInputTypes,
        TCommandOutput extends ServiceOutputTypes,
    >(
        abstractCommand: AbstractCommand<Dto, TCommandInput, TCommandOutput>,
    ): Promise<TCommandOutput> {
        const command = abstractCommand.get();
        const l = this.l.child({
            fn: 'send',
            ctx: command,
        });
        l.debug('start');
        const res = await this.client.send(command);
        l.debug('success');
        return res;
    }

    destroy(): void {
        this.client.destroy();
    }

    private get l() {
        return getLogger().child({
            cls: 'AwsCognitoClient',
        });
    }
}

let awsCognitoClient: AwsCognitoClient;

/**
 * Provides cached Aws Cognito client. Creates new if isn't cached.
 */
export function getAwsCognitoClient(): IAwsCognitoClient {
    if (!awsCognitoClient) awsCognitoClient = new AwsCognitoClient();
    return awsCognitoClient;
}

/**
 * Disconnect the Aws Cognito client.
 */
export function disconnectAwsCognitoClient(): void {
    if (awsCognitoClient) awsCognitoClient.destroy();
}
