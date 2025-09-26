import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
        //where ever it is
        const token =
            (req.cookies && (req.cookies as any).token) ||
            (req.headers.authorization ? String(req.headers.authorization).replace(/^Bearer\s+/, '') : null);


        if (!token) return res.status(401).json({
            error: 'unauthorized'
        });

        const payload = verifyJwt(token as string) as any;
        if (!payload || !payload.userId) {
            return res.status(401).json({
                error: 'invalid token'
            });
        }

        (req as any).user = payload;
        next();
    } catch (err) {
        console.error('auth middleware error', err);
        return res.status(401).json({
            error: 'unauthorized'
        });
    }
}
