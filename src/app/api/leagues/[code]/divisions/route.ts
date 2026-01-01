import { NextRequest, NextResponse } from "next/server";
import { getDivisionsForLeague } from "@/lib/league-config";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { code } = await context.params;
  const divisions = await getDivisionsForLeague(code);
  return NextResponse.json(divisions);
}
