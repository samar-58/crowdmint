import { createTaskSchema } from "@/types/createTask";
import { prisma } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";
import { TaskType } from "../../../../generated/prisma/client";


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
       amount:"1",
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