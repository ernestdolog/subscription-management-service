import { AbstractDaemon } from '#app/shared/abstract.daemon.js';
import { IAppConfig } from '#app/configs/app-config.interface.js';
import { getLogger } from '#app/shared/logging/index.js';
import { getKafkaProducerClient } from '#app/shared/kafka/index.js';
import { TypeOrmTransactionManager } from '#app/shared/transaction/index.js';
import {
    getOutboxRepository,
    OutboxMessageEntity,
    OutboxMessageRepository,
} from '#app/modules/outbox/domain/index.js';

const POLL_INTERVAL_MS = 1000;
const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 1000;

/**
 * Transactional-outbox relay (DDD Exemplar 3).
 *
 * Drains `outbox_message` rows written in the business transaction and publishes them to
 * Kafka. Co-located in the event-listener runtime (not a third process). Delivery is
 * at-least-once — absorbed because the consumers are idempotent (create = exists-check,
 * update = full-state overwrite).
 */
export class OutboxRelayDaemon extends AbstractDaemon<IAppConfig> {
    private timer?: NodeJS.Timeout;
    private isStopped = false;

    async boot(): Promise<void> {}

    async start(): Promise<void> {
        // Self-rescheduling timer that RESOLVES immediately — Application.start() awaits
        // Promise.all(daemons.map(d => d.start())); a blocking loop here would wedge boot
        // and the health/consumer daemons would never start.
        this.scheduleNext(0);
    }

    async stop(): Promise<void> {
        this.isStopped = true;
        if (this.timer) clearTimeout(this.timer);
    }

    private scheduleNext(delayMs: number): void {
        if (this.isStopped) return;
        this.timer = setTimeout(() => void this.tick(), delayMs);
    }

    private async tick(): Promise<void> {
        try {
            const drained = await this.drain();
            // Keep draining with no delay while there is work; back off to the poll interval when idle.
            this.scheduleNext(drained > 0 ? 0 : POLL_INTERVAL_MS);
        } catch (error) {
            this.log.child({ error }).error('Outbox relay tick failed');
            this.scheduleNext(POLL_INTERVAL_MS);
        }
    }

    private async drain(): Promise<number> {
        // A fresh manager per drain (never a shared singleton — that would leak tx context).
        // The SKIP LOCKED claim and the status updates run in ONE transaction, so each locked
        // row is held until commit.
        const manager = new TypeOrmTransactionManager();
        return manager.transaction(async context => {
            manager.context = context;
            const repository = getOutboxRepository(manager);
            const pending = await repository.claimPending(BATCH_SIZE);
            for (const message of pending) {
                await this.publish(repository, message);
            }
            return pending.length;
        });
    }

    private async publish(
        repository: OutboxMessageRepository,
        message: OutboxMessageEntity,
    ): Promise<void> {
        try {
            const producer = await getKafkaProducerClient();
            await producer.send(message.payload);
            await repository.markPublished(message.id);
        } catch (error) {
            const attempts = message.attempts + 1;
            if (attempts >= MAX_ATTEMPTS) {
                await repository.markFailed(message.id, attempts);
                this.log.child({ id: message.id, error }).error('Outbox message dead-lettered');
                return;
            }
            const availableAt = new Date(Date.now() + BASE_BACKOFF_MS * 2 ** (attempts - 1));
            await repository.reschedule(message.id, attempts, availableAt);
        }
    }

    private get log() {
        return getLogger().child({ cls: 'OutboxRelayDaemon' });
    }
}
