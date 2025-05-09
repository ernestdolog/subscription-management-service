import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { AccountDao } from './account.dao.js';
import { AccountInvitationEntity } from '../domain/account-invitation.entity.js';

@Entity({ name: 'account_invitation' })
export class AccountInvitationDao extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    accountId: string;

    @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
    @ManyToOne(() => AccountDao, account => account.invitations, {
        onDelete: 'CASCADE',
    })
    account?: Relation<AccountDao>;

    @Column({ type: 'varchar', default: randomUUID() })
    token: string;

    @Column({ type: 'boolean', default: true })
    isValid: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'varchar', nullable: true })
    createdBy?: string;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'varchar', nullable: true })
    updatedBy?: string;

    @Column({ type: 'varchar', nullable: true })
    deletedBy?: string | null;

    @DeleteDateColumn()
    deletedAt?: Date | null;

    get toEntity(): AccountInvitationEntity {
        return new AccountInvitationEntity(
            this.id,
            this.accountId,
            this.account?.toEntity,
            this.token,
            this.isValid,
            this.createdAt,
            this.createdBy,
            this.updatedAt,
            this.updatedBy,
            this.deletedBy,
            this.deletedAt,
        );
    }
}
