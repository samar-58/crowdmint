import { Router } from 'express';
import { authMiddleware, requireUser } from '../../middleware/auth.js';
import signinRouter from './signin.js';
import healthRouter from './health.js';
import tasksRouter from './tasks.js';
import allTasksRouter from './all-tasks.js';
import presignedurlRouter from './presignedurl.js';

const router: Router = Router();

// Public routes (no auth)
router.use('/signin', signinRouter);

// Protected routes (require user auth)
router.use('/health', authMiddleware, requireUser, healthRouter);
router.use('/tasks', authMiddleware, requireUser, tasksRouter);
router.use('/all-tasks', authMiddleware, requireUser, allTasksRouter);
router.use('/presignedurl', authMiddleware, requireUser, presignedurlRouter);

export default router;
