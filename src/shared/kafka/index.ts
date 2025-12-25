/**
 * kafka
 * =====
 * Event interface to Kafka.

 * An event is implemented using AbstractKafkaEvent class with Dto so producer and
 * subscription can be informed about event format.
 */
export * from './producer/index.js';
export * from './client/index.js';
export * as events from './events/index.js';
