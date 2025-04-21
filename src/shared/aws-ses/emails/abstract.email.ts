import { SendEmailCommand } from '@aws-sdk/client-ses';
import { AbstractEmailAttributes, CloudWatchAttributes } from './cloud-watch.types.js';

/**
 * Base class for all the email implementations.
 *
 * It has to be extended by each and any of the emails along with Dto and (Tag) Attributes type.
 *
 * @todo: think over: "attribute" is called "dimansion" by aws
 */
export abstract class AbstractEmail<Dto, TagAttributes extends AbstractEmailAttributes> {
    /**
     * To access email Subject within a class instance.
     */
    abstract get subject(): string;

    /**
     * To access email Body within a class instance.
     */
    abstract get body(): string;

    /**
     * To access email From within a class instance.
     */
    abstract get from(): string;

    /**
     * Variables to be appended into the Body and Subject.
     */
    readonly variables: Dto;

    /**
     * Attributes to be appended into the Tags.
     */
    readonly tagAttributes: TagAttributes &
        Pick<CloudWatchAttributes, 'version' | 'timestamp' | 'service'>;

    protected constructor(props: { variables: Dto; attributes?: TagAttributes }) {
        this.variables = props.variables;
        this.tagAttributes = {
            ...props.attributes,
            version: process.env.npm_package_version?.replace(/\./g, '-'),
            timestamp: new Date().getTime().toString(),
            service: process.env.npm_package_name,
        } as TagAttributes & Pick<CloudWatchAttributes, 'version' | 'timestamp' | 'service'>;
    }

    /**
     * Override this method to convert an abstract email to a SendEmailCommand.
     */
    protected compose(): SendEmailCommand {
        let formattedBody = this.body;
        let formattedSubject = this.subject;
        for (const key in this.variables) {
            const replaceWith =
                typeof this.variables[key] === 'string'
                    ? (this.variables[key] as string)
                    : JSON.stringify(this.variables[key]);
            const keyRegex = new RegExp(`:${key}`, 'g');
            formattedBody = formattedBody.replace(keyRegex, replaceWith);
            formattedSubject = formattedSubject.replace(keyRegex, replaceWith);
        }
        const tags =
            this.tagAttributes && typeof this.tagAttributes === 'object'
                ? Object.keys(this.tagAttributes).map(attributeKey => ({
                      Name: attributeKey,
                      Value: (this.tagAttributes as Record<string, string>)[attributeKey],
                  }))
                : [];

        const emailRequest = {
            Destination: {
                ToAddresses: [],
                CcAddresses: [],
                BccAddresses: [],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: formattedBody,
                    },
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: formattedSubject,
                },
            },
            Source: this.from,
            Tags: tags,
        };
        return new SendEmailCommand(emailRequest);
    }

    get(): SendEmailCommand {
        return this.compose();
    }
}
