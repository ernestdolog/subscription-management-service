import { AccountFilterInput } from './account-filter.input.js';
import { AccountOrderByInput } from './account-orderby.input.js';
import { Static, Type } from '@sinclair/typebox';
import { DEFAULT_PAGE_SIZE } from '#app/shared/rest-typeorm-query/index.js';

export const AccountListParams = Type.Object(
    {
        filters: Type.Optional(Type.Array(AccountFilterInput)),
        orderBy: Type.Optional(AccountOrderByInput),
        first: Type.Number({ default: DEFAULT_PAGE_SIZE }),
        after: Type.Optional(Type.String()),
    },
    { additionalProperties: false, title: 'AccountListBody' },
);
export type AccountListParams = Static<typeof AccountListParams>;
