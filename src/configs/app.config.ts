import 'reflect-metadata';
import 'dotenv/config';
import convict, { Schema } from 'convict';
import { IAppConfig } from './app-config.interface.js';

const schema: Schema<IAppConfig> = {
    env: {
        format: ['production', 'development', 'test'],
        default: 'development',
        arg: 'node-env',
        env: 'NODE_ENV',
        doc: 'Node environment',
    },
    logLevel: {
        format: String,
        default: 'info',
        arg: 'log-level',
        env: 'LOG_LEVEL',
        doc: 'Log level',
    },
    http: {
        port: {
            format: Number,
            default: 3000,
            arg: 'http-port',
            env: 'HTTP_PORT',
            doc: 'HTTP port for the server to listen on',
        },
        host: {
            format: String,
            default: '0.0.0.0',
            arg: 'http-host',
            env: 'HTTP_HOST',
            doc: 'HTTP host for the server to listen on',
        },
        corsOrigin: {
            format: String,
            default: '*',
            arg: 'http-cors-origin',
            env: 'HTTP_CORS_ORIGIN',
            doc: 'HTTP cors allowed origin',
        },
    },
    isExposeSwagger: {
        format: Boolean,
        default: false,
        arg: 'is-expose-swagger',
        env: 'IS_EXPOSE_SWAGGER',
        doc: 'If Swagger documentation is exposed',
    },
    events: {
        kafka: {
            clientId: {
                arg: 'events-kafka-client-id',
                env: 'EVENTS_KAFKA_CLIENT_ID',
                format: String,
                default: null,
                doc: 'Kafka clientId',
            },
            brokers: {
                arg: 'events-kafka-brokers',
                env: 'EVENTS_KAFKA_BROKERS',
                format: Array<String>,
                default: null,
                doc: 'String array of Kafka brokers names',
            },
            consumer: {
                groupId: {
                    arg: 'events-kafka-consumer-group-id',
                    env: 'EVENTS_KAFKA_CONSUMER_GROUP_ID',
                    format: String,
                    default: null,
                    doc: 'Id of the consumer group the service uses',
                },
                sessionTimeout: {
                    arg: 'events-kafka-session-timeout',
                    env: 'EVENTS_KAFKA_SESSION_TIMEOUT',
                    format: Number,
                    default: null,
                    doc: 'Kafka session timeout ms',
                },
                heartbeatInterval: {
                    arg: 'events-kafka-heartbeat-interval',
                    env: 'EVENTS_KAFKA_HEARTBEAT_INTERVAL',
                    format: Number,
                    default: null,
                    doc: 'Kafka heartbeat interval. Necessarily lower than session timeout.',
                },
            },
            ssl: {
                arg: 'events-kafka-ssl',
                env: 'EVENTS_KAFKA_SSL',
                format: Boolean,
                default: true,
                doc: 'Kafka communication is encrypted?',
            },
        },
    },
    database: {
        host: {
            format: String,
            default: null,
            arg: 'database-host',
            env: 'DB_HOST',
            doc: 'Database host address',
        },
        port: {
            format: Number,
            default: null,
            arg: 'database-port',
            env: 'DB_PORT',
            doc: 'Database port',
        },
        username: {
            format: String,
            default: null,
            arg: 'database-username',
            env: 'DB_USER',
            doc: 'Database user name',
        },
        password: {
            format: String,
            default: null,
            arg: 'database-password',
            env: 'DB_PASSWORD',
            doc: 'Database user password',
        },
        database: {
            format: String,
            default: null,
            arg: 'database-database',
            env: 'DB_NAME',
            doc: 'Database name',
        },
        logging: {
            format: Boolean,
            default: false,
            arg: 'database-logging',
            env: 'DB_LOGGING',
            doc: 'If database logging switched on',
        },
    },
    aws: {
        cognito: {
            userPoolId: {
                format: String,
                default: null,
                arg: 'cognito-user-pool-id',
                env: 'COGNITO_USER_POOL_ID',
                doc: 'Cognito User Pool Id',
            },
            clientId: {
                format: String,
                default: null,
                arg: 'cognito-client-id',
                env: 'COGNITO_CLIENT_ID',
                doc: 'Cognito Client ID',
            },
        },
        ses: {
            fromNoReplyEmail: {
                format: String,
                default: null,
                arg: 'aws-ses-from-no-reply-email',
                env: 'AWS_SES_FROM_NO_REPLY_EMAIL',
                doc: 'Email address to be used as from in emails to be sent from no-reply',
            },
        },
        cloudFront: {
            url: {
                format: String,
                default: 'https://bla.com',
                arg: 'aws-cloud-front-url',
                env: 'AWS_CLOUD_FRONT_URL',
                doc: 'Url of the cloudfront',
            },
        },
    },
};

const convictDef = convict(schema);

convictDef.validate({ allowed: 'strict' });

export const appConfig = convictDef.getProperties();
