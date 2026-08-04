import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Transactional outbox table (DDD Exemplar 3).
 *
 * Business writes enqueue an `outbox_message` row in the SAME transaction as the state
 * change; the relay drains `status = 'pending' AND available_at <= now()` (index below)
 * and publishes to Kafka. `status` terminal state `failed` is the dead-letter.
 */
export class OutboxMessage1785874204000 implements MigrationInterface {
    name = 'OutboxMessage1785874204000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "outbox_message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "topic" character varying NOT NULL,
                "payload" jsonb NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "attempts" integer NOT NULL DEFAULT 0,
                "available_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "published_at" TIMESTAMP,
                CONSTRAINT "PK_outbox_message" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_outbox_message_status_available_at"
            ON "outbox_message" ("status", "available_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_outbox_message_status_available_at"`);
        await queryRunner.query(`DROP TABLE "outbox_message"`);
    }
}
