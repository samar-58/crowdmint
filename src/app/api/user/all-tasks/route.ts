import { prisma } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";

interface option{
id:string,
imageUrl:string | null,
count:number
}
interface response{
id:string
amount:number,
title:string,
type:string,
done:boolean,
options:option[]
}
export async function GET(req:NextRequest){
const userId = req.headers.get("x-user-id")

if(!userId){
    return NextResponse.json({
        error:"unauthorized"
    },{status:401})
}

const tasks = await prisma.task.findMany({
    where:{
        userId:userId
    },
    include:{
        options:true
    }
})

// Fetch all submissions for all tasks
const submissions = await prisma.submission.findMany({
    where:{
        taskId:{
            in: tasks.map(t => t.id)
        }
    }
})

// Create a map of optionId -> count
const submissionCounts: Record<string, number> = {};
submissions.forEach(submission => {
    submissionCounts[submission.optionId] = (submissionCounts[submission.optionId] || 0) + 1;
})

let res:response[] = []

function pushTask(id:string,amount:number,title:string,type:string,done:boolean,options:option[]){
res.push({id,amount,title,type,done,options})
}

tasks.forEach(t => {
    const optionsWithCounts = t.options.map(option => ({
        id: option.id,
        imageUrl: option.imageUrl,
        count: submissionCounts[option.id] || 0
    }));
    pushTask(t.id, t.amount, t.title, t.type, t.done, optionsWithCounts);
})

return NextResponse.json({
res
},{status:200})
}