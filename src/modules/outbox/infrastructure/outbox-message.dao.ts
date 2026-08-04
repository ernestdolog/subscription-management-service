import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';
import {
    OutboxMessageEntity,
    OutboxRecord,
    OutboxStatus,
} from '../domain/outbox-message.entity.js';

@Entity({ name: 'outbox_message' })
// Drives the relay drain query: WHERE status = 'pending' AND available_at <= now().
@Index(['status', 'availableAt'])
export class OutboxMessageDao extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    topic: string;

    @Column({ type: 'jsonb' })
    payload: OutboxRecord;

    @Column({ type: 'varchar', default: 'pending' })
    status: OutboxStatus;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'timestamp', default: () => 'now()' })
    availableAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    publishedAt?: Date | null;

    get toEntity(): OutboxMessageEntity {
        return new OutboxMessageEntity(
            this.id,
            this.topic,
            this.payload,
            this.status,
            this.attempts,
            this.availableAt,
            this.createdAt,
            this.publishedAt,
        );
    }
}
