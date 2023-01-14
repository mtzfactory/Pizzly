import * as crypto from 'node:crypto';
import * as uuid from 'uuid';
import simpleOauth2 from 'simple-oauth2';
import { getSimpleOAuth2ClientConfig } from '../oauth-clients/oauth2.client.js';
import { PizzlyOAuth1Client } from '../oauth-clients/oauth1.client.js';
import configService from '../services/config.service.js';
import connectionService from '../services/connection.service.js';
import { html, getOauthCallbackUrl, getConnectionConfig, missesInterpolationParam } from '../utils/utils.js';
import { ProviderAuthModes } from '../models.js';
import logger from '../utils/logger.js';
class OAuthController {
    sessionStore = {};
    errDesc = {
        missing_connection_id: () => 'Missing connectionId.',
        no_provider_config_key: () => 'Missing provider unique key.',
        unknown_config_key: (providerConfigKey) => `No Provider configuration with key "${providerConfigKey}".`,
        provider_config_err: (providerConfigKey) => `Provider config w/ key "${providerConfigKey}" is missing params (cliend ID, secret and/or scopes).`,
        grant_type_err: (grantType) => `The grant type "${grantType}" is not supported by this OAuth flow.`,
        req_token_err: (error) => `Error in the request token step of the OAuth 1.0a flow. Error: ${error}`,
        auth_mode_err: (auth_mode) => `Auth mode ${auth_mode} not supported.`,
        state_err: (state) => `Invalid state parameter passed in the callback: ${state}`,
        token_err: (err) => `Error storing/retrieving token: ${err}.`,
        callback_err: (err) => `Did not get oauth_token and/or oauth_verifier in the callback: ${err}.`,
        url_param_err: (url, params) => `Missing param(s) in Auth request to interpolate url ${url}. Provided params: ${params}`
    };
    callbackUrl = getOauthCallbackUrl();
    templates = configService.getTemplates();
    async oauthRequest(req, res, next) {
        try {
            const { providerConfigKey } = req.params;
            let connectionId = req.query['connection_id'];
            let connectionConfig = req.query['params'] != null ? getConnectionConfig(req.query['params']) : {};
            if (connectionId == null) {
                return html(logger, res, providerConfigKey, connectionId, 'missing_connection_id', this.errDesc['missing_connection_id']());
            }
            else if (providerConfigKey == null) {
                return html(logger, res, providerConfigKey, connectionId, 'no_provider_config_key', this.errDesc['no_provider_config_key']());
            }
            connectionId = connectionId.toString();
            let config = await configService.getProviderConfig(providerConfigKey);
            if (config == null) {
                return html(logger, res, providerConfigKey, connectionId, 'unknown_config_key', this.errDesc['unknown_config_key'](providerConfigKey));
            }
            let template;
            try {
                template = this.templates[config.provider];
            }
            catch {
                return html(logger, res, providerConfigKey, connectionId, 'unknown_config_key', this.errDesc['unknown_config_key'](providerConfigKey));
            }
            const session = {
                providerConfigKey: providerConfigKey,
                provider: config.provider,
                connectionId: connectionId,
                callbackUrl: this.callbackUrl,
                authMode: template.auth_mode,
                codeVerifier: crypto.randomBytes(24).toString('hex'),
                id: uuid.v1(),
                connectionConfig: connectionConfig
            };
            this.sessionStore[session.id] = session;
            if (config?.oauth_client_id == null || config?.oauth_client_secret == null || config.oauth_scopes == null) {
                return html(logger, res, providerConfigKey, connectionId, 'provider_config_err', this.errDesc['provider_config_err'](providerConfigKey));
            }
            logger.info(`OAuth request - mode: ${template.auth_mode}, provider: ${config.provider}, key: ${config.unique_key}, connection ID: ${connectionId}, auth URL: ${template.authorization_url}, callback URL: ${this.callbackUrl}`);
            if (template.auth_mode === ProviderAuthModes.OAuth2) {
                return this.oauth2Request(template, config, session, res, connectionConfig);
            }
            else if (template.auth_mode === ProviderAuthModes.OAuth1) {
                return this.oauth1Request(template, config, session, res);
            }
            let authMode = template.auth_mode;
            return html(logger, res, providerConfigKey, connectionId, 'auth_mode_err', this.errDesc['auth_mode_err'](authMode));
        }
        catch (err) {
            next(err);
        }
    }
    oauth2Request(template, providerConfig, session, res, connectionConfig) {
        const oauth2Template = template;
        if (missesInterpolationParam(template.authorization_url, connectionConfig)) {
            let errDesc = this.errDesc['url_param_err'](template.authorization_url, JSON.stringify(connectionConfig));
            return html(logger, res, session.providerConfigKey, session.connectionId, 'url_param_err', errDesc);
        }
        if (missesInterpolationParam(template.token_url, connectionConfig)) {
            let errDesc = this.errDesc['url_param_err'](template.token_url, JSON.stringify(connectionConfig));
            return html(logger, res, session.providerConfigKey, session.connectionId, 'url_param_err', errDesc);
        }
        if (oauth2Template.token_params == undefined ||
            oauth2Template.token_params.grant_type == undefined ||
            oauth2Template.token_params.grant_type == 'authorization_code') {
            let additionalAuthParams = {};
            if (oauth2Template.authorization_params) {
                additionalAuthParams = oauth2Template.authorization_params;
            }
            // We always implement PKCE, no matter whether the server requires it or not,
            // unless it has been explicitly turned off for this template
            if (!template.disable_pkce) {
                const h = crypto.createHash('sha256').update(session.codeVerifier).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                additionalAuthParams['code_challenge'] = h;
                additionalAuthParams['code_challenge_method'] = 'S256';
            }
            const simpleOAuthClient = new simpleOauth2.AuthorizationCode(getSimpleOAuth2ClientConfig(providerConfig, template, connectionConfig));
            const authorizationUri = simpleOAuthClient.authorizeURL({
                redirect_uri: this.callbackUrl,
                scope: providerConfig.oauth_scopes.split(',').join(oauth2Template.scope_separator || ' '),
                state: session.id,
                ...additionalAuthParams
            });
            logger.debug(`OAuth 2.0 for ${session.providerConfigKey} (connection ${session.connectionId}) - redirecting to: ${authorizationUri}`);
            res.redirect(authorizationUri);
        }
        else {
            let grandType = oauth2Template.token_params.grant_type;
            return html(logger, res, session.providerConfigKey, session.connectionId, 'grant_type_err', this.errDesc['grant_type_err'](grandType));
        }
    }
    // In OAuth 2 we are guaranteed that the state parameter will be sent back to us
    // for the entire journey. With OAuth 1.0a we have to register the callback URL
    // in a first step and will get called back there. We need to manually include the state
    // param there, otherwise we won't be able to identify the user in the callback
    async oauth1Request(template, config, session, res) {
        const callbackParams = new URLSearchParams({
            state: session.id
        });
        const oAuth1CallbackURL = `${this.callbackUrl}?${callbackParams.toString()}`;
        const oAuth1Client = new PizzlyOAuth1Client(config, template, oAuth1CallbackURL);
        let tokenResult;
        try {
            tokenResult = await oAuth1Client.getOAuthRequestToken();
        }
        catch (error) {
            let errStr = JSON.stringify(error, undefined, 2);
            return html(logger, res, session.providerConfigKey, session.connectionId, 'req_token_err', this.errDesc['req_token_err'](errStr));
        }
        const sessionData = this.sessionStore[session.id];
        sessionData.request_token_secret = tokenResult.request_token_secret;
        const redirectUrl = oAuth1Client.getAuthorizationURL(tokenResult);
        logger.debug(`OAuth 1.0a for ${session.providerConfigKey} (connection: ${session.connectionId}). Request token success. Redirecting to: ${redirectUrl}`);
        // All worked, let's redirect the user to the authorization page
        return res.redirect(redirectUrl);
    }
    async oauthCallback(req, res, next) {
        try {
            const { state } = req.query;
            const session = this.sessionStore[state];
            delete this.sessionStore[state];
            if (state == null || session == null || session.providerConfigKey == null) {
                let stateStr = state || '';
                return html(logger, res, session.providerConfigKey, session.connectionId, 'state_err', this.errDesc['state_err'](stateStr));
            }
            logger.debug(`Received callback for ${session.providerConfigKey} (connection: ${session.connectionId}) - full callback URI: ${req.originalUrl}"`);
            const template = this.templates[session.provider];
            const config = (await configService.getProviderConfig(session.providerConfigKey));
            logger.info(`OAuth callback - mode: ${template.auth_mode}, provider: ${config.provider}, key: ${config.unique_key}, connection ID: ${session.connectionId}`);
            if (session.authMode === ProviderAuthModes.OAuth2) {
                return this.oauth2Callback(template, config, session, req, res);
            }
            else if (session.authMode === ProviderAuthModes.OAuth1) {
                return this.oauth1Callback(template, config, session, req, res);
            }
            return html(logger, res, session.providerConfigKey, session.connectionId, 'auth_mode_err', this.errDesc['auth_mode_err'](session.authMode));
        }
        catch (err) {
            next(err);
        }
    }
    async oauth2Callback(template, config, session, req, res) {
        const { code } = req.query;
        let providerConfigKey = session.providerConfigKey;
        let connectionId = session.connectionId;
        if (!code) {
            let errStr = JSON.stringify(req.query);
            return html(logger, res, providerConfigKey, connectionId, 'callback_err', this.errDesc['callback_err'](errStr));
        }
        const simpleOAuthClient = new simpleOauth2.AuthorizationCode(getSimpleOAuth2ClientConfig(config, template, session.connectionConfig));
        let additionalTokenParams = {};
        if (template.token_params !== undefined) {
            // We need to remove grant_type, simpleOAuth2 handles that for us
            const deepCopy = JSON.parse(JSON.stringify(template.token_params));
            delete deepCopy.grant_type;
            additionalTokenParams = deepCopy;
        }
        // We always implement PKCE, no matter whether the server requires it or not,
        // unless it has been explicitly disabled for this provider template
        if (!template.disable_pkce) {
            additionalTokenParams['code_verifier'] = session.codeVerifier;
        }
        try {
            const accessToken = await simpleOAuthClient.getToken({
                code: code,
                redirect_uri: session.callbackUrl,
                ...additionalTokenParams
            });
            logger.debug(`OAuth 2 for ${providerConfigKey} (connection ${connectionId}) successful.`);
            connectionService.upsertConnection(connectionId, providerConfigKey, accessToken.token, ProviderAuthModes.OAuth2, session.connectionConfig);
            return html(logger, res, providerConfigKey, connectionId, '', '');
        }
        catch (e) {
            if (e instanceof Error) {
                return html(logger, res, providerConfigKey, connectionId, 'token_err', this.errDesc['token_err'](e.message));
            }
            return html(logger, res, providerConfigKey, connectionId, 'token_err', this.errDesc['token_err'](JSON.stringify(e)));
        }
    }
    oauth1Callback(template, config, session, req, res) {
        const { oauth_token, oauth_verifier } = req.query;
        let providerConfigKey = session.providerConfigKey;
        let connectionId = session.connectionId;
        if (!oauth_token || !oauth_verifier) {
            let errStr = JSON.stringify(req.query);
            return html(logger, res, providerConfigKey, connectionId, 'callback_err', this.errDesc['callback_err'](errStr));
        }
        const oauth_token_secret = session.request_token_secret;
        const oAuth1Client = new PizzlyOAuth1Client(config, template, '');
        oAuth1Client
            .getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
            .then((accessTokenResult) => {
            logger.debug(`OAuth 1.0a for ${providerConfigKey} (connection: ${connectionId}) successful.`);
            connectionService.upsertConnection(connectionId, providerConfigKey, accessTokenResult, ProviderAuthModes.OAuth1, {});
            return html(logger, res, providerConfigKey, connectionId, '', '');
        })
            .catch((e) => {
            let errStr = JSON.stringify(e);
            return html(logger, res, providerConfigKey, connectionId, 'token_err', this.errDesc['token_err'](errStr));
        });
    }
}
export default new OAuthController();
//# sourceMappingURL=oauth.controller.js.map