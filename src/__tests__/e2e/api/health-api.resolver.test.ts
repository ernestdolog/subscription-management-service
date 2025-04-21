import { it, describe } from 'node:test';
import assert from 'node:assert/strict';
import { useTestApplication } from '#app/__tests__/api-client.setup.js';

describe('test health api', async () => {
    it('respond with 200', async () => {
        const result = await useTestApplication({ isAuthorized: false }).get<'OK'>('/health');
        assert.equal(result.status, 200);
        assert.equal(result.ok, true);
        const text = await result.text();
        assert.equal(text, 'OK');
    });
});
