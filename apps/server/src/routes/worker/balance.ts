import { Router } from 'express';
import { prisma } from '../../utils/constants.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const workerId = req.workerId;

        if (!workerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const balance = await prisma.worker.findFirst({
            where: { id: workerId },
            select: {
                pendingBalance: true,
                lockedBalance: true,
            }
        });

        return res.status(200).json({ balance });
    } catch (error) {
        console.error('Get balance error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
