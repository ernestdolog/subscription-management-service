import { dataSource } from '#app/configs/index.js';
import { EntityManager } from 'typeorm';
import { ProducerRecord } from 'kafkajs';
import { OutboxMessageDao } from './outbox-message.dao.js';
import { AbstractTransactionManager } from '#app/shared/transaction/index.js';
import { OutboxMessageEntity, toOutboxRecord } from '../domain/outbox-message.entity.js';

const getTypeOrmRepository = () =>
    dataSource.getRepository<OutboxMessageDao>(OutboxMessageDao).extend({
        async enqueue(record: ProducerRecord): Promise<void> {
            const outboxMessage = this.create({
                topic: record.topic,
                payload: toOutboxRecord(record),
                status: 'pending',
                attempts: 0,
            });
            await this.save(outboxMessage);
        },
        async claimPending(limit: number): Promise<OutboxMessageEntity[]> {
            // FOR UPDATE SKIP LOCKED: two relay instances (or overlapping ticks) never grab
            // the same rows. Requires an open transaction — the drain provides one.
            const rows = await this.createQueryBuilder('outbox')
                .where('outbox.status = :status', { status: 'pending' })
                .andWhere('outbox.availableAt <= now()')
                .orderBy('outbox.availableAt', 'ASC')
                .limit(limit)
                .setLock('pessimistic_write')
                .setOnLocked('skip_locked')
                .getMany();
            return rows.map(row => row.toEntity);
        },
        async markPublished(id: string): Promise<void> {
            await this.update({ id }, { status: 'published', publishedAt: new Date() });
        },
        async reschedule(id: string, attempts: number, availableAt: Date): Promise<void> {
            await this.update({ id }, { attempts, availableAt });
        },
        async markFailed(id: string, attempts: number): Promise<void> {
            await this.update({ id }, { status: 'failed', attempts });
        },
    });

export function getTypeOrmOutboxRepository(manager: AbstractTransactionManager) {
    const typeOrmOutboxRepository = getTypeOrmRepository();
    if (!manager.context) return typeOrmOutboxRepository;
    const entityManager = manager.context as EntityManager;
    return entityManager.withRepository(typeOrmOutboxRepository);
}
