import { Router } from 'express';
import { prisma } from '../../utils/constants.js';
import { getNextTask } from '../../utils/getNextTask.js';
import { submissionSchema } from '../../types/schemas.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const workerId = req.workerId;
        const parsedData = submissionSchema.safeParse(req.body);

        if (!parsedData.success) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        if (!workerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const task = await getNextTask(workerId);

        if (!task) {
            return res.status(404).json({ error: 'No task found' });
        }

        if (task.id !== parsedData.data.taskId) {
            return res.status(404).json({ error: 'Invalid Task Id' });
        }

        const amount = task.amount / task.maximumSubmissions;

        const updatedWorker = await prisma.$transaction(async tx => {
            await tx.submission.create({
                data: {
                    workerId: workerId,
                    taskId: task.id,
                    optionId: parsedData.data.optionId,
                    amount: amount,
                }
            });

            const worker = await tx.worker.update({
                where: { id: workerId },
                data: {
                    pendingBalance: { increment: amount },
                },
                select: {
                    pendingBalance: true,
                    lockedBalance: true,
                }
            });

            return worker;
        });

        const nextTask = await getNextTask(workerId);

        return res.status(200).json({
            message: nextTask ? 'Submission created successfully' : 'Submission created successfully - All tasks completed!',
            nextTask: nextTask || null,
            pendingBalance: updatedWorker.pendingBalance,
            lockedBalance: updatedWorker.lockedBalance
        });
    } catch (error) {
        console.error('Submission error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
