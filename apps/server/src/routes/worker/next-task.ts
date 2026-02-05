import { Router } from 'express';
import { prisma } from '../../utils/constants.js';
import { getNextTask } from '../../utils/getNextTask.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const workerId = req.workerId;

        if (!workerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const task = await getNextTask(workerId);

        const worker = await prisma.worker.findUnique({
            where: { id: workerId },
            select: {
                pendingBalance: true,
                lockedBalance: true,
            }
        });

        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        if (!task) {
            return res.status(200).json({
                message: 'No task found',
                pendingBalance: worker.pendingBalance,
                lockedBalance: worker.lockedBalance,
                task: null
            });
        }

        return res.status(200).json({
            task,
            pendingBalance: worker.pendingBalance,
            lockedBalance: worker.lockedBalance
        });
    } catch (error) {
        console.error('Get next task error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
