/**
 * Health Server Executable Daemon
 * ===============================
 * Contains the implementation of a Health Server.
 */
import Fastify, { FastifyInstance } from 'fastify';
import { AbstractDaemon } from '#app/shared/index.js';
import { IAppConfig } from '#app/configs/app-config.interface.js';
import { getLogger } from '#app/shared/logging/index.js';

export class HealthServerDaemon extends AbstractDaemon<IAppConfig> {
    private httpServer: FastifyInstance;

    constructor(protected appConfig: IAppConfig) {
        super(appConfig);
    }

    get server(): Fastify.FastifyInstance {
        return this.httpServer;
    }

    async boot(): Promise<void> {
        this.setupExecpetionHandling();
        const app = Fastify({
            logger: false,
        });

        app.get('/health', (_, reply) => {
            reply.status(200).send('OK');
        });

        this.httpServer = app;
    }

    async start(): Promise<void> {
        const address = await this.server.listen({
            port: this.appConfig.http.port,
            host: this.appConfig.http.host,
        });
        this.l.info('Started Health Server at %s', address);
    }

    async stop(code = 0): Promise<void> {
        if (this.server) {
            this.server.close();
            getLogger().info('Health Server shut down!');
        }
        process.exit(code);
    }

    private setupExecpetionHandling() {
        const l = getLogger();
        process.on('uncaughtException', async exception => {
            l.error('uncaught exception', { e: exception });
            await this.stop(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            l.error('unhandled rejection', { reason: reason, promise: promise });
        });

        process.on('SIGINT', () => this.stop(0));
        process.on('SIGTERM', () => this.stop(0));
    }

    private get l() {
        return getLogger().child({
            cls: 'HealthServerDaemon',
        });
    }
}
