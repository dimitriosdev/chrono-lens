import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";

export async function GET() {
  return NextResponse.json({
    ...APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0,
  });
}
