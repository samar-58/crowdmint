import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/constants";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
const secret = process.env.JWT_SECRET || "secret"

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { publicKey, signature } = body;
    const signedString = "Sign in to Crowdmint";
    const message = new TextEncoder().encode(signedString);

    const result = nacl.sign.detached.verify(message, new Uint8Array(signature.data), new PublicKey(publicKey).toBytes());
    if (!result) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const existingWorker = await prisma.worker.findFirst({
        where: {
            address: publicKey
        }
    })

    if (existingWorker) {
        const token = jwt.sign({
            userId: existingWorker.id,
            role: 'worker'
        }, secret)

        return NextResponse.json({ token })
    }

    else {
        const newWorker = await prisma.worker.create({
            data: {
                address: publicKey
            }
        })

        const token = jwt.sign({
            userId: newWorker.id,
            role: 'worker'
        }, secret)

        return NextResponse.json({ token })
    }
}

