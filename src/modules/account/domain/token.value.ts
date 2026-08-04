import { randomUUID } from 'node:crypto';

/**
 * Token — an opaque generated-credential Value Object (DDD Exemplar 2).
 *
 * The "opaque generated credential" flavour: immutable, generated inside the domain (not
 * in infrastructure), compared by value. The `AccountInvitationEntity` aggregate (Exemplar
 * 1) generates its credential via `Token.create()` — this is what removes the
 * `randomUUID()` generation from the repository/DAO. The aggregate then stores the token as
 * a normalized `string` (see the aggregate's doc for why the persisted field is a primitive
 * rather than a `Token`), so `Token` is applied at the GENERATION boundary.
 *
 * Two construction paths:
 *  - `create()`      — mint a fresh token (the write path; used by the aggregate factory).
 *  - `reconstitute()`— wrap an already-persisted token WITHOUT re-validation, for a codebase
 *                      that types a persisted field as `Token` (shown for completeness).
 */
export class Token {
    private constructor(readonly value: string) {}

    static create(): Token {
        return new Token(randomUUID());
    }

    static reconstitute(raw: string): Token {
        return new Token(raw);
    }

    equals(other: Token): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
