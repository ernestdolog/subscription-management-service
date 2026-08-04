import { CommonError } from '#app/shared/error/index.js';
import { InternalServerError } from '#app/shared/error/plugins/fastify/server.error.js';

/**
 * Email — a self-validating Value Object (DDD Exemplar 2).
 *
 * The "self-validating value" flavour: immutable, validates + normalizes on
 * construction, and compares by value. It is used as a BOUNDARY type — parse a
 * raw string into an `Email` at the domain edge (the create/lookup path), then
 * hand its normalized `.toString()` to the persistence layer and the wire.
 *
 * Why a boundary VO and not the `ContactDetailEntity.detail` field type: `detail`
 * is a DISCRIMINATED column (keyed by `ContactDetailType`, and part of a unique
 * index) — it is only sometimes an email — so typing the field `Email` would be
 * incorrect. Normalizing here (trim + lowercase) is load-bearing: the same
 * normalized value must be used on BOTH write and the `isEmailAlreadyTaken`
 * lookup, or the uniqueness check and the unique index disagree on case-variants.
 */
export class Email {
    private constructor(readonly value: string) {}

    static create(raw: string): Email {
        const normalized = raw.trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
            throw new InternalServerError(CommonError.VALIDATION, {
                resource: 'Email',
                value: raw,
            });
        }
        return new Email(normalized);
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
