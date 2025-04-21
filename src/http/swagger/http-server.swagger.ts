import { ACCOUNT_ID_FIELD } from '#app/shared/authorization/tool/index.js';

export const SWAGGER_SETUP = {
    openapi: {
        openapi: '3.0.0',
        info: {
            title: process.env.npm_package_name ?? '',
            version: process.env.npm_package_version ?? '',
            description: process.env.npm_package_description ?? '',
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    name: ACCOUNT_ID_FIELD,
                    in: 'header',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        externalDocs: {
            url: 'https://swagger.io',
            description: 'Find more info here',
        },
    },
} as const;

export const SWAGGER_UI_SETUP = {
    routePrefix: '/swagger',
    docExpansion: 'full',
} as const;
