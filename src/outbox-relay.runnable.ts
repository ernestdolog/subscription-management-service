import { Application } from '#app/application.js';
import { appConfig, dataSource, IAppConfig } from '#app/configs/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { initializeKafkaProducerClient } from './shared/kafka/index.js';
import { HealthServerDaemon } from './health-server/health-server.daemon.js';
import { OutboxRelayDaemon } from './outbox-relay/outbox-relay.daemon.js';

(async () => {
    getLogger().info('Booting outbox relay...');
    const app = new Application<IAppConfig>({
        appConfig,
        daemons: [new HealthServerDaemon(appConfig), new OutboxRelayDaemon(appConfig)],
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
