import { prisma } from "@/utils/constants";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
let workerId = req.headers.get("x-worker-id");

if(!workerId){
    return NextResponse.json({
    error:"Unauthorized"
    },{status:401})
}

console.log(workerId)

const worker = await prisma.worker.findFirst({
where:{
    id:workerId
}
})

const txnId = "0xkjndscojndkpmsdl"

if(!worker){
    return NextResponse.json({error:"Worker not found"},{status:404})
}

//we will add a lock here
 await prisma.$transaction(async tx => {
 await tx.worker.update({
    where:{
        id:workerId
    },
    data:{
     pendingBalance:{
        decrement:worker?.pendingBalance
     },
     lockedBalance:{
        increment:worker?.pendingBalance
     }
    }
})
await tx.payouts.create({
    data:{
        workerId:workerId,
        amount:worker.pendingBalance,
        signature:txnId,
        status:"PROCESSING"
    }
})

})

//all set to send txn to solscan


}