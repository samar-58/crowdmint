import { createTaskSchema } from "@/types/createTask";
import { LAMPORTS_PER_SOL, prisma } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";
import { TaskType } from "../../../../../generated/prisma/client";
import z from "zod";


export async function POST(req:NextRequest){
    const body = await req.json();
    const parsedData = createTaskSchema.safeParse(body);

    if(!parsedData.success){
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    if(!req.headers.get("x-user-id")){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await prisma.$transaction(async tx => {
   const task = await tx.task.create({
    data:{
        title:parsedData?.data?.title ?? "",
       type:parsedData?.data?.type as TaskType,
       signature:parsedData?.data?.signature,
       amount:parsedData?.data?.amount * LAMPORTS_PER_SOL,
       userId:req.headers.get("x-user-id") ?? "",
    }
   })
   await tx.option.createMany({
    data:parsedData.data.options.map((option,index)=>({
        imageUrl:option.imageUrl,
        taskId:task.id,
    }))

   })
   return task;
    })
    return NextResponse.json({ message: "Task created successfully" ,taskId:response?.id}, { status: 200 });
}


export async function GET(req:NextRequest){
 const taskId = z.string().safeParse(req.nextUrl.searchParams.get("taskId"));

const userId = req.headers.get("x-user-id");

 const task = await prisma.task.findUnique({
    where:{
        id:taskId.data,
        userId:userId as string,
    },
    include:{
        options:true,
    }
 })
 if(!task){
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
 }

const submissions = await prisma.submission.findMany({
    where:{
        taskId:task.id,
    },
    include:{
  option:true,
    }
 })
 const result : Record<string, {
    count:number,
    option:{
        imageUrl:string,
    }
 }> = {};
task.options.forEach(option=>{
    result[option.id] = {
        count:0,
        option:{
            imageUrl:option.imageUrl as string,
        }
    }
})
 submissions.forEach(submission => {
    result[submission.optionId].count++;
 })

 return NextResponse.json({ result }, { status: 200 });
}