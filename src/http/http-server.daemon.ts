/**
 * Api Server Executable Daemon
 * ============================
 * Contains the implementation of a Http Server.
 */
import Fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AbstractDaemon } from '#app/shared/index.js';
import { IAppConfig } from '#app/configs/app-config.interface.js';
import { getLogger } from '#app/shared/logging/index.js';
import { fastifyRequestContext } from '@fastify/request-context';
import { AuthorizationTokenContext } from '#app/shared/authorization/plugins/fastify/index.js';
import { RequestIdContext } from '#app/shared/logging/plugins/fastify/index.js';
import { ErrorHandler } from '#app/shared/error/plugins/fastify/index.js';
import { SWAGGER_SETUP, SWAGGER_UI_SETUP } from '#app/http/swagger/http-server.swagger.js';
import cors from '@fastify/cors';
import { Routes } from './routes/rest.routes.js';

export class HttpServerDaemon extends AbstractDaemon<IAppConfig> {
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

        app.setErrorHandler(ErrorHandler);

        app.register(fastifyRequestContext, {
            defaultStoreValues: request => ({
                ...AuthorizationTokenContext(request),
                ...RequestIdContext(request),
            }),
        });

        app.register(cors, {
            origin: this.appConfig.http.corsOrigin,
        });

        if (this.appConfig.isExposeSwagger) {
            app.register(swagger, SWAGGER_SETUP);
            app.register(swaggerUi, SWAGGER_UI_SETUP);
            app.register(Routes);
            await app.ready();
            app.swagger();
        } else {
            app.register(Routes);
        }

        this.httpServer = app;
    }

    async start(): Promise<void> {
        const address = await this.server.listen({
            port: this.appConfig.http.port,
            host: this.appConfig.http.host,
        });
        this.l.info('Started Api Server at %s', address);
    }

    async stop(code = 0): Promise<void> {
        if (this.server) {
            this.server.close();
            getLogger().info('Api Server shut down!');
        }
        process.exit(code);
    }

    private setupExecpetionHandling() {
        const l = getLogger();
        process.on('uncaughtException', async exception => {
            l.child({ ctx: { exception } }).error('uncaught exception');
            await this.stop(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            l.child({ ctx: { reason: reason, promise: promise } }).error('unhandled rejection');
        });

        process.on('SIGINT', () => this.stop(0));
        process.on('SIGTERM', () => this.stop(0));
    }

    private get l() {
        return getLogger().child({
            cls: 'ApiServerDaemon',
        });
    }
}
