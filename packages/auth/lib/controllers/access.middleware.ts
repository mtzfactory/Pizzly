import type { Request, Response, NextFunction } from 'express';

export class AccessMiddleware {
    checkSecret(req: Request, res: Response, next: NextFunction) {
        const secretKey = process.env['PIZZLY_SECRET_KEY'];

        if (!secretKey) {
            next();
            return;
        }

        const authorizationHeader = req.get('authorization');

        if (!authorizationHeader) {
            res.status(401).send({ error: 'Authentication failed. The request is missing a valid secret key.' });
            return;
        }

        const { providedUser } = this.fromBasicAuth(authorizationHeader);

        if (providedUser !== secretKey) {
            res.status(401).send({ error: 'Authentication failed. The provided secret key is invalid.' });
            return;
        }

        next();
    }

    checkPkey(req: Request, res: Response, next: NextFunction) {
        const publishableKey = process.env['PIZZLY_PUBLISHABLE_KEY'];

        if (!publishableKey) {
            next();
            return;
        }

        const providedPublishableKey = req.query['pizzly_pkey'];

        if (typeof providedPublishableKey !== 'string') {
            res.status(401).send({ error: 'Authentication failed. The request is missing a valid publishable key.' });
            return;
        }

        if (providedPublishableKey !== publishableKey) {
            res.status(401).send({ error: 'Authentication failed. The provided publishable key is invalid.' });
            return;
        }

        next();
    }

    private fromBasicAuth(authorizationHeader: string) {
        const basicAsBase64 = authorizationHeader.split('Basic ').pop() || '';
        const basicAsBuffer = Buffer.from(basicAsBase64, 'base64');
        const basicAsString = basicAsBuffer.toString('utf-8');

        const providedCredentials = basicAsString.split(':');
        const providedUser: string = providedCredentials.shift() || '';
        const providedPassword: string = providedCredentials.shift() || '';

        return { providedUser, providedPassword };
    }
}

export default new AccessMiddleware();
