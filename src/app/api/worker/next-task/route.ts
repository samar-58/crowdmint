
import { getNextTask } from "@/utils/getNextTask";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function GET(req:NextRequest){
const workerId = req.headers.get("x-worker-id");

    let task = await getNextTask(workerId as string);

    if(!task){
        return NextResponse.json({ error: "No task found" }, { status: 411 });
    }

return NextResponse.json({ task }, { status: 200 });

}