import type { Express } from 'express';
declare class AuthServer {
    setup(app: Express): Promise<void>;
}
declare const _default: AuthServer;
export default _default;
