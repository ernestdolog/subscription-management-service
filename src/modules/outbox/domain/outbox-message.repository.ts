import { ProducerRecord } from 'kafkajs';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { getTypeOrmOutboxRepository } from '../infrastructure/outbox-message.typeorm.repository.js';
import { OutboxMessageEntity } from './outbox-message.entity.js';

export interface OutboxMessageRepository {
    /** Write path — INSERT a pending row inside the caller's (business) transaction. */
    enqueue(record: ProducerRecord): Promise<void>;
    /** Relay path — claim due rows with FOR UPDATE SKIP LOCKED (must run in a transaction). */
    claimPending(limit: number): Promise<OutboxMessageEntity[]>;
    markPublished(id: string): Promise<void>;
    reschedule(id: string, attempts: number, availableAt: Date): Promise<void>;
    markFailed(id: string, attempts: number): Promise<void>;
}

export function getOutboxRepository(manager: AbstractTransactionManager): OutboxMessageRepository {
    if (manager.infrastructure === 'TypeOrm') {
        return getTypeOrmOutboxRepository(manager);
    }
    throw new InternalServerError(CommonError.NOT_IMPLEMENTED, {
        resource: `OutboxMessageRepository ${manager.infrastructure} extension`,
    });
}
