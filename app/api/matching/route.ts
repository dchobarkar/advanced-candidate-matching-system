import { NextRequest, NextResponse } from "next/server";

import { matchingService } from "../../lib/matchingService";
import { MatchingRequest } from "../../types/matching";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, candidateId } = body as MatchingRequest;

    // Validate required fields
    if (!jobId || !candidateId) {
      return NextResponse.json(
        {
          error: "Missing required fields: jobId and candidateId are required",
        },
        { status: 400 }
      );
    }

    // Process the matching request
    const result = await matchingService.match({ jobId, candidateId });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Matching API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Matching failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const candidateId = searchParams.get("candidateId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!jobId && !candidateId) {
      return NextResponse.json(
        { error: "Either jobId or candidateId is required" },
        { status: 400 }
      );
    }

    let results;

    if (jobId && candidateId) {
      // Single match
      const result = await matchingService.match({ jobId, candidateId });
      results = [result.result];
    } else if (jobId) {
      // Find candidates for a job
      results = await matchingService.findCandidatesForJob(jobId, limit);
    } else if (candidateId) {
      // Find jobs for a candidate
      results = await matchingService.matchCandidateAgainstAllJobs(candidateId);
    } else {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Matching API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Matching failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
