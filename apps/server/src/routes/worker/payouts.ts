import { Router } from 'express';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { prisma } from '../../utils/constants.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const workerId = req.workerId;

        if (!workerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const worker = await prisma.worker.findFirst({ where: { id: workerId } });

        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }

        const sqs = new SQSClient({
            region: process.env.REGION as string,
            credentials: {
                accessKeyId: process.env.ACCESS_KEY!,
                secretAccessKey: process.env.SECRET_KEY!,
            }
        });

        if (!process.env.SQS_URL) {
            console.log('SQS URL not found', process.env.SQS_URL);
            return res.status(500).json({ error: 'SQS URL not found' });
        }

        if (worker.pendingBalance <= 0) {
            console.log('No pending balance', worker.pendingBalance);
            return res.status(400).json({ error: 'No pending balance' });
        }

        const amount = worker.pendingBalance;

        const payout = await prisma.$transaction(async (tx) => {
            await tx.worker.update({
                where: { id: workerId },
                data: {
                    pendingBalance: { decrement: amount },
                    lockedBalance: { increment: amount },
                },
            });

            const newPayout = await tx.payouts.create({
                data: {
                    workerId,
                    amount,
                    status: 'PROCESSING',
                    signature: '',
                },
            });

            return newPayout;
        });

        try {
            await sqs.send(new SendMessageCommand({
                QueueUrl: process.env.SQS_URL,
                MessageBody: JSON.stringify({
                    payoutId: payout.id,
                    workerId: workerId,
                    workerAddress: worker.address,
                    amount: payout.amount
                }),
                MessageGroupId: workerId,
                MessageDeduplicationId: `${payout.id}-${Date.now()}`
            }));
        } catch (sqsError) {
            console.error('SQS send failed after successful transaction:', sqsError);
        }

        return res.json({
            message: 'Payout queued',
            amount: payout.amount
        });
    } catch (error) {
        console.error('Payout transaction failed:', error);
        return res.status(500).json({ error: 'Failed to process payout' });
    }
});

export default router;
