export type CloudWatchAttributes = {
    message_id?: string;
    version: string;
    timestamp: string;
    service: string;
};

export type AbstractEmailAttributes = Omit<
    CloudWatchAttributes,
    'version' | 'timestamp' | 'service'
> &
    Partial<Pick<CloudWatchAttributes, 'version' | 'timestamp' | 'service'>>;
