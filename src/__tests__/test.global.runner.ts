/**
 * The Global Test Runner
 * ======================
 * Provides global test setup.
 *
 * Because of node test runners concurrency this is elemental.
 *
 * TODO:
 * - figure some test suite recognition @see https://github.com/nodejs/node/issues/49732
 * - figure how to run only test suites with this global, and not the global as a suite
 */
import './framework.setup.js';
import { run } from 'node:test';
import process from 'node:process';
import { spec } from 'node:test/reporters';
import { finished } from 'node:stream';

let isTestFailing = false;

const stream = run({
    files: [
        './src/__tests__/unit/internal-server.error.unit.test.ts',
        './src/__tests__/unit/get-user.types.test.ts',
        './src/__tests__/unit/logger.unit.test.ts',

        './src/__tests__/integration/abstract.service.integration.test.ts',
        './src/__tests__/integration/user.create.service.integration.test.ts',
        './src/__tests__/integration/subscription-create.consumer.test.ts',
        './src/__tests__/integration/subscription-update.consumer.test.ts',

        './src/__tests__/e2e/api/account.create.controller.test.ts',
        './src/__tests__/e2e/api/account.delete.controller.test.ts',
        './src/__tests__/e2e/api/account.retrieve.controller.test.ts',
        './src/__tests__/e2e/api/health-api.resolver.test.ts',
        './src/__tests__/e2e/api/person.update.controller.test.ts',
        './src/__tests__/e2e/api/person.retrieve.controller.test.ts',
        './src/__tests__/e2e/api/subscription.create.controller.test.ts',
        './src/__tests__/e2e/api/subscription.update.controller.test.ts',
        './src/__tests__/e2e/api/subscription.retrieve.controller.test.ts',
        './src/__tests__/e2e/api/contact-detail.update.controller.test.ts',

        './src/__tests__/e2e/api/authentication.login.controller.test.ts',
        './src/__tests__/e2e/api/authentication.logout.controller.test.ts',
        './src/__tests__/e2e/api/authentication.refresh-token.controller.test.ts',
        './src/__tests__/e2e/api/user.forgot-password-confirmation.controller.test.ts',
        './src/__tests__/e2e/api/user.forgot-password.controller.test.ts',
    ],
    /**
     * As after integration, and e2e tests we truncate databases
     * This should not happen paralelly, unless we figure a way to only delete the data added at that test with a one-liner
     */
    concurrency: false,
})
    .on('test:fail', () => {
        isTestFailing = true;
    })
    .compose(new spec());

stream.pipe(process.stdout);

finished(stream, () => {
    if (isTestFailing === true) {
        process.exitCode = 1;
    }
});
