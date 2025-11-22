import { NextRequest, NextResponse } from "next/server"
import { S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
    const accessKey = process.env.ACCESS_KEY ?? "";
    const secretKey = process.env.SECRET_KEY ?? "";
    const bucketName = process.env.BUCKET_NAME ?? "";
    const REGION = process.env.REGION;

    if (!accessKey || !secretKey) {
        return NextResponse.json({ error: "AWS credentials not found" }, { status: 500 })
    }
    const s3Client = new S3Client({
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        region: REGION
    })

    const userId = req.headers.get('x-user-id');
    const fileType = req.headers.get("x-file-type");
    if (!fileType || !fileType.startsWith("image/")) {
        return NextResponse.json({ error: "Invalid File Type" }, { status: 400 });
    }
    const ext = fileType.split("/")[1];
    const uniqueId = randomUUID();
    const key = `/crowdmint/${userId}/${Date.now()}-${uniqueId}.${ext}`;

    const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: bucketName,
        Key: key,
        Fields: {
            "Content-Type": fileType,
        },
        Conditions: [
            ["content-length-range", 1, 10 * 1024 * 1024]
        ],
        Expires: 60 * 60 * 24
    })
    return NextResponse.json({ url, fields });
}