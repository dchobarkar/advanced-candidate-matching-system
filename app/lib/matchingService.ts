import { scoringEngine } from "./scoringEngine";
import { skillNormalizer } from "./skillNormalizer";
import { findJobById, getAllJobs } from "../data/sampleJobs";
import { findCandidateById, getAllCandidates } from "../data/sampleCandidates";
import {
  Candidate,
  Job,
  MatchingResult,
  MatchingRequest,
  MatchingResponse,
} from "../types/matching";

export class MatchingService {
  /**
   * Main matching function that processes a matching request
   */
  public async match(request: MatchingRequest): Promise<MatchingResponse> {
    const startTime = Date.now();

    try {
      // Get job and candidate data
      const job = findJobById(request.jobId);
      const candidate = findCandidateById(request.candidateId);

      if (!job) {
        throw new Error(`Job with ID ${request.jobId} not found`);
      }

      if (!candidate) {
        throw new Error(`Candidate with ID ${request.candidateId} not found`);
      }

      // Calculate matching score
      const score = scoringEngine.calculateMatchingScore(candidate, job);

      // Generate explanation
      const explanation = this.generateExplanation(candidate, job, score);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        candidate,
        job,
        score
      );

      const result: MatchingResult = {
        candidate,
        job,
        score,
        explanation,
        recommendations,
      };

      const processingTime = Date.now() - startTime;
      const confidence = this.calculateConfidence(score);

      return {
        result,
        processingTime,
        confidence,
      };
    } catch (error) {
      throw new Error(
        `Matching failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Match a candidate against all available jobs
   */
  public async matchCandidateAgainstAllJobs(
    candidateId: string
  ): Promise<MatchingResult[]> {
    const candidate = findCandidateById(candidateId);
    if (!candidate) {
      throw new Error(`Candidate with ID ${candidateId} not found`);
    }

    const jobs = getAllJobs();
    const results: MatchingResult[] = [];

    for (const job of jobs) {
      const score = scoringEngine.calculateMatchingScore(candidate, job);
      const explanation = this.generateExplanation(candidate, job, score);
      const recommendations = this.generateRecommendations(
        candidate,
        job,
        score
      );

      results.push({
        candidate,
        job,
        score,
        explanation,
        recommendations,
      });
    }

    // Sort by overall score (descending)
    return results.sort((a, b) => b.score.overallScore - a.score.overallScore);
  }

  /**
   * Find candidates for a specific job
   */
  public async findCandidatesForJob(
    jobId: string,
    limit: number = 10
  ): Promise<MatchingResult[]> {
    const job = findJobById(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    const candidates = getAllCandidates();
    const results: MatchingResult[] = [];

    for (const candidate of candidates) {
      const score = scoringEngine.calculateMatchingScore(candidate, job);
      const explanation = this.generateExplanation(candidate, job, score);
      const recommendations = this.generateRecommendations(
        candidate,
        job,
        score
      );

      results.push({
        candidate,
        job,
        score,
        explanation,
        recommendations,
      });
    }

    // Sort by overall score and return top results
    return results
      .sort((a, b) => b.score.overallScore - a.score.overallScore)
      .slice(0, limit);
  }

  /**
   * Generate explanation for the matching result
   */
  private generateExplanation(
    candidate: Candidate,
    job: Job,
    score: import("../types/matching").MatchingScore
  ): string {
    const { breakdown } = score;

    let explanation = `Based on our analysis, ${
      candidate.name
    } has a ${Math.round(score.overallScore * 100)}% match for the ${
      job.title
    } position at ${job.company}. `;

    // Skill match explanation
    if (breakdown.matchedSkills.length > 0) {
      const matchedSkillNames = breakdown.matchedSkills
        .map(
          (skillId: string) =>
            skillNormalizer.getSkillById(skillId)?.canonicalName
        )
        .filter(Boolean)
        .join(", ");
      explanation += `They have direct experience with ${matchedSkillNames}. `;
    }

    if (breakdown.relatedSkills.length > 0) {
      const relatedSkillNames = breakdown.relatedSkills
        .map(
          (skillId: string) =>
            skillNormalizer.getSkillById(skillId)?.canonicalName
        )
        .filter(Boolean)
        .join(", ");
      explanation += `They also have related experience with ${relatedSkillNames}. `;
    }

    // Experience explanation
    if (breakdown.experienceGaps.length === 0) {
      explanation += `Their experience levels align well with the job requirements. `;
    } else {
      const smallGaps = breakdown.experienceGaps.filter(
        (gap: { skillId: string; gap: number }) => gap.gap <= 6
      );
      const largeGaps = breakdown.experienceGaps.filter(
        (gap: { skillId: string; gap: number }) => gap.gap > 6
      );

      if (smallGaps.length > 0) {
        explanation += `They have minor experience gaps in some areas. `;
      }
      if (largeGaps.length > 0) {
        explanation += `There are significant experience gaps that may require additional training. `;
      }
    }

    // Potential indicators
    if (breakdown.potentialIndicators.length > 0) {
      explanation += `They show strong potential indicators including ${breakdown.potentialIndicators.join(
        ", "
      )}. `;
    }

    // Risk factors
    if (breakdown.riskFactors.length > 0) {
      explanation += `Considerations include ${breakdown.riskFactors.join(
        ", "
      )}. `;
    }

    return explanation;
  }

  /**
   * Generate recommendations for the candidate
   */
  private generateRecommendations(
    candidate: Candidate,
    job: Job,
    score: import("../types/matching").MatchingScore
  ): string[] {
    const { breakdown } = score;
    const recommendations: string[] = [];

    // Skill gap recommendations
    if (breakdown.missingSkills.length > 0) {
      const missingSkillNames = breakdown.missingSkills
        .map(
          (skillId: string) =>
            skillNormalizer.getSkillById(skillId)?.canonicalName
        )
        .filter(Boolean);

      recommendations.push(
        `Consider gaining experience with ${missingSkillNames.join(", ")}`
      );
    }

    // Experience gap recommendations
    type ExperienceGap = { skillId: string; gap: number };
    const significantGaps = breakdown.experienceGaps.filter(
      (gap: ExperienceGap) => gap.gap > 6
    );
    if (significantGaps.length > 0) {
      const gapSkills = significantGaps
        .map(
          (gap: ExperienceGap) =>
            skillNormalizer.getSkillById(gap.skillId)?.canonicalName
        )
        .filter(Boolean);

      recommendations.push(
        `Focus on building deeper experience with ${gapSkills.join(", ")}`
      );
    }

    // Learning recommendations
    if (score.overallScore < 0.7) {
      recommendations.push(
        "Consider additional training or certification programs"
      );
    }

    // Leadership recommendations
    if (!candidate.experience.some((exp) => exp.hasLeadershipRole)) {
      recommendations.push(
        "Seek opportunities to demonstrate leadership skills"
      );
    }

    // Education recommendations
    const hasRecentEducation = candidate.education.some(
      (edu) => 2024 - edu.graduationYear <= 5
    );
    if (!hasRecentEducation) {
      recommendations.push(
        "Consider pursuing additional education or certifications"
      );
    }

    return recommendations;
  }

  /**
   * Calculate confidence level based on score breakdown
   */
  private calculateConfidence(
    score: import("../types/matching").MatchingScore
  ): number {
    const { breakdown } = score;

    let confidence = 0.8; // Base confidence

    // Adjust based on data quality
    if (breakdown.matchedSkills.length > 0) {
      confidence += 0.1;
    }

    if (breakdown.missingSkills.length === 0) {
      confidence += 0.05;
    }

    if (breakdown.experienceGaps.length === 0) {
      confidence += 0.05;
    }

    // Reduce confidence for significant gaps
    const largeGaps = breakdown.experienceGaps.filter(
      (gap: { skillId: string; gap: number }) => gap.gap > 12
    );
    confidence -= largeGaps.length * 0.05;

    // Reduce confidence for many missing skills
    if (breakdown.missingSkills.length > breakdown.matchedSkills.length) {
      confidence -= 0.1;
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Get skill suggestions for a candidate based on job requirements
   */
  public getSkillSuggestions(candidateId: string, jobId: string): string[] {
    const candidate = findCandidateById(candidateId);
    const job = findJobById(jobId);

    if (!candidate || !job) {
      return [];
    }

    const suggestions: string[] = [];
    const candidateSkills = new Set(candidate.skills);

    for (const requirement of job.requirements) {
      if (!candidateSkills.has(requirement.skillId)) {
        const skill = skillNormalizer.getSkillById(requirement.skillId);
        if (skill) {
          suggestions.push(skill.canonicalName);
        }
      }
    }

    return suggestions;
  }

  /**
   * Get job suggestions for a candidate
   */
  public async getJobSuggestions(
    candidateId: string,
    limit: number = 5
  ): Promise<Job[]> {
    const results = await this.matchCandidateAgainstAllJobs(candidateId);
    return results.slice(0, limit).map((result) => result.job);
  }

  /**
   * Get candidate suggestions for a job
   */
  public async getCandidateSuggestions(
    jobId: string,
    limit: number = 5
  ): Promise<Candidate[]> {
    const results = await this.findCandidatesForJob(jobId, limit);
    return results.map((result) => result.candidate);
  }
}

// Export a singleton instance
export const matchingService = new MatchingService();
