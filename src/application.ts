import { AbstractDaemon } from '#app/shared/abstract.daemon.js';
import { getLogger } from '#app/shared/logging/index.js';
/**
 * Application class to provide straightforward way to setup the application
 */
export class Application<TAppConfig> {
    readonly options: Required<ApplicationOption<TAppConfig>>;

    constructor(options: ApplicationOption<TAppConfig>) {
        this.options = options ?? {};
    }

    async boot(): Promise<void> {
        if (this.options.daemons.length > 0) {
            await Promise.all(
                this.options.daemons.map(async daemon => {
                    this.l.debug('Booting daemon: %s', daemon.constructor.name);
                    await daemon.boot();
                }),
            );
        }
    }

    async start(): Promise<void> {
        if (this.options.daemons.length > 0) {
            await Promise.all(
                this.options.daemons.map(async daemon => {
                    this.l.debug('Starting daemon: %s', daemon.constructor.name);
                    await daemon.start();
                }),
            );
        }
    }

    async stop(): Promise<void> {
        if (this.options.daemons.length > 0) {
            await Promise.all(
                this.options.daemons.map(async daemon => {
                    this.l.debug('Stopping daemon: %s', daemon.constructor.name);
                    await daemon.stop();
                }),
            );
        }
    }

    private get l() {
        return getLogger({ cls: 'Application' });
    }
}

type ApplicationOption<TAppConfig> = {
    appConfig: TAppConfig;
    daemons: Array<AbstractDaemon<TAppConfig>>;
};
