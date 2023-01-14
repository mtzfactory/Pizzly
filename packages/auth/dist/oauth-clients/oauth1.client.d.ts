import type { ProviderTemplate } from '../models.js';
import type { ProviderConfig } from '../models.js';
type OAuth1RequestTokenResult = {
    request_token: string;
    request_token_secret: string;
    parsed_query_string: any;
};
export declare class PizzlyOAuth1Client {
    private client;
    private config;
    private authConfig;
    constructor(config: ProviderConfig, template: ProviderTemplate, callbackUrl: string);
    getOAuthRequestToken(): Promise<OAuth1RequestTokenResult>;
    getOAuthAccessToken(oauth_token: string, oauth_token_secret: string, oauth_token_verifier: string): Promise<any>;
    getAuthorizationURL(requestToken: OAuth1RequestTokenResult): string;
}
export {};
