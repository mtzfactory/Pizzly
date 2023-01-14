let config = {
    development: {
        client: 'pg',
        connection: {
            host: process.env['NANGO_DB_HOST'] || (process.env['SERVER_RUN_MODE'] === 'DOCKERIZED' ? 'nango-db' : 'localhost'),
            port: +(process.env['NANGO_DB_PORT'] || 5432),
            user: process.env['NANGO_DB_USER'] || 'nango',
            database: process.env['NANGO_DB_NAME'] || 'nango',
            password: process.env['NANGO_DB_PASSWORD'] || 'nango',
            ssl: process.env['NANGO_DB_SSL'] != null && process.env['NANGO_DB_SSL'].toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined
        },
        migrations: {
            directory: './migrations',
            extension: 'ts'
        }
    },
    production: {}
};
export { config };
//# sourceMappingURL=config.js.map