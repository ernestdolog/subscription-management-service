type TFormatMessageProperties = {
    message: string;
    properties: Record<string, unknown>;
};

export class ErrorFormattedMessage {
    constructor(private input: TFormatMessageProperties) {}

    get text(): string {
        for (const key in this.input.properties) {
            const replaceWith =
                typeof this.input.properties[key] === 'string'
                    ? (this.input.properties[key] as string)
                    : JSON.stringify(this.input.properties[key]);
            this.input.message = this.input.message.replace(`:${key}`, replaceWith);
        }

        return this.input.message;
    }
}
