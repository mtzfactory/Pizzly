import db from '../db/database.js';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { dirname } from '../utils/utils.js';
class ConfigService {
    templates;
    constructor() {
        let templatesPath = path.join(dirname(), '../../providers.yaml');
        this.templates = yaml.load(fs.readFileSync(templatesPath).toString());
    }
    async getProviderConfig(providerConfigKey) {
        let result = await db.knex.withSchema(db.schema()).select('*').from(`_pizzly_configs`).where({ unique_key: providerConfigKey });
        if (result == null || result.length == 0 || result[0] == null) {
            return null;
        }
        return result[0];
    }
    async listProviderConfigs() {
        return await db.knex.withSchema(db.schema()).from(`_pizzly_configs`).select('*');
    }
    async createProviderConfig(config) {
        return await db.knex.withSchema(db.schema()).from(`_pizzly_configs`).insert(config, ['id']);
    }
    async deleteProviderConfig(providerConfigKey) {
        return db.knex.withSchema(db.schema()).from(`_pizzly_configs`).where('unique_key', providerConfigKey).del();
    }
    async editProviderConfig(config) {
        await db.knex.withSchema(db.schema()).from(`_pizzly_configs`).where({ unique_key: config.unique_key }).update({
            provider: config.provider,
            oauth_client_id: config.oauth_client_id,
            oauth_client_secret: config.oauth_client_secret,
            oauth_scopes: config.oauth_scopes
        });
    }
    getTemplates() {
        return this.templates;
    }
}
export default new ConfigService();
//# sourceMappingURL=config.service.js.map