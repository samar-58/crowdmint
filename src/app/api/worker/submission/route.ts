import { submissionSchema } from "@/types/submissionSchema";
import { LAMPORTS_PER_SOL, prisma } from "@/utils/constants";
import { getNextTask } from "@/utils/getNextTask";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req:NextRequest){
    const body = await req.json();
    const workerId = req.headers.get("x-worker-id");
    const parsedData = submissionSchema.safeParse(body);

    if(!parsedData.success){
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

let task = await getNextTask(workerId as string);

if(!task){
    return NextResponse.json({ error: "No task found" }, { status: 404 });
}

if(task?.id !== parsedData.data.taskId){
    return NextResponse.json({ error: "Invalid Task Id" }, { status: 404 });
}
let amount = task.amount  / task.maximumSubmissions;

const updatedWorker = await prisma.$transaction(async tx => {
    let submission = await tx.submission.create({
        data:{
            workerId:workerId as string,
            taskId:task.id,
            optionId:parsedData.data.optionId,
            amount:amount,
        }
    })

    const worker = await tx.worker.update({
        where:{
            id:workerId as string,
        },
        data:{
            pendingBalance: {
                increment: amount,
            },
        },
        select:{
            pendingBalance: true,
            lockedBalance: true,
        }
    })

    return worker;
})


const nextTask = await getNextTask(workerId as string);
return NextResponse.json({ 
    message: nextTask ? "Submission created successfully" : "Submission created successfully - All tasks completed!", 
    nextTask: nextTask || null,
    pendingBalance: updatedWorker.pendingBalance,
    lockedBalance: updatedWorker.lockedBalance
}, { status: 200 });
}