import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/constants";

export async function POST(req: NextRequest) {
  const workerId = req.headers.get("x-worker-id");
  if (!workerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await prisma.worker.findFirst({ where: { id: workerId }});
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  const sqs = new SQSClient({ region: process.env.AWS_REGION as string });

if(!process.env.AWS_SQS_URL){
  console.log("SQS URL not found",process.env.AWS_SQS_URL)
  return NextResponse.json({ error: "SQS URL not found" }, { status: 500 });
}
if(worker.pendingBalance <= 0){
  console.log("No pending balance",worker.pendingBalance)
  return NextResponse.json({ error: "No pending balance" }, { status: 400 });
}

try {
  const amount = worker.pendingBalance;
  const payout = await prisma.$transaction(async (tx) => {

    const updatedWorker = await tx.worker.update({
      where: { id: workerId },
      data: {
        pendingBalance: { decrement: amount },
        lockedBalance: { increment: amount },
      },
    });

    const newPayout = await tx.payouts.create({
      data: {
        workerId,
        amount,
        status: "PROCESSING",
        signature: "",
      },
    });
    return newPayout;
  });

  try {
    await sqs.send(new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_URL,
      MessageBody: JSON.stringify({
        workerId: workerId,
        workerAddress: worker.address,
        pendingBalance: payout.amount
      })
    }));
  } catch (sqsError) {
    console.error("SQS send failed after successful transaction:", sqsError);
  }
  return NextResponse.json({
    message: "Payout queued",
    amount: payout.amount
  });
} catch (error) {
  console.error("Payout transaction failed:", error);
  return NextResponse.json(
    { error: "Failed to process payout" },
    { status: 500 }
  );
}
}
