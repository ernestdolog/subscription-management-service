import { Static, Type } from '@sinclair/typebox';

export const AccountSendInvitationParams = Type.Object(
    {
        id: Type.String(),
    },
    { title: 'AccountSendInvitationParams' },
);

export type AccountSendInvitationParams = Static<typeof AccountSendInvitationParams>;
