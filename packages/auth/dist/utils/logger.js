import winston from 'winston';
const nangoLogFormat = winston.format.printf((info) => {
    return `${info['timestamp']} [${info['level'].toUpperCase()}] ${info['message']}`;
});
class PizzlyLogger {
    logger;
    constructor() {
        this.logger = winston.createLogger({
            levels: winston.config.syslog.levels,
            format: winston.format.combine(winston.format.timestamp(), nangoLogFormat),
            transports: [new winston.transports.Console({ level: process.env['LOG_LEVEL'] || 'info' })]
        });
    }
}
export default new PizzlyLogger().logger;
//# sourceMappingURL=logger.js.map