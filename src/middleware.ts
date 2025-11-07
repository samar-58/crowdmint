import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  try {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || "secret";
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    // Type guard to ensure userId exists in payload
    if (!payload.userId || typeof payload.userId !== "string" && typeof payload.userId !== "number") {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const headers = new Headers(req.headers);
    headers.set("x-user-id", String(payload.userId));

    return NextResponse.next({
      request: {
        headers,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/presignedurl","/api/tasks"],
};

