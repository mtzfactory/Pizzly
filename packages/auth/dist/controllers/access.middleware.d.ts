import type { Request, Response, NextFunction } from 'express';
export declare class AccessMiddleware {
    checkSecret(req: Request, res: Response, next: NextFunction): void;
    checkPkey(req: Request, res: Response, next: NextFunction): void;
    private fromBasicAuth;
}
declare const _default: AccessMiddleware;
export default _default;
