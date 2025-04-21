import { getLogger } from '#app/shared/logging/index.js';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';

describe('Logger', { concurrency: true }, () => {
    it('passes variables and message into console write', t => {
        // @ts-ignore
        const ets = t.mock.method(console._stdout, 'write');
        /**
         * call function
         * before and after exaqmine how many times
         * console write was called
         */
        assert.strictEqual(ets.mock.calls.length, 0);
        getLogger()
            .child({ fn: 'callerName', ctx: { loggedFieldName: 'loggedFielValue' } })
            .info('loggedMessage');
        assert.strictEqual(ets.mock.calls.length, 1);
        /**
         * get metadata of the first call of console write
         */
        const call = ets.mock.calls[0];
        /**
         * does it log correctly?
         */
        assert.match(call.arguments[0], /loggedFieldName":"loggedFielValue/gi);
        assert.match(call.arguments[0], /loggedMessage/gi);
    });

    it('password direct key', t => {
        // @ts-ignore
        const ets = t.mock.method(console._stdout, 'write');

        getLogger({ fn: 'callerName', ctx: { password: 'mysecret' } }).info(
            'log with pwd redacted',
        );

        const call = ets.mock.calls[0];
        assert.match(call.arguments[0], /password":"--REDACTED--/gi);
    });

    it('password direct multiply nested key', t => {
        // @ts-ignore
        const ets = t.mock.method(console._stdout, 'write');

        getLogger({
            fn: 'callerName',
            ctx: { input: { data: { user: { password: 'mysecret', username: 'name' } } } },
        }).info('log with pwd redacted');

        const call = ets.mock.calls[0];
        assert.match(call.arguments[0], /password":"--REDACTED--/gi);
    });

    it('scramble password with child logger', t => {
        // @ts-ignore
        const ets = t.mock.method(console._stdout, 'write');

        getLogger()
            .child({ fn: 'callerName', ctx: { password: 'mysecret' } })
            .info('log with child with pwd');

        const call = ets.mock.calls[0];
        assert.match(call.arguments[0], /password":"--REDACTED--/gi);
    });
});
