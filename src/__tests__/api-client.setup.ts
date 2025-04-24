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
import { HttpServerDaemon } from '#app/http/http-server.daemon.js';

const application = new Application({ appConfig, daemons: [new HttpServerDaemon(appConfig)] });

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
    const queryParams = (params: Record<string, any>) => {
        return Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .map(
                ([key, value]) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`,
            )
            .join('&');
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
        async get<ResponseType, ParamsType = never>(
            path: string,
            params?: ParamsType,
        ): Promise<FetchResponse<ResponseType>> {
            const authHeader = props.isAuthorized ? getAuthHeaders(props.user) : undefined;
            const query = params ? `?${queryParams(params)}` : '';
            const response = await fetch(`http://localhost:${appConfig.http.port}${path}${query}`, {
                method: 'GET',
                headers: {
                    ...props.headers,
                    ...authHeader,
                },
            });
            return response as unknown as FetchResponse<ResponseType>;
        },
    };
}
