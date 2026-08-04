import { AccountInvitationEntity } from '#app/modules/account/domain/index.js';
import { User, UserEntityType } from '#app/shared/authorization/tool/index.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const userFor = (accountId: string): User => ({
    accountId,
    entityId: 'entity-1',
    entityType: UserEntityType.PERSON,
    subscriptionId: 'subscription-1',
});

describe('AccountInvitationEntity (rich aggregate)', { concurrency: true }, () => {
    it('create() enforces the invariant: isValid + a fresh Token, in the domain', () => {
        const invitation = AccountInvitationEntity.create({
            accountId: 'acc-1',
            createdBy: 'acc-1',
        });
        assert.equal(invitation.isValid, true);
        assert.match(invitation.token, UUID_V4); // generated in the domain via Token.create()
        assert.equal(invitation.accountId, 'acc-1');
        assert.equal(invitation.createdBy, 'acc-1');
    });

    it('revoke() returns a NEW instance and leaves the original untouched (immutable)', () => {
        const invitation = AccountInvitationEntity.create({
            accountId: 'acc-1',
            createdBy: 'acc-1',
        });
        const revoked = invitation.revoke(userFor('acc-1'));
        assert.notEqual(revoked, invitation);
        assert.equal(invitation.isValid, true); // original unchanged
        assert.equal(revoked.isValid, false);
        assert.equal(revoked.updatedBy, 'acc-1');
        assert.equal(revoked.token, invitation.token); // token carried over unchanged
    });

    it('revoke() throws for a non-owner', () => {
        const invitation = AccountInvitationEntity.create({
            accountId: 'acc-1',
            createdBy: 'acc-1',
        });
        assert.throws(() => invitation.revoke(userFor('someone-else')));
    });

    it('revoke() throws when already revoked', () => {
        const invitation = AccountInvitationEntity.create({
            accountId: 'acc-1',
            createdBy: 'acc-1',
        });
        const revoked = invitation.revoke(userFor('acc-1'));
        assert.throws(() => revoked.revoke(userFor('acc-1')));
    });

    it('reconstitute() rehydrates trusted persistence WITHOUT re-validation', () => {
        const invitation = AccountInvitationEntity.reconstitute({
            id: 'inv-1',
            accountId: 'acc-1',
            account: undefined,
            token: 'persisted-token',
            isValid: false,
            createdAt: new Date('2026-01-01'),
        });
        assert.equal(invitation.id, 'inv-1');
        assert.equal(invitation.token, 'persisted-token'); // trusted value, no re-validation
        assert.equal(invitation.isValid, false);
    });
});
