export interface IAppConfig {
    env: 'production' | 'development' | 'test';
    logLevel: string;
    http: { port: number; host: string; corsOrigin: string };
    isExposeSwagger: boolean;
    events: {
        kafka: {
            clientId: string;
            brokers: string[];
            consumer: {
                groupId: string;
                sessionTimeout: number;
                heartbeatInterval: number;
            };
            ssl: boolean;
        };
    };
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        logging: boolean;
    };
    aws: {
        cognito: {
            userPoolId: string;
            clientId: string;
        };
        ses: {
            fromNoReplyEmail: string;
        };
        cloudFront: {
            url: string;
        };
    };
}
