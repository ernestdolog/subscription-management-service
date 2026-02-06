import { Application } from '#app/application.js';
import { appConfig, dataSource, IAppConfig } from '#app/configs/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { HealthServerDaemon } from './event-listener/health-server.daemon.js';
import { EventListenerDaemon } from './event-listener/event-listener.daemon.js';

(async () => {
    getLogger().info('Booting event listener...');
    const app = new Application<IAppConfig>({
        appConfig,
        daemons: [new HealthServerDaemon(appConfig), new EventListenerDaemon(appConfig)],
    });
    getLogger().info('Booting daemons...');
    await app.boot();

    getLogger().info('Creating database connection...');
    await dataSource.initialize();

    getLogger().info('Starting daemons...');
    await app.start();
})();
