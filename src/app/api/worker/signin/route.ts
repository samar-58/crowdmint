import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/constants";
const secret = process.env.JWT_SECRET || "secret"

export async function POST(req:NextRequest,res:NextResponse){

const hardcodedWalletAddress = "6k9VSg4bVvVAj5xVis9eG74vED9iWYXjhSUCnA8gzChR";

const existingWorker = await prisma.worker.findFirst({
    where: {
        address:hardcodedWalletAddress
    }
})

if(existingWorker){
const token = jwt.sign({
      userId:existingWorker.id,
      role: 'worker'
},secret)

return NextResponse.json({ token })
}

else{
const newWorker = await prisma.worker.create({
    data: {
        address:hardcodedWalletAddress
    }
})

const token = jwt.sign({
    userId:newWorker.id,
    role: 'worker'
},secret)

return NextResponse.json({ token })
}
}

