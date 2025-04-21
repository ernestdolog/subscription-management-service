import { DataSource, EntityManager } from 'typeorm';
import { AbstractTransactionManager } from '../tool/abstract.transaction-manager.js';
import { dataSource } from '#app/configs/index.js';

export class TypeOrmTransactionManager extends AbstractTransactionManager<
    'TypeOrm',
    EntityManager
> {
    infrastructure: 'TypeOrm';
    constructor(source: DataSource = dataSource) {
        super();
        this.infrastructure = 'TypeOrm';
        this.transaction = async <ReturnType>(
            callback: (em: EntityManager) => Promise<ReturnType>,
        ): Promise<ReturnType> => {
            return source.transaction(async em => {
                return callback(em);
            });
        };
    }
}
