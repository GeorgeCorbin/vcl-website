import { NextRequest, NextResponse } from "next/server";
import { TeamService } from "@/lib/services";
import { Division } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conference = searchParams.get("conference");
    const division = searchParams.get("division") as Division | null;
    const active = searchParams.get("active");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const teams = await TeamService.list({
      conference: conference || undefined,
      division: division || undefined,
      active: active ? active === "true" : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, shortName, conference, division, logoUrl, officialUrl, mclaTeamId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const team = await TeamService.create({
      name,
      shortName,
      conference,
      division,
      logoUrl,
      officialUrl,
      mclaTeamId,
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
