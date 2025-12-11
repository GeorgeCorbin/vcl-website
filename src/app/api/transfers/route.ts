import { NextRequest, NextResponse } from "next/server";
import { TransferService } from "@/lib/services";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const confirmed = searchParams.get("confirmed");
    const teamId = searchParams.get("teamId");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const transfers = await TransferService.list({
      confirmed: confirmed ? confirmed === "true" : undefined,
      teamId: teamId || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, fromTeamId, toTeamId, position, classYear, notes, confirmed } = body;

    if (!playerName) {
      return NextResponse.json(
        { error: "Missing required field: playerName" },
        { status: 400 }
      );
    }

    const transfer = await TransferService.create({
      playerName,
      fromTeamId,
      toTeamId,
      position,
      classYear,
      notes,
      confirmed,
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
