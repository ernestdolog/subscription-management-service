import { User } from './authorization.user.entity.js';

export type TAuthorizationClientProperties = {
    userPoolId: string;
    clientId: string;
};

export type TAuthorizationContext = {
    /**
     * JWT Token containing the logged in Users credidentals
     * Outgoing api calls
     */
    authorizationToken?: string;
};

export type TAuthorizationServerontext = {
    user?: User;
};

export type TAuthorizationRole = Partial<Pick<User, 'entityType'>>;
