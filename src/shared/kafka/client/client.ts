import { Kafka, KafkaConfig } from 'kafkajs';
import { KafkaAppLogger } from './kafka-logger.js';
import { appConfig } from '#app/configs/index.js';
import { generateAuthToken } from 'aws-msk-iam-sasl-signer-js';

async function oauthBearerTokenProvider(region: string) {
    const authTokenResponse = await generateAuthToken({ region });
    return {
        value: authTokenResponse.token,
    };
}

let kafkaClient: Kafka;

/**
 * Provides cached Kafka client. Creates new if isn't cached.
 */
export function getKafkaClient(): Kafka {
    const config: KafkaConfig = {
        clientId: appConfig.events.kafka.clientId,
        brokers: appConfig.events.kafka.brokers,
        ssl: appConfig.events.kafka.ssl,
        logCreator: KafkaAppLogger,
    };
    if (config.ssl === true) {
        config.sasl = {
            mechanism: 'oauthbearer',
            oauthBearerProvider: () => oauthBearerTokenProvider('eu-central-1'),
        };
    }
    if (!kafkaClient) {
        kafkaClient = new Kafka(config);
    }
    return kafkaClient;
}
