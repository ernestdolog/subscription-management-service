export type TRequestIdContext = {
    /**
     * Id of client request either injected in the header
     * Either assigned
     * Logging, outgoing api calls
     */
    requestId?: string;
};
