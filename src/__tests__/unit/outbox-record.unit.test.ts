import { toOutboxRecord } from '#app/modules/outbox/domain/index.js';
import { ProducerRecord } from 'kafkajs';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('toOutboxRecord (outbox payload narrowing)', { concurrency: true }, () => {
    it('narrows a string-valued ProducerRecord to the JSON-safe stored shape', () => {
        const record: ProducerRecord = {
            topic: 'subscriptions-subscription-create',
            messages: [
                {
                    value: '{"entityId":"e-1"}',
                    headers: { version: 'v1', topic: 'subscriptions-subscription-create' },
                },
            ],
        };

        const outbox = toOutboxRecord(record);

        assert.equal(outbox.topic, 'subscriptions-subscription-create');
        assert.equal(outbox.messages.length, 1);
        assert.equal(outbox.messages[0].value, '{"entityId":"e-1"}');
        assert.deepEqual(outbox.messages[0].headers, {
            version: 'v1',
            topic: 'subscriptions-subscription-create',
        });
    });

    it('coerces Buffer values and non-string headers to strings (jsonb cannot hold a Buffer)', () => {
        const record: ProducerRecord = {
            topic: 't',
            messages: [{ value: Buffer.from('payload'), headers: { count: '5' } }],
        };

        const outbox = toOutboxRecord(record);

        assert.equal(typeof outbox.messages[0].value, 'string');
        assert.equal(outbox.messages[0].value, 'payload');
        assert.deepEqual(outbox.messages[0].headers, { count: '5' });
    });

    it('handles missing headers', () => {
        const record: ProducerRecord = { topic: 't', messages: [{ value: 'v' }] };

        const outbox = toOutboxRecord(record);

        assert.equal(outbox.messages[0].headers, undefined);
    });
});
