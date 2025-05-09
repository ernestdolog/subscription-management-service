process.env = {
    ...process.env,
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
};

import 'reflect-metadata';
import 'dotenv/config';
import { DirectoryScan } from '#app/directory-scan.js';

await (async () => {
    /**
     * Scan all directory files in the Main Thread
     * Do NOT scan test files or migrations.
     * Benefits:
     * - Observer pattern emitters and listeners will be registered
     * - Escalates typeorm metadata and module cache
     * - Counters potential import race condition
     */
    new DirectoryScan(['!(*__tests__*)/**/*.ts']).execute();
})();
