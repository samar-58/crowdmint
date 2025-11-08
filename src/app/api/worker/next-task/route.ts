import { prisma } from "@/utils/constants";
import { getNextTask } from "@/utils/getNexttask";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
const workerId = req.headers.get("x-worker-id");

    let task = await getNextTask(workerId as string);

    if(!task){
        return NextResponse.json({ error: "No task found" }, { status: 411 });
    }

return NextResponse.json({ task }, { status: 200 });

}