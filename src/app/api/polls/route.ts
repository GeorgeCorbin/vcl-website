import { NextRequest, NextResponse } from "next/server";
import { PollService } from "@/lib/services";
import { PollStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get("season");
    const status = searchParams.get("status") as PollStatus | null;
    const latest = searchParams.get("latest");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    if (latest === "true") {
      const poll = await PollService.getLatestPublished();
      return NextResponse.json(poll);
    }

    const polls = await PollService.listPollWeeks({
      season: season || undefined,
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekNumber, season, notes } = body;

    if (!weekNumber || !season) {
      return NextResponse.json(
        { error: "Missing required fields: weekNumber, season" },
        { status: 400 }
      );
    }

    const poll = await PollService.createPollWeek({
      weekNumber,
      season,
      notes,
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Failed to create poll" },
      { status: 500 }
    );
  }
}
