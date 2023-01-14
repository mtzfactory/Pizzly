export default class Pizzly {
    private hostBaseUrl;
    private status;
    private publishableKey;
    constructor(hostBaseUrl: string, publishableKey?: string);
    auth(providerConfigKey: string, connectionId: string, connectionConfig?: ConnectionConfig): Promise<any>;
    toQueryString(connectionId: string, connectionConfig?: ConnectionConfig): string;
}
interface ConnectionConfig {
    params: Record<string, string>;
}
export {};
