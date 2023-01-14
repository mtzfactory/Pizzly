export interface ProviderConfig {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
    unique_key: string;
    provider: string;
    oauth_client_id: string;
    oauth_client_secret: string;
    oauth_scopes: string;
}
export interface ProviderTemplate {
    auth_mode: ProviderAuthModes;
    authorization_url: string;
    authorization_params?: Record<string, string>;
    scope_separator?: string;
    token_url: string;
    token_params?: {
        [key: string]: string;
    };
}
export interface Connection {
    id?: number;
    created_at?: Date;
    updated_at?: Date;
    provider_config_key: string;
    connection_id: string;
    credentials: PizzlyAuthCredentials;
    connection_config: Record<string, string>;
}
export declare enum OAuthBodyFormat {
    FORM = "form",
    JSON = "json"
}
export declare enum OAuthAuthorizationMethod {
    BODY = "body",
    HEADER = "header"
}
export interface CredentialsCommon {
    type: ProviderAuthModes;
    raw: Record<string, string>;
}
export interface OAuth2Credentials extends CredentialsCommon {
    type: ProviderAuthModes.OAuth2;
    access_token: string;
    refresh_token?: string;
    expires_at?: Date;
}
export interface OAuth1Credentials extends CredentialsCommon {
    type: ProviderAuthModes.OAuth1;
    oauth_token: string;
    oauth_token_secret: string;
}
export declare enum ProviderAuthModes {
    OAuth1 = "OAUTH1",
    OAuth2 = "OAUTH2"
}
export type PizzlyAuthCredentials = OAuth2Credentials | OAuth1Credentials;
export interface ProviderTemplateOAuth1 extends ProviderTemplate {
    auth_mode: ProviderAuthModes.OAuth1;
    request_url: string;
    request_params?: Record<string, string>;
    request_http_method?: 'GET' | 'PUT' | 'POST';
    token_http_method?: 'GET' | 'PUT' | 'POST';
    signature_method: 'HMAC-SHA1' | 'RSA-SHA1' | 'PLAINTEXT';
}
export interface ProviderTemplateOAuth2 extends ProviderTemplate {
    auth_mode: ProviderAuthModes.OAuth2;
    disable_pkce?: boolean;
    token_params?: {
        grant_type?: 'authorization_code' | 'client_credentials';
    };
    authorization_method?: OAuthAuthorizationMethod;
    body_format?: OAuthBodyFormat;
    refresh_url?: string;
}
export type OAuth1RequestTokenResult = {
    request_token: string;
    request_token_secret: string;
    parsed_query_string: any;
};
export interface OAuthSession {
    providerConfigKey: string;
    provider: string;
    connectionId: string;
    callbackUrl: string;
    authMode: ProviderAuthModes;
    id: string;
    connectionConfig: Record<string, string>;
    codeVerifier: string;
    request_token_secret?: string;
}
export interface OAuthSessionStore {
    [key: string]: OAuthSession;
}
export interface PizzlyCredentialsRefresh {
    providerConfigKey: string;
    connectionId: string;
    promise: Promise<OAuth2Credentials>;
}
