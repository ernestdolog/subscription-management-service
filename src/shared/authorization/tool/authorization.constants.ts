/**
 * The plugin/middleware looks for this key in a request's header.
 * Message Headers: it says "Field names are case-insensitive." That's the why node HTTP sets all headers to lower case automatically.
 */
export const AUTHORIZATION_TOKEN_HEADER = 'authorization' as const;
/**
 * Field names in cognito
 */
export const ACCOUNT_ID_FIELD = 'custom:account_id' as const;
export const ENTITY_TYPE_FIELD = 'custom:entity_type' as const;
export const ENTITY_ID_FIELD = 'custom:entity_id' as const;
export const SUBSCRIPTION_ID_FIELD = 'custom:subscription_id' as const;
