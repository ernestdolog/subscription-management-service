import { getLogger } from '#app/shared/logging/index.js';
import { AbstractEventDto } from './abstract.event.dto.js';
import {
    AbstractTransactionManager,
    TypeOrmTransactionManager,
} from '#app/shared/transaction/index.js';

export abstract class AbstractEventListener<TEvent extends AbstractEventDto = AbstractEventDto> {
    protected abstract filter(event: AbstractEventDto): event is TEvent;

    protected abstract execute(event: TEvent): Promise<void>;

    protected abstract get listenerName(): string;

    async listen(event: AbstractEventDto): Promise<boolean> {
        if (!this.filter(event)) {
            return false;
        }

        const log = this.log.child({
            entityId: event.entityId,
            entityType: event.entityType,
            type: event.type,
        });

        log.info('Processing event');

        try {
            await this.runInTransaction(() => this.execute(event));
            log.info('Event processed');
        } catch (error) {
            log.child({ error }).error('Event processing failed');
            throw error;
        }

        return true;
    }

    private async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
        const manager = this.transactionManager;
        if (manager.context) {
            return fn();
        }
        return manager.transaction(async context => {
            manager.context = context;
            return fn();
        });
    }

    protected get transactionManager(): AbstractTransactionManager {
        return new TypeOrmTransactionManager();
    }

    protected get log() {
        return getLogger().child({ listener: this.listenerName });
    }
}
