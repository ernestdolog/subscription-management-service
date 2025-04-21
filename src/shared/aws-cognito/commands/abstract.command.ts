import { ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-cognito-identity-provider';
import { Command } from '@smithy/types';

/**
 * Base class for all the command implementations.
 *
 * It has to be extended by each and any of the commands along with Dto and input-Output.
 *
 */
export abstract class AbstractCommand<
    Dto,
    TCommandInput extends ServiceInputTypes,
    TCommandOutput extends ServiceOutputTypes,
> {
    /**
     * To access Aws command input (from the internal system) inside the class.
     */
    abstract get input(): TCommandInput;

    /**
     * Variables to be sent along the command from the system.
     */
    readonly properties: Dto;

    protected constructor(properties: Dto) {
        this.properties = properties;
    }

    /**
     * Override this method to convert an abstract command to an Aws Target Command.
     */
    protected abstract compose(): Command<
        ServiceInputTypes,
        TCommandInput,
        ServiceOutputTypes,
        TCommandOutput,
        never
    >;

    get(): Command<ServiceInputTypes, TCommandInput, ServiceOutputTypes, TCommandOutput, never> {
        return this.compose();
    }
}
