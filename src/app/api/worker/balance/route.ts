import { prisma } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){

    const workerId = req.headers.get("x-worker-id");
    if(!workerId){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await prisma.worker.findFirst({
        where:{
            id:workerId,
        },
        select:{
            pendingBalance:true,
            lockedBalance:true,
        }
    });
   console.log(balance,"balance");
    return NextResponse.json({ balance }, { status: 200 });
}