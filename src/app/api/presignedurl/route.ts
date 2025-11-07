import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createPresignedPost } from "@aws-sdk/s3-presigned-post"
export async function GET(req:NextRequest){

const accessKey = process.env.AWS_ACCESS_KEY ?? "";
const secretKey = process.env.AWS_SECRET_KEY ?? "";
const bucketName = process.env.AWS_BUCKET_NAME ?? "";
const AWS_REGION = process.env.AWS_REGION ?? "";
console.log(accessKey,secretKey,"accessKey,secretKey");

if(!accessKey || !secretKey){
    return NextResponse.json({ error: "AWS credentials not found" }, { status: 500 })
}
    const userId = req.headers.get('x-user-id');
    const s3Client = new S3Client({
        credentials:{
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        region: AWS_REGION
    })


const presignedUrl = await createPresignedPost(s3Client,{
    Bucket: bucketName,
    Key: `/crowdmint/cmhnt1dwn0000se7w0v12vidv/${Date.now()}.jpg`,
    Conditions: [
        ["content-length-range", 1, 10 * 1024 * 1024]
      ],
    Expires: 60 * 60 * 24 
})
console.log(presignedUrl,"presignedUrl");
    return NextResponse.json({ presignedUrl });
}