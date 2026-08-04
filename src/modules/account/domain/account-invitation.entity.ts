import { randomUUID } from 'node:crypto';
import { User } from '#app/shared/authorization/tool/authorization.user.entity.js';
import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';
import { AccountEntity } from './account.entity.js';
import { Token } from './token.value.js';

/**
 * Raw persistence shape for {@link AccountInvitationEntity.reconstitute}. `token` is a
 * STRING here (the DB column) and `account` is an already-reconstituted relation — both
 * lifted into their domain forms by `reconstitute`. Plain scalars/dates only: no VOs.
 */
export type AccountInvitationData = {
    id: string;
    accountId: string;
    account: AccountEntity | undefined;
    token: string;
    isValid: boolean;
    createdAt: Date;
    createdBy?: string;
    updatedAt?: Date;
    updatedBy?: string;
    deletedBy?: string | null;
    deletedAt?: Date | null;
};

/**
 * AccountInvitationEntity — THE rich-aggregate reference (DDD Exemplar 1).
 *
 * The one rich aggregate in this repo, on purpose: private ctor, a validating `create()`
 * factory that owns the creation invariant (a fresh token + `isValid`) instead of leaking
 * it into the repository, a no-revalidation `reconstitute()` for the trusted DB read path,
 * `readonly` fields, and an IMMUTABLE `revoke()` that returns a new instance.
 *
 * The credential is generated in the domain via the {@link Token} VO (`Token.create()`),
 * but is STORED as a normalized `string`, not a `Token` field. This mirrors the `Email`
 * boundary-VO decision: this codebase maps domain->DAO structurally (AccountEntity embeds
 * `invitations`, and the account repo relies on `token: string` compatibility), so a
 * `Token`-typed field would ripple destructively through the account aggregate's
 * persistence. The VO is applied at the generation boundary; the persisted field is a
 * primitive.
 *
 * Immutable transitions are the TARGET pattern. The other 8 entities (incl.
 * `SubscriptionEntity.addAccount`) still mutate `this` and return it — the legacy baseline.
 * Do not half-migrate them by copying half of this file; copy the whole shape or none.
 */
export class AccountInvitationEntity {
    private constructor(
        readonly id: string,
        readonly accountId: string,
        readonly account: AccountEntity | undefined,
        readonly token: string,
        readonly isValid: boolean,
        readonly createdAt: Date,
        readonly createdBy?: string,
        readonly updatedAt?: Date,
        readonly updatedBy?: string,
        readonly deletedBy?: string | null,
        readonly deletedAt?: Date | null,
    ) {}

    /**
     * Write path — the creation invariant lives in the DOMAIN, not the repository:
     * a new invitation is always `isValid` and carries a freshly generated `Token`.
     * Identity is generated here (the aggregate owns its id from birth).
     */
    static create(props: { accountId: string; createdBy: string }): AccountInvitationEntity {
        const now = new Date();
        return new AccountInvitationEntity(
            randomUUID(),
            props.accountId,
            undefined,
            Token.create().toString(),
            true,
            now,
            props.createdBy,
            now,
            props.createdBy,
        );
    }

    /** Rehydration from persistence — NO re-validation of already-trusted data. */
    static reconstitute(row: AccountInvitationData): AccountInvitationEntity {
        return new AccountInvitationEntity(
            row.id,
            row.accountId,
            row.account,
            row.token,
            row.isValid,
            row.createdAt,
            row.createdBy,
            row.updatedAt,
            row.updatedBy,
            row.deletedBy,
            row.deletedAt,
        );
    }

    /**
     * Immutable state transition — enforces the invariant (valid + owned) and returns a
     * NEW instance via the private ctor. It keeps the existing `Token` VO and does NOT
     * spread `...this` (which would drag the VO + `account` relation into a raw row).
     */
    revoke(user: User): AccountInvitationEntity {
        const isValid = this.isValid;
        const isUser = this.accountId === user.accountId;
        if (!isValid || !isUser) throw new InternalServerError(CommonError.FORBIDDEN);
        return new AccountInvitationEntity(
            this.id,
            this.accountId,
            this.account,
            this.token,
            false,
            this.createdAt,
            this.createdBy,
            this.updatedAt,
            user.accountId,
            this.deletedBy,
            this.deletedAt,
        );
    }
}
