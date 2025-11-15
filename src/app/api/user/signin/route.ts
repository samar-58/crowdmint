import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/constants";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
const secret = process.env.JWT_SECRET || "secret"

export async function POST(req:NextRequest,res:NextResponse){
const body = await req.json();
const {publicKey, signature} = body;
const signedString = "Sign in to Crowdmint";
const message = new TextEncoder().encode(signedString);

const result = nacl.sign.detached.verify(message, new Uint8Array(signature.data), new PublicKey(publicKey).toBytes());
if(!result){
    return NextResponse.json({error:"Invalid signature"}, {status:400});
}

const existingUser = await prisma.user.findFirst({
    where: {
        address:publicKey
    }
})
if(existingUser){
const token = jwt.sign({
      userId:existingUser.id,
      role: 'user'
},secret)

return NextResponse.json({ token })
}

else{
const newUser = await prisma.user.create({
    data: {
        address:publicKey
    }
})

const token = jwt.sign({
    userId:newUser.id,
    role: 'user'
},secret)

return NextResponse.json({ token })
}
}