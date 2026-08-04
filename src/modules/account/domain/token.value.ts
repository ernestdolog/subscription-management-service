import { randomUUID } from 'node:crypto';

/**
 * Token — an opaque generated-credential Value Object (DDD Exemplar 2).
 *
 * The "opaque generated credential" flavour: immutable, generated inside the
 * domain (not in infrastructure), compared by value. Owned by the
 * `AccountInvitationEntity` aggregate (Exemplar 1), which is what removes the
 * `randomUUID()` credential generation from the repository/DAO.
 *
 * Two construction paths, mirroring the aggregate:
 *  - `create()`      — mint a fresh token (the write path).
 *  - `reconstitute()`— wrap an already-persisted token WITHOUT re-validation
 *                      (trusted data; the DAO read path).
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
