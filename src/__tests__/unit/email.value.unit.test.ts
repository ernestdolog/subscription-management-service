import { Email } from '#app/modules/contact-detail/domain/index.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('Email value object', { concurrency: true }, () => {
    it('rejects a malformed address', () => {
        assert.throws(() => Email.create('not-an-email'));
        assert.throws(() => Email.create('missing@domain'));
        assert.throws(() => Email.create('@no-local.com'));
        assert.throws(() => Email.create(''));
    });

    it('normalizes case and surrounding whitespace', () => {
        assert.equal(Email.create('  Nikolaj@Example.COM  ').toString(), 'nikolaj@example.com');
    });

    it('compares by value (equality-by-value), normalization-aware', () => {
        assert.ok(Email.create('Ivan@Example.com').equals(Email.create('ivan@example.com')));
        assert.ok(!Email.create('ivan@example.com').equals(Email.create('kolya@example.com')));
    });

    it('exposes the normalized value via toString', () => {
        assert.equal(Email.create('Vasya@Example.com').toString(), 'vasya@example.com');
    });
});
