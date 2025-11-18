
import { prisma } from "@/utils/constants";
import { getNextTask } from "@/utils/getNextTask";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(req:NextRequest){
const workerId = req.headers.get("x-worker-id");

    let task = await getNextTask(workerId as string);

    const worker = await prisma.worker.findUnique({
        where:{
            id:workerId as string,
        },
        select:{
            pendingBalance:true,
            lockedBalance:true,
        }
    });

    if(!worker){
        return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    if(!task){
        return NextResponse.json({ message: "No task found",    pendingBalance: worker.pendingBalance,
            lockedBalance: worker.lockedBalance , task: null }, { status: 200 });
    }

return NextResponse.json({ 
    task, 
    pendingBalance: worker.pendingBalance,
    lockedBalance: worker.lockedBalance 
}, { status: 200 });

}