import { FastifyPluginCallback } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { RequestBodyCompiler } from '#app/shared/body-parse/index.js';
import * as subscriptionApi from '#app/modules/subscription/http/index.js';
import * as accountApi from '#app/modules/account/http/index.js';
import { Health } from '../health/health.controller.js';
import * as personApi from '#app/modules/person/http/index.js';
import * as contactDetailApi from '#app/modules/contact-detail/http/index.js';
import * as authenticationApi from '#app/modules/authentication/http/index.js';

export const Routes: FastifyPluginCallback = childServer => {
    childServer.withTypeProvider<TypeBoxTypeProvider>().setValidatorCompiler(RequestBodyCompiler);

    childServer.route(Health);

    childServer.route(subscriptionApi.v1.SubscriptionCreate);
    childServer.route(subscriptionApi.v1.SubscriptionUpdate);
    childServer.route(subscriptionApi.v1.SubscriptionRetrieve);

    childServer.route(accountApi.v1.AccountCreate);
    childServer.route(accountApi.v1.AccountVerify);
    childServer.route(accountApi.v1.AccountDelete);
    childServer.route(accountApi.v1.AccountRetrieve);
    childServer.route(accountApi.v1.AccountRetrieveMe);
    childServer.route(accountApi.v1.AccountUpdateMe);
    childServer.route(accountApi.v1.AccountSendInvitation);

    childServer.route(personApi.v1.PersonUpdate);
    childServer.route(personApi.v1.PersonRetrieve);
    childServer.route(personApi.v1.PersonMeRetrieve);

    childServer.route(contactDetailApi.v1.ContactDetailUpdate);

    childServer.route(authenticationApi.v1.AuthenticationLogin);
    childServer.route(authenticationApi.v1.AuthenticationLogout);
    childServer.route(authenticationApi.v1.AuthenticationRefreshToken);

    childServer.route(authenticationApi.v1.UserForgotPasswordConfirmation);
    childServer.route(authenticationApi.v1.UserForgotPassword);
    childServer.route(authenticationApi.v1.UserSetPassword);
};
