import { Router } from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../../middleware/auth.js';

const router: Router = Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const accessKey = process.env.ACCESS_KEY ?? '';
        const secretKey = process.env.SECRET_KEY ?? '';
        const bucketName = process.env.BUCKET_NAME ?? '';
        const REGION = process.env.REGION;

        if (!accessKey || !secretKey) {
            return res.status(500).json({ error: 'AWS credentials not found' });
        }

        const s3Client = new S3Client({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            region: REGION
        });

        const userId = req.userId;
        const fileType = req.headers['x-file-type'] as string;

        if (!fileType || !fileType.startsWith('image/')) {
            return res.status(400).json({ error: 'Invalid File Type' });
        }

        const ext = fileType.split('/')[1];
        const uniqueId = randomUUID();
        const key = `/crowdmint/${userId}/${Date.now()}-${uniqueId}.${ext}`;

        const { url, fields } = await createPresignedPost(s3Client, {
            Bucket: bucketName,
            Key: key,
            Fields: {
                'Content-Type': fileType,
            },
            Conditions: [
                ['content-length-range', 1, 10 * 1024 * 1024]
            ],
            Expires: 60 * 60 * 24
        });

        return res.json({ url, fields });
    } catch (error) {
        console.error('Presigned URL error:', error);
        return res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});

export default router;
