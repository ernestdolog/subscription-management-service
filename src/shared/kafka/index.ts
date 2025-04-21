/**
 * kafka
 * =====
 * Message interface to Kafka.

 * A message is implemented using AbstractKafkaMessage class with Dto so producer and
 * subscription can be informed about message format.
 */
export * from './producer/index.js';
export * from './client/index.js';
export * as messages from './messages/index.js';
