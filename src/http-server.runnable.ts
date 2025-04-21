/**
 * Http Server (Runnable)
 * ======================
 * Starts HTTP server with all the bells and whistles
 */
import { Application } from '#app/application.js';
import { appConfig, IAppConfig } from '#app/configs/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { dataSource } from './configs/typeorm.config.js';
import { HttpServerDaemon } from '#app/http/http-server.daemon.js';
import { initializeKafkaProducerClient } from './shared/kafka/index.js';

(async () => {
    getLogger().info('Booting app...');
    const app = new Application<IAppConfig>({
        appConfig,
        daemons: [new HttpServerDaemon(appConfig)],
    });
    getLogger().info('Booting daemons...');
    await app.boot();

    getLogger().info('Creating database connection...');
    await dataSource.initialize();

    getLogger().info('Creating producer connection...');
    await initializeKafkaProducerClient();

    getLogger().info('Starting daemons...');
    await app.start();
})();
