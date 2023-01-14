import type { Request, Response } from 'express';
import type { NextFunction } from 'express';
import { ProviderTemplate } from '../models.js';
declare class ConnectionController {
    templates: {
        [key: string]: ProviderTemplate;
    };
    getConnectionCreds(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ConnectionController;
export default _default;
