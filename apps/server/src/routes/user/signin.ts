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

        const existingUser = await prisma.user.findFirst({
            where: { address: publicKey }
        });

        if (existingUser) {
            const token = jwt.sign(
                { userId: existingUser.id, role: 'user' },
                secret
            );
            return res.json({ token });
        }

        const newUser = await prisma.user.create({
            data: { address: publicKey }
        });

        const token = jwt.sign(
            { userId: newUser.id, role: 'user' },
            secret
        );

        return res.json({ token });
    } catch (error) {
        console.error('User signin error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
