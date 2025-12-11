import { NextRequest, NextResponse } from "next/server";
import { PollService } from "@/lib/services";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollWeekId } = await params;
    const body = await request.json();

    // If body is an array, set all entries at once
    if (Array.isArray(body)) {
      await PollService.setEntries(pollWeekId, body);
      const poll = await PollService.getById(pollWeekId);
      return NextResponse.json(poll);
    }

    // Otherwise, add a single entry
    const { teamId, rank, previousRank, points, note } = body;

    if (!teamId || rank === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: teamId, rank" },
        { status: 400 }
      );
    }

    const entry = await PollService.addEntry({
      pollWeekId,
      teamId,
      rank,
      previousRank,
      points,
      note,
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error adding poll entry:", error);
    return NextResponse.json(
      { error: "Failed to add poll entry" },
      { status: 500 }
    );
  }
}
