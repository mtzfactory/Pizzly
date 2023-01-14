import { ProviderTemplate as ProviderTemplate, OAuth2Credentials, OAuthAuthorizationMethod, OAuthBodyFormat, Connection } from '../models.js';
import type { ProviderConfig } from '../models.js';
export declare function getSimpleOAuth2ClientConfig(providerConfig: ProviderConfig, template: ProviderTemplate, connectionConfig: Record<string, string>): {
    client: {
        id: string;
        secret: string;
    };
    auth: {
        tokenHost: string;
        tokenPath: string;
        authorizeHost: string;
        authorizePath: string;
    };
    http: {
        headers: {
            'User-Agent': string;
        };
    };
    options: {
        authorizationMethod: OAuthAuthorizationMethod;
        bodyFormat: OAuthBodyFormat;
        scopeSeparator: string;
    };
};
export declare function refreshOAuth2Credentials(connection: Connection, config: ProviderConfig, template: ProviderTemplate): Promise<OAuth2Credentials>;
