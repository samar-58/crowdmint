import { Router } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

router.get('/', (req: AuthenticatedRequest, res) => {
    res.json({
        success: true,
        role: 'user',
        userId: req.userId
    });
});

export default router;
