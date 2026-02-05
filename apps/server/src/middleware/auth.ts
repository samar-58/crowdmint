import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET || 'secret';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    workerId?: string;
    role?: 'user' | 'worker';
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret)
        );

        if (!payload.userId || (typeof payload.userId !== 'string' && typeof payload.userId !== 'number')) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        req.role = payload.role as 'user' | 'worker';

        if (payload.role === 'user') {
            req.userId = String(payload.userId);
        } else if (payload.role === 'worker') {
            req.workerId = String(payload.userId);
        }

        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

export function requireUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    if (req.role !== 'user') {
        return res.status(401).json({ error: 'Invalid role' });
    }
    next();
}

export function requireWorker(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    if (req.role !== 'worker') {
        return res.status(401).json({ error: 'Invalid role' });
    }
    next();
}
