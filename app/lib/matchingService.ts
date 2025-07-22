import { scoringEngine } from "./scoringEngine";
import { skillNormalizer } from "./skillNormalizer";
import { aiService } from "./aiService";
import { findJobById, getAllJobs } from "../data/sampleJobs";
import { findCandidateById, getAllCandidates } from "../data/sampleCandidates";
import {
  Candidate,
  Job,
  MatchingResult,
  MatchingRequest,
  MatchingResponse,
} from "../types/matching";

/**
 * Core matching service that orchestrates the candidate-job matching process.
 *
 * This service combines traditional scoring algorithms with AI-powered analysis
 * to provide comprehensive matching results that go beyond simple skill comparison.
 *
 * Key Features:
 * - Multi-factor scoring (skills, experience, transferability, potential)
 * - AI-enhanced analysis (skill transferability, cultural fit, learning potential)
 * - Explainable results with detailed breakdowns
 * - Confidence scoring with AI validation
 * - Comprehensive recommendations
 *
 * @example
 * ```typescript
 * const result = await matchingService.match({
 *   jobId: "job-1",
 *   candidateId: "candidate-1"
 * });
 * ```
 */
export class MatchingService {
  /**
   * Main matching function that processes a matching request with enhanced AI analysis.
   *
   * This is the primary entry point for candidate-job matching. It performs:
   * 1. Data validation and retrieval
   * 2. Multi-factor scoring calculation
   * 3. AI-enhanced analysis (skill transferability, cultural fit, learning potential)
   * 4. Explanation generation with AI insights
   * 5. Recommendation generation with AI insights
   * 6. Confidence calculation with AI validation
   *
   * @param request - The matching request containing jobId and candidateId
   * @returns Promise<MatchingResponse> - Complete matching result with AI insights
   * @throws Error - If job or candidate not found, or if matching fails
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

      // Enhanced AI analysis
      const aiAnalysis = await this.performEnhancedAIAnalysis(candidate, job);

      // Generate explanation with AI insights
      const explanation = this.generateEnhancedExplanation(
        candidate,
        job,
        score,
        aiAnalysis
      );

      // Generate recommendations with AI insights
      const recommendations = this.generateEnhancedRecommendations(
        candidate,
        job,
        score,
        aiAnalysis
      );

      const result: MatchingResult = {
        candidate,
        job,
        score,
        explanation,
        recommendations,
      };

      const processingTime = Date.now() - startTime;
      const confidence = this.calculateEnhancedConfidence(score, aiAnalysis);

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
   * Match a candidate against all available jobs to find the best opportunities.
   *
   * This method evaluates a candidate against all available jobs and returns
   * results sorted by overall match score (descending). Useful for:
   * - Job recommendations for candidates
   * - Understanding a candidate's market position
   * - Identifying skill gaps across different job types
   *
   * @param candidateId - The ID of the candidate to match
   * @returns Promise<MatchingResult[]> - Array of matching results sorted by score
   * @throws Error - If candidate not found
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
   * Find the best candidates for a specific job.
   *
   * This method evaluates all candidates against a specific job and returns
   * the top candidates sorted by overall match score (descending). Useful for:
   * - Recruiting for a specific position
   * - Understanding the candidate pool for a job
   * - Identifying the most qualified candidates
   *
   * @param jobId - The ID of the job to find candidates for
   * @param limit - Maximum number of candidates to return (default: 10)
   * @returns Promise<MatchingResult[]> - Array of matching results sorted by score
   * @throws Error - If job not found
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
   * Perform enhanced AI analysis for candidate-job matching
   */
  private async performEnhancedAIAnalysis(candidate: Candidate, job: Job) {
    interface AIAnalysis {
      skillTransferability: Array<{
        sourceSkill: string;
        targetSkill: string;
        transferabilityScore: number;
        learningPath: string[];
        timeToTransfer: number;
        confidence: number;
      }>;
      culturalFit: {
        culturalFitScore: number;
        teamCollaborationScore: number;
        adaptabilityScore: number;
        recommendations: string[];
      } | null;
      learningPotential: Array<{
        skill: string;
        learnability: number;
        timeToProficiency: number;
        recommendations: string[];
      }>;
      experienceValidation: Array<{
        skill: string;
        isValid: boolean;
        confidence: number;
        complexityLevel: number;
      }>;
    }

    const analysis: AIAnalysis = {
      skillTransferability: [],
      culturalFit: null,
      learningPotential: [],
      experienceValidation: [],
    };

    try {
      // Analyze skill transferability for missing skills
      const missingSkills = job.requirements.filter(
        (req) => !candidate.skills.includes(req.skillId)
      );

      for (const missingSkill of missingSkills.slice(0, 3)) {
        // Limit to top 3 for performance
        const relatedSkills = candidate.skills.filter((skillId) =>
          skillNormalizer.areSkillsRelated(skillId, missingSkill.skillId)
        );

        if (relatedSkills.length > 0) {
          const sourceSkill = relatedSkills[0];
          const candidateExp = candidate.experience.find(
            (exp) => exp.skillId === sourceSkill
          );

          if (candidateExp) {
            const transferability = await aiService.analyzeSkillTransferability(
              sourceSkill,
              missingSkill.skillId,
              candidateExp.projectDescription || `${sourceSkill} experience`
            );
            analysis.skillTransferability.push({
              sourceSkill,
              targetSkill: missingSkill.skillId,
              ...transferability,
            });
          }
        }
      }

      // Assess cultural fit
      const candidateSummary = candidate.summary;
      const companyCulture = job.company; // Simplified - could be enhanced with actual company culture data
      const teamSize = "25"; // Simplified - could be enhanced with actual team size data

      analysis.culturalFit = await aiService.assessCulturalFit(
        candidateSummary,
        companyCulture,
        teamSize
      );

      // Assess learning potential for missing skills
      for (const missingSkill of missingSkills.slice(0, 2)) {
        // Limit to top 2 for performance
        const learningAssessment = await aiService.assessLearningPotential(
          missingSkill.skillId,
          candidateSummary
        );
        analysis.learningPotential.push({
          skill: missingSkill.skillId,
          ...learningAssessment,
        });
      }

      // Validate experience claims
      for (const experience of candidate.experience.slice(0, 3)) {
        // Limit to top 3 for performance
        const validation = await aiService.validateExperience(
          experience.skillId,
          experience.projectDescription || `${experience.skillId} experience`,
          experience.duration
        );
        analysis.experienceValidation.push({
          skill: experience.skillId,
          ...validation,
        });
      }
    } catch (error) {
      console.error("Enhanced AI analysis failed:", error);
      // Continue with basic analysis if AI fails
    }

    return analysis;
  }

  /**
   * Generate enhanced explanation with AI insights
   */
  private generateEnhancedExplanation(
    candidate: Candidate,
    job: Job,
    score: import("../types/matching").MatchingScore,
    aiAnalysis: {
      skillTransferability: Array<{
        sourceSkill: string;
        targetSkill: string;
        transferabilityScore: number;
      }>;
      culturalFit: {
        culturalFitScore: number;
      } | null;
      learningPotential: Array<{
        timeToProficiency: number;
      }>;
    }
  ): string {
    let explanation = this.generateExplanation(candidate, job, score);

    // Add AI insights if available
    if (aiAnalysis.skillTransferability.length > 0) {
      const bestTransfer = aiAnalysis.skillTransferability.reduce(
        (best, current) =>
          current.transferabilityScore > best.transferabilityScore
            ? current
            : best
      );
      explanation += ` AI analysis shows strong transferability (${Math.round(
        bestTransfer.transferabilityScore * 100
      )}%) from ${bestTransfer.sourceSkill} to ${bestTransfer.targetSkill}.`;
    }

    if (aiAnalysis.culturalFit) {
      const culturalScore = Math.round(
        aiAnalysis.culturalFit.culturalFitScore * 100
      );
      explanation += ` Cultural fit assessment indicates ${culturalScore}% alignment with company values.`;
    }

    if (aiAnalysis.learningPotential.length > 0) {
      const avgLearningTime =
        aiAnalysis.learningPotential.reduce(
          (sum, item) => sum + item.timeToProficiency,
          0
        ) / aiAnalysis.learningPotential.length;
      explanation += ` Estimated learning time for missing skills: ${Math.round(
        avgLearningTime
      )} months.`;
    }

    return explanation;
  }

  /**
   * Generate enhanced recommendations with AI insights
   */
  private generateEnhancedRecommendations(
    candidate: Candidate,
    job: Job,
    score: import("../types/matching").MatchingScore,
    aiAnalysis: any
  ): string[] {
    const recommendations = this.generateRecommendations(candidate, job, score);

    // Add AI-powered recommendations
    if (aiAnalysis.skillTransferability.length > 0) {
      const bestTransfer = aiAnalysis.skillTransferability.reduce(
        (best: any, current: any) =>
          current.transferabilityScore > best.transferabilityScore
            ? current
            : best
      );
      recommendations.push(
        `Leverage ${bestTransfer.sourceSkill} experience to accelerate learning of ${bestTransfer.targetSkill}`
      );
    }

    if (aiAnalysis.learningPotential.length > 0) {
      const fastestLearning = aiAnalysis.learningPotential.reduce(
        (fastest: any, current: any) =>
          current.timeToProficiency < fastest.timeToProficiency
            ? current
            : fastest
      );
      recommendations.push(
        `Focus on ${fastestLearning.skill} first (${Math.round(
          fastestLearning.timeToProficiency
        )} months to proficiency)`
      );
    }

    if (aiAnalysis.culturalFit && aiAnalysis.culturalFit.recommendations) {
      recommendations.push(
        ...aiAnalysis.culturalFit.recommendations.slice(0, 2)
      );
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Calculate enhanced confidence with AI analysis
   */
  private calculateEnhancedConfidence(
    score: import("../types/matching").MatchingScore,
    aiAnalysis: any
  ): number {
    let confidence = this.calculateConfidence(score);

    // Adjust confidence based on AI analysis
    if (aiAnalysis.skillTransferability.length > 0) {
      const avgTransferability =
        aiAnalysis.skillTransferability.reduce(
          (sum: number, item: any) => sum + item.transferabilityScore,
          0
        ) / aiAnalysis.skillTransferability.length;
      confidence += avgTransferability * 0.1; // Boost confidence for good transferability
    }

    if (aiAnalysis.culturalFit) {
      confidence += aiAnalysis.culturalFit.culturalFitScore * 0.05; // Small boost for cultural fit
    }

    if (aiAnalysis.experienceValidation.length > 0) {
      const avgValidationConfidence =
        aiAnalysis.experienceValidation.reduce(
          (sum: number, item: any) => sum + item.confidence,
          0
        ) / aiAnalysis.experienceValidation.length;
      confidence += avgValidationConfidence * 0.05; // Small boost for validated experience
    }

    return Math.min(1.0, Math.max(0.3, confidence));
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
