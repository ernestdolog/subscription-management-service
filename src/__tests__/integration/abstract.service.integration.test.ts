import '#app/__tests__/database.setup.js';
import assert from 'node:assert/strict';
import { it, describe } from 'node:test';
import { AbstractService } from '#app/shared/abstract.service.js';
import { faker } from '@faker-js/faker';
import { personFactory } from '../factories/person.factory.js';
import {
    AbstractTransactionManager,
    TypeOrmTransactionManager,
} from '#app/shared/transaction/index.js';
import { getTypeOrmPersonRepository } from '#app/modules/person/infrastructure/person.typeorm.repository.js';

describe('AbstractService', async () => {
    /**
     * Update Person firstName successfully
     * There is a transaction with id inside the service
     *
     * After the check, initiate new database operation - which must be in a different transaction
     */
    it('is executed in transaction', async () => {
        const person = await personFactory().save();
        const newFirstName = faker.person.firstName();

        const manager = new TypeOrmTransactionManager();

        const databaseOperation = new DatabaseOperationService(manager);
        const transaction = await databaseOperation.run({
            callback: async (em: AbstractTransactionManager) => {
                await getTypeOrmPersonRepository(em).preserve(person.id, {
                    firstName: newFirstName,
                });
            },
        });

        const updatedPerson = await getTypeOrmPersonRepository(
            new TypeOrmTransactionManager(),
        ).findOneOrFail({ where: { id: person.id } });
        assert.equal(updatedPerson.firstName, newFirstName);

        assert.equal(!!transaction.transactionId, true);

        const postomusTransaction = (await getTypeOrmPersonRepository(
            new TypeOrmTransactionManager(),
        ).query('SELECT txid_current();')) as { txid_current: string }[];

        assert.notEqual(postomusTransaction[0].txid_current, transaction.transactionId);
    });
    /**
     * Update Person data successfully
     * The nested database operation retrieves its own transaction id, and the nested services transaction id
     * Both services, in top and bottom level must use the very same transaction
     *
     * After the check, initiate new database operation - which must be in a different transaction
     */
    it('nested services work with the same transaction', async () => {
        const person = await personFactory().save();
        const newFirstName = faker.person.firstName();
        const newLastName = faker.person.lastName();

        const manager = new TypeOrmTransactionManager();

        const nestedDatabaseOperation = new NestedDatabaseOperationService(manager);
        const nestedTransaction = await nestedDatabaseOperation.run({
            callback: async (em: AbstractTransactionManager) => {
                await getTypeOrmPersonRepository(em).update(
                    { id: person.id },
                    { firstName: newFirstName },
                );
            },
            nestedCallback: async (em: AbstractTransactionManager) => {
                await getTypeOrmPersonRepository(em).update(
                    { id: person.id },
                    { lastName: newLastName },
                );
            },
        });

        const updatedPerson = await getTypeOrmPersonRepository(
            new TypeOrmTransactionManager(),
        ).findOneOrFail({ where: { id: person.id } });
        assert.equal(updatedPerson.firstName, newFirstName);
        assert.equal(updatedPerson.lastName, newLastName);

        assert.equal(!!nestedTransaction.transactionId, true);
        assert.equal(!!nestedTransaction.nestedTransactionId, true);

        assert.equal(nestedTransaction.nestedTransactionId, nestedTransaction.transactionId);

        const postomusTransaction = (await getTypeOrmPersonRepository(
            new TypeOrmTransactionManager(),
        ).query('SELECT txid_current();')) as { txid_current: string }[];

        assert.notEqual(postomusTransaction[0].txid_current, nestedTransaction.transactionId);
    });
});

type TDatabaseOperationProps = {
    callback: (manager: AbstractTransactionManager) => Promise<void>;
};

type TTransactionMetadata = {
    transactionId: string;
};

export class DatabaseOperationService extends AbstractService<
    TDatabaseOperationProps,
    TTransactionMetadata
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }

    /**
     * Execute one database related callback with the transactional entity manager
     * Retrieves transaction id
     */
    protected async runInTransaction(
        props: TDatabaseOperationProps,
    ): Promise<TTransactionMetadata> {
        await props.callback(this.manager);

        const transaction = (await this.someRepository.query('SELECT txid_current();')) as {
            txid_current: string;
        }[];
        return { transactionId: transaction[0].txid_current };
    }
    private get someRepository() {
        return getTypeOrmPersonRepository(this.manager);
    }
}

type TNestedDatabaseOperationProps = {
    callback: (manager: AbstractTransactionManager) => Promise<void>;
    nestedCallback: (manager: AbstractTransactionManager) => Promise<void>;
};

type TNestedTransactionMetadata = {
    transactionId: string;
    nestedTransactionId: string;
};

export class NestedDatabaseOperationService extends AbstractService<
    TNestedDatabaseOperationProps,
    TNestedTransactionMetadata
> {
    constructor(protected manager: AbstractTransactionManager) {
        super(manager);
    }
    /**
     * Execute one database related callback with the transactional entity manager
     * Calls an other Service where it initiates an other database related callback with its oewn transactional entity manager
     * Retrieves transaction id
     * Retrieves transaction id from the service it calls
     */
    protected async runInTransaction(
        props: TNestedDatabaseOperationProps,
    ): Promise<TNestedTransactionMetadata> {
        await props.callback(this.manager);

        const nestedDatabaseOperation = new DatabaseOperationService(this.manager);
        const nestedTransaction = await nestedDatabaseOperation.run({
            callback: props.nestedCallback,
        });
        const transaction = (await this.someRepository.query('SELECT txid_current();')) as {
            txid_current: string;
        }[];
        return {
            transactionId: transaction[0].txid_current,
            nestedTransactionId: nestedTransaction.transactionId,
        };
    }
    private get someRepository() {
        return getTypeOrmPersonRepository(this.manager);
    }
}
