import { NextRequest, NextResponse } from "next/server";
import {jwtVerify} from "jose"
import { headers } from "next/headers";
export async function authMiddleware(req:NextRequest){
    const authHeader = req.headers.get("Authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    try{
    if(!token){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const {payload} = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    const headers = new Headers(req.headers);
    headers.set("x-user-id",String(payload.userId) ?? "");
    return NextResponse.next({request:{headers}})
    }
    catch(error){
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
}

export const config = {
    matcher: ['/api/health/presignedurl'],
  };