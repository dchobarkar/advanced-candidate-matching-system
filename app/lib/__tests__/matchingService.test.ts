import { matchingService } from "../matchingService";
import { getAllJobs } from "../../data/sampleJobs";
import { getAllCandidates } from "../../data/sampleCandidates";

describe("matchingService", () => {
  it("should match a candidate to a job and return a valid response", async () => {
    const job = getAllJobs()[0];
    const candidate = getAllCandidates()[0];
    const response = await matchingService.match({
      jobId: job.id,
      candidateId: candidate.id,
    });
    expect(response).toHaveProperty("result");
    expect(response.result).toHaveProperty("candidate");
    expect(response.result).toHaveProperty("job");
    expect(response.result).toHaveProperty("score");
    expect(response.result).toHaveProperty("explanation");
    expect(response.result).toHaveProperty("recommendations");
    expect(typeof response.result.score.overallScore).toBe("number");
  });

  it("should throw an error for invalid job or candidate", async () => {
    await expect(
      matchingService.match({
        jobId: "invalid-job",
        candidateId: "invalid-candidate",
      })
    ).rejects.toThrow();
  });
});
