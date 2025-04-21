export type ILogInfo = {
    /**
     * Context information
     */
    ctx?: { [property: string]: unknown };

    /**
     * Request id if available
     */
    requestId?: string;

    /**
     * Other custom attributes
     */
    [custom: string]: unknown;
};

export type LoggerOptions = {
    name?: string;
    /**
     * Additional options to be removed at logger instatiation
     */
    setupHelpers?: {
        /**
         * Fields in log to be masked.
         */
        maskFields?: string[];
    };
};
