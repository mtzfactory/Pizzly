import type { ProviderConfig, ProviderTemplate } from '../models.js';
declare class ConfigService {
    templates: {
        [key: string]: ProviderTemplate;
    };
    constructor();
    getProviderConfig(providerConfigKey: string): Promise<ProviderConfig | null>;
    listProviderConfigs(): Promise<ProviderConfig[]>;
    createProviderConfig(config: ProviderConfig): Promise<void | Pick<ProviderConfig, 'id'>[]>;
    deleteProviderConfig(providerConfigKey: string): Promise<number>;
    editProviderConfig(config: ProviderConfig): Promise<void>;
    getTemplates(): {
        [key: string]: ProviderTemplate;
    };
}
declare const _default: ConfigService;
export default _default;
