import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Middleware will verify the token and role
  // If we reach here, the token is valid
  const userId = req.headers.get("x-user-id");
  
  return NextResponse.json({ 
    success: true, 
    role: "user",
    userId 
  });
}

