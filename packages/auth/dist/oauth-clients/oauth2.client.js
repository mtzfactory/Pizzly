/*
 * Copyright (c) 2022 Nango, all rights reserved.
 */
import { ProviderAuthModes, OAuthAuthorizationMethod, OAuthBodyFormat } from '../models.js';
import { AuthorizationCode } from 'simple-oauth2';
import connectionsManager from '../services/connection.service.js';
import { interpolateString } from '../utils/utils.js';
// Simple OAuth 2 does what it says on the tin: A simple, no-frills client for OAuth 2 that implements the 3 most common grant_types.
// Well maintained, I like :-)
export function getSimpleOAuth2ClientConfig(providerConfig, template, connectionConfig) {
    const tokenUrl = new URL(interpolateString(template.token_url, connectionConfig));
    const authorizeUrl = new URL(interpolateString(template.authorization_url, connectionConfig));
    const headers = { 'User-Agent': 'Pizzly' };
    const authConfig = template;
    return {
        client: {
            id: providerConfig.oauth_client_id,
            secret: providerConfig.oauth_client_secret
        },
        auth: {
            tokenHost: tokenUrl.origin,
            tokenPath: tokenUrl.pathname,
            authorizeHost: authorizeUrl.origin,
            authorizePath: authorizeUrl.pathname
        },
        http: { headers: headers },
        options: {
            authorizationMethod: authConfig.authorization_method || OAuthAuthorizationMethod.BODY,
            bodyFormat: authConfig.body_format || OAuthBodyFormat.FORM,
            scopeSeparator: template.scope_separator || ' '
        }
    };
}
export async function refreshOAuth2Credentials(connection, config, template) {
    let credentials = connection.credentials;
    const client = new AuthorizationCode(getSimpleOAuth2ClientConfig(config, template, connection.connection_config));
    const oldAccessToken = client.createToken({
        access_token: credentials.access_token,
        expires_at: credentials.expires_at,
        refresh_token: credentials.refresh_token
    });
    let additionalParams = {};
    if (template.token_params) {
        additionalParams = template.token_params;
    }
    try {
        const rawNewAccessToken = await oldAccessToken.refresh(additionalParams);
        const newPizzlyCredentials = connectionsManager.parseRawCredentials(rawNewAccessToken.token, ProviderAuthModes.OAuth2);
        return newPizzlyCredentials;
    }
    catch (e) {
        throw new Error(`There was a problem refreshing the OAuth 2 credentials, operation failed: ${e.message}`);
    }
}
//# sourceMappingURL=oauth2.client.js.map