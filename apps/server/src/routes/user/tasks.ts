import { Router } from 'express';
import z from 'zod';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { prisma, LAMPORTS_PER_SOL, PARENT_WALLET_ADDRESS } from '../../utils/constants.js';
import { createTaskSchema } from '../../types/schemas.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { TaskType } from '@prisma/client';

const router: Router = Router();

// POST /api/user/tasks - Create a new task
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const userId = req.userId;
        const parsedData = createTaskSchema.safeParse(req.body);
        const connection = new Connection(clusterApiUrl('devnet'));

        if (!parsedData.success) {
            return res.status(400).json({ error: 'Invalid data' });
        }

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transaction = await connection.getTransaction(parsedData.data.signature, {
            maxSupportedTransactionVersion: 1,
        });

        if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== parsedData.data.amount * 10 ** 9) {
            console.log('Transaction signature/amount is invalid', (transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0), parsedData.data.amount * 10 ** 9);
            return res.status(411).json({ error: 'Transaction signature/amount is invalid' });
        }

        if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
            console.log('Transaction sent to wrong wallet', transaction?.transaction.message.getAccountKeys().get(1)?.toString(), PARENT_WALLET_ADDRESS);
            return res.status(411).json({ error: 'Transaction sent to wrong wallet' });
        }

        if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user.address) {
            console.log('Transaction came from wrong wallet', transaction?.transaction.message.getAccountKeys().get(0)?.toString(), user.address);
            return res.status(411).json({ error: 'Transaction came from wrong wallet' });
        }

        const response = await prisma.$transaction(async tx => {
            const task = await tx.task.create({
                data: {
                    title: parsedData?.data?.title ?? '',
                    type: parsedData?.data?.type as TaskType,
                    signature: parsedData?.data?.signature,
                    amount: parsedData?.data?.amount * LAMPORTS_PER_SOL,
                    userId: userId,
                }
            });

            await tx.option.createMany({
                data: parsedData.data.options.map((option) => ({
                    imageUrl: option.imageUrl,
                    taskId: task.id,
                }))
            });

            return task;
        });

        return res.status(200).json({ message: 'Task created successfully', taskId: response?.id });
    } catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/user/tasks - Get task by ID with results
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const taskId = z.string().optional().safeParse(req.query.taskId);
        const userId = req.userId;

        const task = await prisma.task.findUnique({
            where: {
                id: taskId.data,
                userId: userId,
            },
            include: {
                options: true,
            }
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const submissions = await prisma.submission.findMany({
            where: { taskId: task.id },
            include: { option: true }
        });

        const result: Record<string, {
            count: number,
            option: { imageUrl: string }
        }> = {};

        task.options.forEach(option => {
            result[option.id] = {
                count: 0,
                option: { imageUrl: option.imageUrl as string }
            };
        });

        submissions.forEach(submission => {
            result[submission.optionId].count++;
        });

        return res.status(200).json({ result });
    } catch (error) {
        console.error('Get task error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
