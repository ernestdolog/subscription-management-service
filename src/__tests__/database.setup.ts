/**
 * The Test Database
 * =================
 * Provides a mirrored test database for running tests on a stateful app.
 *
 * The test database connection appends {{PREFIX_TEST_DATABASE}} to the production database name.
 * Migrations are executed in the freshly created database.
 *
 * Each test suite operates independently with its own dedicated database connection
 * ensuring concurrency is not a concern.
 */
import { beforeEach, before, after } from 'node:test';
import { DataSourceOptions } from 'typeorm';
import { dataSource } from '#app/configs/index.js';
import { setDataSourceOptions } from 'typeorm-extension';

before(async () => {
    await provideTestDatabase();
});

beforeEach(async () => {
    await truncateTables();
});

after(async () => {
    await disconnectDatabase();
});

const PREFIX_TEST_DATABASE = 'test_';

async function provideTestDatabase(): Promise<void> {
    const baseConnection = await dataSource.initialize();
    const testDataBaseName = `${PREFIX_TEST_DATABASE}${dataSource.options.database}`;
    await baseConnection.query(`DROP DATABASE IF EXISTS ${testDataBaseName}`);
    await baseConnection.query(`CREATE DATABASE ${testDataBaseName}`);
    /**
     * Test db will be connected and used.
     */
    await baseConnection.destroy();

    const testConfiguration = {};
    Object.assign(testConfiguration, dataSource.options, { database: testDataBaseName });

    await dataSource.setOptions(testConfiguration as DataSourceOptions).initialize();

    await dataSource.runMigrations({ transaction: 'all' });
    /**
     * "infect" seeder with test database connection configuration
     */
    setDataSourceOptions(testConfiguration as DataSourceOptions);
}

/**
 * Closes the active connection.
 */
async function disconnectDatabase(): Promise<void> {
    if (dataSource.isInitialized) {
        await dataSource.dropDatabase();
        await dataSource.destroy();
    }
}

/**
 * truncateTables: truncates tables only if {{PREFIX_TEST_DATABASE}} found in database name
 * TODO: this is heavy&&slow, cloud build minutes cost money, do smth about it
 */
async function truncateTables(): Promise<void> {
    const res = await dataSource.query(`SELECT current_database();`);

    if ((res[0].current_database as string).indexOf(PREFIX_TEST_DATABASE) === -1) {
        throw new Error('truncate only possible with test connection');
    }

    const tableName = dataSource /**
     * Postgres being Postgres
     */.entityMetadatas
        .map(meta => `"${meta.tableName}"`)
        .join(',');

    await dataSource.query(`TRUNCATE ${tableName} RESTART IDENTITY CASCADE ;`);
}
