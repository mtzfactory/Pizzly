import type { Knex } from 'knex';
declare class KnexDatabase {
    knex: Knex;
    constructor();
    migrate(directory: string): Promise<any>;
    schema(): string;
}
declare const _default: KnexDatabase;
export default _default;
