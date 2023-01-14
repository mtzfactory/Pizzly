import knex from 'knex';
import { config } from './config.js';
class KnexDatabase {
    knex;
    constructor() {
        this.knex = knex(config.development);
    }
    async migrate(directory) {
        return this.knex.migrate.latest({ directory: directory, tableName: '_pizzly_migrations', schemaName: this.schema() });
    }
    schema() {
        return 'pizzly';
    }
}
export default new KnexDatabase();
//# sourceMappingURL=database.js.map