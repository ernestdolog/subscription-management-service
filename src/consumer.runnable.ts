/**
 * Consumer (Runnable)
 * ===================
 * Starts Kafka consumer with all the bells and whistles
 */
import { Application } from '#app/application.js';
import { appConfig, dataSource, IAppConfig } from '#app/configs/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { HealthServerDaemon } from './consumers/health-server.daemon.js';
import { ConsumerDaemon } from './consumers/consumer.daemon.js';

(async () => {
    getLogger().info('Booting consumer...');
    const app = new Application<IAppConfig>({
        appConfig,
        daemons: [new HealthServerDaemon(appConfig), new ConsumerDaemon(appConfig)],
    });
    getLogger().info('Booting daemons...');
    await app.boot();

    getLogger().info('Creating database connection...');
    await dataSource.initialize();

    getLogger().info('Starting daemons...');
    await app.start();
})();
