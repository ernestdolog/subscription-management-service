import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1744917689309 implements MigrationInterface {
    name = 'InitialMigration1744917689309';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "contact_detail_entity_relation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "contact_detail_id" uuid,
                "entity_type" character varying NOT NULL,
                "entity_id" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_ff58f8a5ca52be57d34fe1bef80" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "contact_detail" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "entity_type" character varying NOT NULL,
                "entity_id" uuid NOT NULL,
                "type" character varying NOT NULL,
                "detail" character varying NOT NULL,
                "tag" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying NOT NULL,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_9781aa590b725ffa4631d4566b1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_0c50d453b1f398dcc177bb14fc" ON "contact_detail" (
                "entity_id",
                "entity_type",
                "type",
                "tag",
                "detail"
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_11401b714cf11fe1351a4c8d77" ON "contact_detail" ("entity_id", "entity_type")
        `);
        await queryRunner.query(`
            CREATE TABLE "person_entity_relation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "person_id" uuid,
                "entity_type" character varying NOT NULL,
                "entity_id" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_18cee083cffca833a8bdd58401a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "person" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" character varying,
                "last_name" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "subscription" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account_entity_relation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "account_id" uuid,
                "entity_type" character varying NOT NULL,
                "entity_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_44b5e6339c2e93f452037b75764" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account_invitation" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "account_id" uuid NOT NULL,
                "token" character varying NOT NULL DEFAULT '3c8a0348-5d51-44eb-af03-8d77f28bc253',
                "is_valid" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_25f527dbcc0338b7a7f563e3a6e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "account" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "entity_type" character varying NOT NULL,
                "entity_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_by" character varying,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_by" character varying,
                "deleted_by" character varying,
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "contact_detail_entity_relation"
            ADD CONSTRAINT "FK_87bfb1788f35ba7d2ec7ac5b2e0" FOREIGN KEY ("contact_detail_id") REFERENCES "contact_detail"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "person_entity_relation"
            ADD CONSTRAINT "FK_558ee279896323f45d1467bf239" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_entity_relation"
            ADD CONSTRAINT "FK_2e40a6f1586731ef03560a878ca" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "account_invitation"
            ADD CONSTRAINT "FK_9785355db302e9f27229f3f5069" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "account_invitation" DROP CONSTRAINT "FK_9785355db302e9f27229f3f5069"
        `);
        await queryRunner.query(`
            ALTER TABLE "account_entity_relation" DROP CONSTRAINT "FK_2e40a6f1586731ef03560a878ca"
        `);
        await queryRunner.query(`
            ALTER TABLE "person_entity_relation" DROP CONSTRAINT "FK_558ee279896323f45d1467bf239"
        `);
        await queryRunner.query(`
            ALTER TABLE "contact_detail_entity_relation" DROP CONSTRAINT "FK_87bfb1788f35ba7d2ec7ac5b2e0"
        `);
        await queryRunner.query(`
            DROP TABLE "account"
        `);
        await queryRunner.query(`
            DROP TABLE "account_invitation"
        `);
        await queryRunner.query(`
            DROP TABLE "account_entity_relation"
        `);
        await queryRunner.query(`
            DROP TABLE "subscription"
        `);
        await queryRunner.query(`
            DROP TABLE "person"
        `);
        await queryRunner.query(`
            DROP TABLE "person_entity_relation"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_11401b714cf11fe1351a4c8d77"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0c50d453b1f398dcc177bb14fc"
        `);
        await queryRunner.query(`
            DROP TABLE "contact_detail"
        `);
        await queryRunner.query(`
            DROP TABLE "contact_detail_entity_relation"
        `);
    }
}
