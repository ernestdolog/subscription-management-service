import { IHeaders, ProducerRecord } from 'kafkajs';

export type OutboxStatus = 'pending' | 'published' | 'failed';

/**
 * A JSON-safe projection of a kafkajs `ProducerRecord` for the `payload jsonb` column.
 *
 * The raw `ProducerRecord` type admits `Buffer` message values and `IHeaders` — neither
 * round-trips losslessly through `jsonb`. `AbstractKafkaEvent.compose` always emits string
 * values + string headers at runtime, so we narrow to that here: the column type does not lie.
 */
export type OutboxRecord = {
    topic: string;
    messages: Array<{ value: string; headers?: Record<string, string> }>;
};

function normalizeHeaders(headers?: IHeaders): Record<string, string> | undefined {
    if (!headers) return undefined;
    return Object.fromEntries(Object.entries(headers).map(([key, value]) => [key, String(value)]));
}

/** Narrow a validated `ProducerRecord` (from `event.get()`) into the JSON-safe stored shape. */
export function toOutboxRecord(record: ProducerRecord): OutboxRecord {
    return {
        topic: record.topic,
        messages: record.messages.map(message => ({
            value: String(message.value ?? ''),
            headers: normalizeHeaders(message.headers),
        })),
    };
}

export class OutboxMessageEntity {
    constructor(
        public id: string,
        public topic: string,
        public payload: OutboxRecord,
        public status: OutboxStatus,
        public attempts: number,
        public availableAt: Date,
        public createdAt: Date,
        public publishedAt?: Date | null,
    ) {}
}
