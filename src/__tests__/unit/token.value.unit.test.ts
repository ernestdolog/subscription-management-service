import { Token } from '#app/modules/account/domain/index.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('Token value object', { concurrency: true }, () => {
    it('mints a fresh uuid on create', () => {
        assert.match(Token.create().toString(), UUID_V4);
    });

    it('mints a distinct token each time', () => {
        assert.notEqual(Token.create().toString(), Token.create().toString());
    });

    it('reconstitute wraps a persisted value WITHOUT re-validating it', () => {
        // Trusted data — reconstitute must not reject a non-uuid persisted token.
        assert.equal(Token.reconstitute('legacy-token-value').toString(), 'legacy-token-value');
    });

    it('compares by value (equality-by-value)', () => {
        const raw = Token.create().toString();
        assert.ok(Token.reconstitute(raw).equals(Token.reconstitute(raw)));
        assert.ok(!Token.create().equals(Token.create()));
    });
});
