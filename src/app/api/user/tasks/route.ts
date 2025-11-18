import { createTaskSchema } from "@/types/createTask";
import { LAMPORTS_PER_SOL, prisma } from "@/utils/constants";
import { NextRequest, NextResponse } from "next/server";
import { TaskType } from "../../../../../generated/prisma/client";
import z from "zod";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { PARENT_WALLET_ADDRESS } from "@/utils/constants";

export async function POST(req:NextRequest){
    const userId = req.headers.get("x-user-id");
    const body = await req.json();
    const parsedData = createTaskSchema.safeParse(body);
    const connection = new Connection(clusterApiUrl("devnet"));

    if(!parsedData.success){
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    if(!req.headers.get("x-user-id")){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where:{
            id:userId as string,
        }
    })
    if(!user){
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

const transaction = await connection.getTransaction(parsedData.data.signature,{
    maxSupportedTransactionVersion:1,
})

if((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== parsedData.data.amount * 10**9){
    return NextResponse.json({ error: "Transaction signature/amount is invalid" }, { status: 404 });
}
if(transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS)
    {
    return NextResponse.json({ error: "Transaction sent to wrong wallet" }, { status: 404 });
}
if(transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user.address)
    {
    return NextResponse.json({ error: "Transaction came from wrong wallet" }, { status: 404 });
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
 const taskId = z.string().optional().safeParse(req.nextUrl.searchParams.get("taskId"));

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