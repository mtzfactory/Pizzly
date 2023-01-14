import type { Request, Response } from 'express';
import { ProviderTemplate, OAuthSessionStore } from '../models.js';
import type { NextFunction } from 'express';
declare class OAuthController {
    sessionStore: OAuthSessionStore;
    errDesc: {
        missing_connection_id: () => string;
        no_provider_config_key: () => string;
        unknown_config_key: (providerConfigKey: string) => string;
        provider_config_err: (providerConfigKey: string) => string;
        grant_type_err: (grantType: string) => string;
        req_token_err: (error: string) => string;
        auth_mode_err: (auth_mode: string) => string;
        state_err: (state: string) => string;
        token_err: (err: string) => string;
        callback_err: (err: string) => string;
        url_param_err: (url: string, params: string) => string;
    };
    callbackUrl: string;
    templates: {
        [key: string]: ProviderTemplate;
    };
    oauthRequest(req: Request, res: Response, next: NextFunction): Promise<any>;
    private oauth2Request;
    private oauth1Request;
    oauthCallback(req: Request, res: Response, next: NextFunction): Promise<void>;
    private oauth2Callback;
    private oauth1Callback;
}
declare const _default: OAuthController;
export default _default;
