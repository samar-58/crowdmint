import { Router } from 'express';
import { prisma } from '../../utils/constants.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

interface OptionResponse {
    id: string;
    imageUrl: string | null;
    count: number;
}

interface TaskResponse {
    id: string;
    amount: number;
    title: string;
    type: string;
    done: boolean;
    options: OptionResponse[];
}

router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'unauthorized' });
        }

        const tasks = await prisma.task.findMany({
            where: { userId },
            include: { options: true }
        });

        // Fetch all submissions for all tasks
        const submissions = await prisma.submission.findMany({
            where: {
                taskId: { in: tasks.map(t => t.id) }
            }
        });

        // Create a map of optionId -> count
        const submissionCounts: Record<string, number> = {};
        submissions.forEach(submission => {
            submissionCounts[submission.optionId] = (submissionCounts[submission.optionId] || 0) + 1;
        });

        const result: TaskResponse[] = tasks.map(t => ({
            id: t.id,
            amount: t.amount,
            title: t.title,
            type: t.type,
            done: t.done,
            options: t.options.map(option => ({
                id: option.id,
                imageUrl: option.imageUrl,
                count: submissionCounts[option.id] || 0
            }))
        }));

        return res.status(200).json({ res: result });
    } catch (error) {
        console.error('Get all tasks error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
