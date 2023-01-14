import type { Request, Response } from 'express';
import type { NextFunction } from 'express';
declare class ConfigController {
    listProviderConfigs(_: Request, res: Response, next: NextFunction): Promise<void>;
    getProviderConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
    createProviderConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
    editProviderConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteProviderConfig(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ConfigController;
export default _default;
