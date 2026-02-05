import { Router } from 'express';
import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';
import { prisma } from '../../utils/constants.js';

const router: Router = Router();
const secret = process.env.JWT_SECRET || 'secret';

router.post('/', async (req, res) => {
    try {
        const { publicKey, signature } = req.body;
        const signedString = 'Sign in to Crowdmint';
        const message = new TextEncoder().encode(signedString);

        const result = nacl.sign.detached.verify(
            message,
            new Uint8Array(signature.data),
            new PublicKey(publicKey).toBytes()
        );

        if (!result) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const existingWorker = await prisma.worker.findFirst({
            where: { address: publicKey }
        });

        if (existingWorker) {
            const token = jwt.sign(
                { userId: existingWorker.id, role: 'worker' },
                secret
            );
            return res.json({ token });
        }

        const newWorker = await prisma.worker.create({
            data: { address: publicKey }
        });

        const token = jwt.sign(
            { userId: newWorker.id, role: 'worker' },
            secret
        );

        return res.json({ token });
    } catch (error) {
        console.error('Worker signin error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
