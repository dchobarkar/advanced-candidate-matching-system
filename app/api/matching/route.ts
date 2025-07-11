import { NextRequest, NextResponse } from "next/server";

import { matchingService } from "../../lib/matchingService";
import { MatchingRequest } from "../../types/matching";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, candidateId } = body as MatchingRequest;

    // Enhanced validation with specific error messages
    if (!jobId && !candidateId) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Both jobId and candidateId are required for matching",
          code: "MISSING_REQUIRED_FIELDS",
        },
        { status: 400 }
      );
    }

    if (!jobId) {
      return NextResponse.json(
        {
          error: "Missing jobId",
          details: "Please provide a valid job ID to perform matching",
          code: "MISSING_JOB_ID",
        },
        { status: 400 }
      );
    }

    if (!candidateId) {
      return NextResponse.json(
        {
          error: "Missing candidateId",
          details: "Please provide a valid candidate ID to perform matching",
          code: "MISSING_CANDIDATE_ID",
        },
        { status: 400 }
      );
    }

    // Validate that job and candidate exist
    try {
      const result = await matchingService.match({ jobId, candidateId });
      return NextResponse.json(result);
    } catch (matchError) {
      if (matchError instanceof Error) {
        if (matchError.message.includes("not found")) {
          return NextResponse.json(
            {
              error: "Resource not found",
              details: matchError.message,
              code: "RESOURCE_NOT_FOUND",
            },
            { status: 404 }
          );
        }
        if (matchError.message.includes("invalid")) {
          return NextResponse.json(
            {
              error: "Invalid request",
              details: matchError.message,
              code: "INVALID_REQUEST",
            },
            { status: 400 }
          );
        }
      }
      throw matchError;
    }
  } catch (error) {
    console.error("Matching API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Matching failed",
        details: errorMessage,
        code: "MATCHING_ERROR",
      },
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

    // Validate limit parameter
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          error: "Invalid limit parameter",
          details: "Limit must be a number between 1 and 100",
          code: "INVALID_LIMIT",
        },
        { status: 400 }
      );
    }

    if (!jobId && !candidateId) {
      return NextResponse.json(
        {
          error: "Missing query parameters",
          details: "Either jobId or candidateId is required",
          code: "MISSING_QUERY_PARAMS",
        },
        { status: 400 }
      );
    }

    let results;

    try {
      if (jobId && candidateId) {
        // Single match
        const result = await matchingService.match({ jobId, candidateId });
        results = [result.result];
      } else if (jobId) {
        // Find candidates for a job
        results = await matchingService.findCandidatesForJob(jobId, limit);
      } else if (candidateId) {
        // Find jobs for a candidate
        results = await matchingService.matchCandidateAgainstAllJobs(
          candidateId
        );
      } else {
        return NextResponse.json(
          {
            error: "Invalid request parameters",
            details: "Unable to process the provided parameters",
            code: "INVALID_PARAMETERS",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        results,
        count: results.length,
        timestamp: new Date().toISOString(),
      });
    } catch (matchError) {
      if (matchError instanceof Error) {
        if (matchError.message.includes("not found")) {
          return NextResponse.json(
            {
              error: "Resource not found",
              details: matchError.message,
              code: "RESOURCE_NOT_FOUND",
            },
            { status: 404 }
          );
        }
      }
      throw matchError;
    }
  } catch (error) {
    console.error("Matching API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Matching failed",
        details: errorMessage,
        code: "MATCHING_ERROR",
      },
      { status: 500 }
    );
  }
}
