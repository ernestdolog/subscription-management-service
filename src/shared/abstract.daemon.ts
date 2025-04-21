export abstract class AbstractDaemon<TAppConfig> {
    constructor(protected appConfig: TAppConfig) {}

    /**
     * Implement to initialize the daemon
     */
    abstract boot(): Promise<void>;

    /**
     * Implement to start the daemon
     */
    abstract start(): Promise<void>;

    /**
     * Implement to stop the daemon
     */
    abstract stop(): Promise<void>;
}
