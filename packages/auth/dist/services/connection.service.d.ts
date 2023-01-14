import type { PizzlyAuthCredentials, OAuth2Credentials, ProviderTemplate } from '../models.js';
import { ProviderAuthModes } from '../models.js';
import type { ProviderConfig, Connection } from '../models.js';
declare class ConnectionService {
    private runningCredentialsRefreshes;
    upsertConnection(connectionId: string, providerConfigKey: string, rawCredentials: object, authMode: ProviderAuthModes, connectionConfig: Record<string, string>): Promise<void>;
    updateConnection(connectionId: string, providerConfigKey: string, rawCredentials: object, authMode: ProviderAuthModes): Promise<void>;
    getConnection(connectionId: string, providerConfigKey: string): Promise<Connection | null>;
    parseRawCredentials(rawCredentials: object, authMode: ProviderAuthModes): PizzlyAuthCredentials;
    refreshOauth2CredentialsIfNeeded(connection: Connection, providerConfig: ProviderConfig, template: ProviderTemplate): Promise<OAuth2Credentials>;
    /** -------------------- Private Methods -------------------- */
    private checkCredentials;
    private parseTokenExpirationDate;
}
declare const _default: ConnectionService;
export default _default;
