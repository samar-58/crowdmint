import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Middleware will verify the token and role
  // If we reach here, the token is valid
  const workerId = req.headers.get("x-worker-id");
  
  return NextResponse.json({ 
    success: true, 
    role: "worker",
    workerId 
  });
}

