import { NextRequest, NextResponse } from "next/server";
import { getConferencesForLeague } from "@/lib/league-config";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { code } = await context.params;
  const conferences = await getConferencesForLeague(code);
  return NextResponse.json(conferences);
}
