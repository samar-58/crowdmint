import { PARENT_WALLET_ADDRESS, PARENT_WALLET_SECRET_KEY, prisma } from "@/utils/constants";
import { clusterApiUrl, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import bs58 from "bs58";
export async function POST(req:NextRequest){
let workerId = req.headers.get("x-worker-id");

const connection = new Connection(clusterApiUrl("devnet"));

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


if(!worker){
    return NextResponse.json({error:"Worker not found"},{status:404})
}

const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(PARENT_WALLET_ADDRESS),
      toPubkey: new PublicKey(worker.address),
      lamports: Number(worker.pendingBalance),
    })
  )

const secretKeyBytes = bs58.decode(PARENT_WALLET_SECRET_KEY);

console.log(secretKeyBytes)
const keypair = Keypair.fromSecretKey(secretKeyBytes);

  const signature = await sendAndConfirmTransaction(connection,tx,[keypair])

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
        signature:signature,
        status:"PROCESSING"
    }   
})
})

//all set to send txn to solscan
return NextResponse.json({
    message:"Payout is processing",
    amount:worker.pendingBalance
},{status:200})

}