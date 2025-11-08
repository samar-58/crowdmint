import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/utils/constants";

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

    if (!payload.userId || typeof payload.userId !== "string" && typeof payload.userId !== "number") {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
    }

    const pathname = req.nextUrl.pathname;
    const headers = new Headers(req.headers);

    // User routes - require 'user' role
    if (pathname.startsWith('/api/user/')) {
      if (payload.role !== 'user') {
        return NextResponse.json({ error: "Invalid role" }, { status: 401 });
      }
      // Validate userId exists in User table
      const user = await prisma.user.findUnique({
        where: { id: String(payload.userId) }
      });
      if (!user) {
        return NextResponse.json({ error: "Invalid user" }, { status: 401 });
      }
      headers.set("x-user-id", String(payload.userId));
    }
    // Worker routes - require 'worker' role
    else if (pathname.startsWith('/api/worker/')) {
      if (payload.role !== 'worker') {
        return NextResponse.json({ error: "Invalid role" }, { status: 401 });
      }
      // Validate userId exists in Worker table
      const worker = await prisma.worker.findUnique({
        where: { id: String(payload.userId) }
      });
      if (!worker) {
        return NextResponse.json({ error: "Invalid worker" }, { status: 401 });
      }
      headers.set("x-worker-id", String(payload.userId));
    }

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
  matcher: ["/api/user/:path*", "/api/worker/:path*"],
};