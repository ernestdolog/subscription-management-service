/**
 * The Test Server
 * ===============
 * Provides test server to e2e test.
 *
 * Optionally can send authentication, using Bearer token
 */
import { after, before } from 'node:test';
import { appConfig } from '#app/configs/index.js';
import { Application } from '#app/application.js';
import { User } from '#app/shared/authorization/tool/index.js';
import { getAuthHeaders } from './api-client.authentication.js';
import { ApiServerDaemon } from '#app/api-server/api-server.daemon.js';

const application = new Application({ appConfig, daemons: [new ApiServerDaemon(appConfig)] });

before(async () => {
    await application.boot();
    await application.start();
});

after(async () => {
    /**
     * Explicitly resolve a promise BEFORE App Removal
     * To ensure notification to stdout before stopping the app
     */
    await new Promise(resolve => setTimeout(resolve, 0));
    await application.stop();
});

type TestClientProperties =
    | {
          isAuthorized: false;
          user?: Partial<User>;
          headers?: Record<string, string> | undefined;
      }
    | {
          isAuthorized: true;
          user: Partial<User>;
          headers?: Record<string, string> | undefined;
      };

type FetchResponse<ResponseType> = {
    json(): Promise<ResponseType extends string ? never : ResponseType>;
    text(): Promise<ResponseType extends string ? string : never>;
    arrayBuffer(): Promise<ArrayBuffer>;
    headers: Headers;
    status: number;
    ok: boolean;
};
/**
 * Expose the application and create fetch functions to test the API.
 */
export function useTestApplication(props: TestClientProperties) {
    const buildQueryString = (query?: Record<string, unknown>) => {
        if (!query) return '';

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(query)) {
            if (value === undefined) continue;

            if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                params.append(key, String(value));
                continue;
            }

            if (Array.isArray(value)) {
                params.append(key, JSON.stringify(value));
                continue;
            }

            params.append(key, JSON.stringify(value));
        }

        const qeryString = params.toString();
        return qeryString ? `?${qeryString}` : '';
    };
    return {
        application,
        async post<BodyType, ResponseType>(
            path: string,
            body: BodyType,
        ): Promise<FetchResponse<ResponseType>> {
            const authHeader = props.isAuthorized ? getAuthHeaders(props.user) : undefined;
            const response: Response = await fetch(
                `http://localhost:${appConfig.http.port}${path}`,
                {
                    method: 'POST',
                    headers: {
                        ...props.headers,
                        ...authHeader,
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify(body),
                },
            );
            return response as unknown as FetchResponse<ResponseType>;
        },
        async put<BodyType, ResponseType>(
            path: string,
            body: BodyType,
        ): Promise<FetchResponse<ResponseType>> {
            const authHeader = props.isAuthorized ? getAuthHeaders(props.user) : undefined;
            const response: Response = await fetch(
                `http://localhost:${appConfig.http.port}${path}`,
                {
                    method: 'PUT',
                    headers: {
                        ...props.headers,
                        ...authHeader,
                        'Content-type': 'application/json',
                    },
                    body: JSON.stringify(body),
                },
            );
            return response as unknown as FetchResponse<ResponseType>;
        },
        async delete<ResponseType>(path: string): Promise<FetchResponse<ResponseType>> {
            const authHeader = props.isAuthorized ? getAuthHeaders(props.user) : undefined;
            const response: Response = await fetch(
                `http://localhost:${appConfig.http.port}${path}`,
                {
                    method: 'DELETE',
                    headers: {
                        ...props.headers,
                        ...authHeader,
                    },
                },
            );
            return response as unknown as FetchResponse<ResponseType>;
        },
        async get<ResponseType, QueryType = never>(
            path: string,
            query?: QueryType,
        ): Promise<FetchResponse<ResponseType>> {
            const authHeader = props.isAuthorized ? getAuthHeaders(props.user) : undefined;
            const queryString = query ? `?${buildQueryString(query)}` : '';
            const response = await fetch(
                `http://localhost:${appConfig.http.port}${path}${queryString}`,
                {
                    method: 'GET',
                    headers: {
                        ...props.headers,
                        ...authHeader,
                    },
                },
            );
            return response as unknown as FetchResponse<ResponseType>;
        },
    };
}
