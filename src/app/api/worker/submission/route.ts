import { submissionSchema } from "@/types/submissionSchema";
import { LAMPORTS_PER_SOL, prisma } from "@/utils/constants";
import { getNextTask } from "@/utils/getNextTask";
import { NextRequest, NextResponse } from "next/server";

const TotalWorkers = 10;

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

if(task?.id === parsedData.data.taskId){
    return NextResponse.json({ error: "Invalid Task Id" }, { status: 404 });
}
let amount = task.amount / LAMPORTS_PER_SOL / TotalWorkers;

const submission = prisma.$transaction(async tx => {
    let submission = await tx.submission.create({
        data:{
            workerId:workerId as string,
            taskId:task.id,
            optionId:parsedData.data.optionId,
            amount:amount,
        }
    })

    await tx.worker.update({
        where:{
            id:workerId as string,
        },
        data:{
            pendingBalance: {
                increment: amount * LAMPORTS_PER_SOL,
            },
        },
    })
})


const nextTask = await getNextTask(workerId as string);
if(nextTask){
    return NextResponse.json({ message: "Submission created successfully" ,nextTask:nextTask}, { status: 200 });
}
else{
    return NextResponse.json({ message: "No next task found" }, { status: 404 });
}
}