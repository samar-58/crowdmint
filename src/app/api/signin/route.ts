import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../../../generated/prisma/client";


const prisma = new PrismaClient({})
const secret = process.env.JWT_SECRET || "secret"

export async function POST(req:NextRequest,res:NextResponse){

const hardcodedWalletAddress = "6k9VSg4bVvVAj5xVis9eG74vED9iWYXjhSUCnA8gzChR";

const existingUser = await prisma.user.findFirst({
    where: {
        address:hardcodedWalletAddress
    }
})
console.log(secret,"secret")

if(existingUser){
const token = jwt.sign({
      userId:existingUser.id
},secret)

return NextResponse.json({ token })
}

else{
const newUser = await prisma.user.create({
    data: {
        address:hardcodedWalletAddress
    }
})

const token = jwt.sign({
    userId:newUser.id
},secret)

return NextResponse.json({ token })
}
}