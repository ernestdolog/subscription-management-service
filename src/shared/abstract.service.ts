/**
 * The Abstract Service
 * ====================
 * Extendable class serving out only one public function "run"
 * To comply with Single Objective Principle
 * Function runs in one single database transaction
 * Application layer class
 */
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';

export abstract class AbstractService<InputType, ReturnType> {
    constructor(protected transactionManager: AbstractTransactionManager) {}
    /**
     * Implement to provide functionality
     */
    protected abstract runInTransaction(properties: InputType): Promise<ReturnType>;

    async run(properties: InputType): Promise<ReturnType> {
        if (this.transactionManager.context) {
            return this.runInTransaction(properties);
        }
        return this.transactionManager.transaction(async context => {
            this.transactionManager.context = context;
            return this.runInTransaction(properties);
        });
    }
}
