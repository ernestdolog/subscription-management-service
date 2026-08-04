import { Application } from '#app/application.js';
import { appConfig, dataSource, IAppConfig } from '#app/configs/index.js';
import { getLogger } from '#app/shared/logging/index.js';
import { initializeKafkaProducerClient } from './shared/kafka/index.js';
import { HealthServerDaemon } from './event-listener/health-server.daemon.js';
import { EventListenerDaemon } from './event-listener/event-listener.daemon.js';
import { OutboxRelayDaemon } from './event-listener/outbox-relay.daemon.js';

(async () => {
    getLogger().info('Booting event listener...');
    const app = new Application<IAppConfig>({
        appConfig,
        daemons: [
            new HealthServerDaemon(appConfig),
            new EventListenerDaemon(appConfig),
            new OutboxRelayDaemon(appConfig),
        ],
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
