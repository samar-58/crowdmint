import { Router } from 'express';
import { authMiddleware, requireWorker } from '../../middleware/auth.js';
import signinRouter from './signin.js';
import healthRouter from './health.js';
import nextTaskRouter from './next-task.js';
import submissionRouter from './submission.js';
import balanceRouter from './balance.js';
import payoutsRouter from './payouts.js';

const router: Router = Router();

// Public routes (no auth)
router.use('/signin', signinRouter);

// Protected routes (require worker auth)
router.use('/health', authMiddleware, requireWorker, healthRouter);
router.use('/next-task', authMiddleware, requireWorker, nextTaskRouter);
router.use('/submission', authMiddleware, requireWorker, submissionRouter);
router.use('/balance', authMiddleware, requireWorker, balanceRouter);
router.use('/payouts', authMiddleware, requireWorker, payoutsRouter);

export default router;
