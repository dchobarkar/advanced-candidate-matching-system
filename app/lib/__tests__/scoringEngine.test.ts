import { scoringEngine } from "../scoringEngine";
import { getAllJobs } from "../../data/sampleJobs";
import { getAllCandidates } from "../../data/sampleCandidates";

describe("scoringEngine", () => {
  it("should calculate a valid matching score for a candidate and job", () => {
    const job = getAllJobs()[0];
    const candidate = getAllCandidates()[0];
    const score = scoringEngine.calculateMatchingScore(candidate, job);
    expect(typeof score.overallScore).toBe("number");
    expect(score).toHaveProperty("skillMatchScore");
    expect(score).toHaveProperty("experienceScore");
    expect(score).toHaveProperty("transferableSkillsScore");
    expect(score).toHaveProperty("potentialScore");
    expect(score).toHaveProperty("breakdown");
  });
});
