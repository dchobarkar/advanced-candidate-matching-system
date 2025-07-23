import { skillNormalizer } from "./skillNormalizer";
import {
  Candidate,
  Job,
  JobRequirement,
  MatchingScore,
  ScoreBreakdown,
  ExperienceGap,
  Experience,
} from "../types/matching";

// Type definitions for better type safety
interface ScoringWeights {
  skillMatch: number;
  experience: number;
  transferableSkills: number;
  potential: number;
}

interface ScoringConfig {
  weights: ScoringWeights;
  defaultCacheExpiryMinutes: number;
  maxRelatedSkillsBonus: number;
  experienceNormalizationMonths: number;
  degreeLevels: Record<string, number>;
}

interface SkillMatchResult {
  score: number;
  directMatches: string[];
  relatedMatches: string[];
  missingSkills: string[];
}

interface ExperienceResult {
  score: number;
  relevantExperience: Experience[];
  gaps: ExperienceGap[];
}

interface TransferableSkillsResult {
  score: number;
  transferableSkills: Experience[];
  transferabilityScores: number[];
}

interface PotentialResult {
  score: number;
  educationScore: number;
  learningScore: number;
  growthScore: number;
  indicators: string[];
}

/**
 * Multi-factor scoring engine for candidate-job matching.
 *
 * This engine implements a sophisticated scoring algorithm that goes beyond
 * simple skill matching to consider multiple factors that contribute to
 * job-candidate fit:
 *
 * Scoring Weights:
 * - Skill Match (40%): Direct and related skill matches
 * - Experience (30%): Depth and relevance of experience
 * - Transferable Skills (20%): Skills that can transfer to required skills
 * - Potential (10%): Learning ability, growth trajectory, education
 *
 * The scoring system provides explainable results with detailed breakdowns
 * showing matched skills, missing skills, experience gaps, and potential indicators.
 *
 * @example
 * ```typescript
 * const scoringEngine = createScoringEngine();
 * const score = scoringEngine.calculateMatchingScore(candidate, job);
 * console.log(`Overall Score: ${score.overallScore}%`);
 * console.log(`Skill Match: ${score.skillMatchScore}%`);
 * ```
 */

// Create scoring engine with configuration
export function createScoringEngine(): ReturnType<
  typeof createScoringEngineInstance
> {
  return createScoringEngineInstance();
}

function createScoringEngineInstance() {
  // Configuration
  const config: ScoringConfig = {
    weights: {
      skillMatch: 0.4,
      experience: 0.3,
      transferableSkills: 0.2,
      potential: 0.1,
    },
    defaultCacheExpiryMinutes: 5,
    maxRelatedSkillsBonus: 0.3,
    experienceNormalizationMonths: 24,
    degreeLevels: {
      phd: 3,
      doctorate: 3,
      master: 2,
      bachelor: 1,
      associate: 0.5,
      diploma: 0.5,
      certificate: 0.25,
    },
  };

  /**
   * Calculate the overall matching score between a candidate and job.
   *
   * This is the main scoring function that combines multiple factors:
   * 1. Skill match score (40% weight) - direct and related skill matches
   * 2. Experience score (30% weight) - depth and relevance of experience
   * 3. Transferable skills score (20% weight) - skills that can transfer
   * 4. Potential score (10% weight) - learning ability and growth trajectory
   *
   * The function returns a comprehensive score object with:
   * - Overall score (weighted average of all factors)
   * - Individual factor scores for transparency
   * - Detailed breakdown for explainability
   *
   * @param candidate - The candidate to evaluate
   * @param job - The job to match against
   * @returns MatchingScore - Complete scoring result with breakdown
   */
  function calculateMatchingScore(
    candidate: Candidate,
    job: Job
  ): MatchingScore {
    const skillMatchResult = calculateSkillMatchScore(
      job.requirements,
      candidate
    );
    const experienceResult = calculateExperienceScore(
      job.requirements,
      candidate
    );
    const transferableSkillsResult = calculateTransferableSkillsScore(
      job.requirements,
      candidate
    );
    const potentialResult = calculatePotentialScore(candidate);

    const overallScore =
      skillMatchResult.score * config.weights.skillMatch +
      experienceResult.score * config.weights.experience +
      transferableSkillsResult.score * config.weights.transferableSkills +
      potentialResult.score * config.weights.potential;

    const breakdown = generateScoreBreakdown(job.requirements, candidate);

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      skillMatchScore: Math.round(skillMatchResult.score * 100) / 100,
      experienceScore: Math.round(experienceResult.score * 100) / 100,
      transferableSkillsScore:
        Math.round(transferableSkillsResult.score * 100) / 100,
      potentialScore: Math.round(potentialResult.score * 100) / 100,
      breakdown,
    };
  }

  /**
   * Calculate skill match score (40% weight)
   *
   * @param requirements - Job requirements to match against
   * @param candidate - Candidate to evaluate
   * @returns SkillMatchResult with score and detailed breakdown
   */
  function calculateSkillMatchScore(
    requirements: JobRequirement[],
    candidate: Candidate
  ): SkillMatchResult {
    let totalScore = 0;
    let totalWeight = 0;
    const directMatches: string[] = [];
    const relatedMatches: string[] = [];
    const missingSkills: string[] = [];

    for (const requirement of requirements) {
      const weight = requirement.isRequired ? 2 : 1;
      totalWeight += weight;

      const candidateSkill = findCandidateSkill(requirement.skillId, candidate);

      if (candidateSkill) {
        // Direct match
        totalScore += weight * 1.0;
        directMatches.push(requirement.skillId);

        // Related skills bonus
        const relatedBonus = calculateRelatedSkillsBonus(
          requirement.skillId,
          candidate
        );
        totalScore += weight * relatedBonus * config.maxRelatedSkillsBonus;
      } else {
        // Check for related skills
        const relatedBonus = calculateRelatedSkillsBonus(
          requirement.skillId,
          candidate
        );
        totalScore += weight * relatedBonus * 0.5;

        if (relatedBonus > 0) {
          relatedMatches.push(requirement.skillId);
        } else {
          missingSkills.push(requirement.skillId);
        }
      }
    }

    return {
      score: totalWeight > 0 ? totalScore / totalWeight : 0,
      directMatches,
      relatedMatches,
      missingSkills,
    };
  }

  /**
   * Calculate experience score (30% weight)
   *
   * @param requirements - Job requirements to match against
   * @param candidate - Candidate to evaluate
   * @returns ExperienceResult with score and detailed breakdown
   */
  function calculateExperienceScore(
    requirements: JobRequirement[],
    candidate: Candidate
  ): ExperienceResult {
    let totalScore = 0;
    let totalWeight = 0;
    const relevantExperience: Experience[] = [];
    const gaps: ExperienceGap[] = [];

    for (const requirement of requirements) {
      const weight = requirement.isRequired ? 2 : 1;
      totalWeight += weight;

      const experience = findRelevantExperience(requirement.skillId, candidate);

      if (experience) {
        relevantExperience.push(experience);

        // Duration factor (0-1)
        const durationScore = Math.min(
          experience.duration / requirement.minDuration,
          1.0
        );

        // Complexity factor (0-1)
        const complexityScore = experience.complexityLevel / 5.0;

        // Leadership factor
        const leadershipScore = experience.hasLeadershipRole ? 1.0 : 0.5;

        // Level alignment factor
        const levelScore = calculateLevelAlignment(
          experience.complexityLevel,
          requirement.requiredLevel
        );

        const experienceScore =
          (durationScore + complexityScore + leadershipScore + levelScore) / 4;
        totalScore += weight * experienceScore;

        // Calculate gap if any
        const gap = Math.max(0, requirement.minDuration - experience.duration);
        if (gap > 0) {
          gaps.push({
            skillId: requirement.skillId,
            requiredDuration: requirement.minDuration,
            candidateDuration: experience.duration,
            gap,
            learnability: calculateLearnability(requirement.skillId, candidate),
          });
        }
      } else {
        // No relevant experience
        totalScore += weight * 0.1;

        gaps.push({
          skillId: requirement.skillId,
          requiredDuration: requirement.minDuration,
          candidateDuration: 0,
          gap: requirement.minDuration,
          learnability: calculateLearnability(requirement.skillId, candidate),
        });
      }
    }

    return {
      score: totalWeight > 0 ? totalScore / totalWeight : 0,
      relevantExperience,
      gaps,
    };
  }

  /**
   * Calculate transferable skills score (20% weight)
   *
   * @param requirements - Job requirements to match against
   * @param candidate - Candidate to evaluate
   * @returns TransferableSkillsResult with score and detailed breakdown
   */
  function calculateTransferableSkillsScore(
    requirements: JobRequirement[],
    candidate: Candidate
  ): TransferableSkillsResult {
    let totalScore = 0;
    let totalWeight = 0;
    const transferableSkills: Experience[] = [];
    const transferabilityScores: number[] = [];

    for (const requirement of requirements) {
      const weight = requirement.isRequired ? 2 : 1;
      totalWeight += weight;

      // Find transferable skills
      const skills = findTransferableSkills(requirement.skillId, candidate);

      if (skills.length > 0) {
        transferableSkills.push(...skills);

        // Calculate average transferability score
        const scores = skills.map((skill) => {
          const skillData = skillNormalizer.getSkillById(skill.skillId);
          const requiredSkillData = skillNormalizer.getSkillById(
            requirement.skillId
          );

          if (!skillData || !requiredSkillData) return 0;

          // Base transferability based on skill difficulty
          const baseTransferability =
            1 -
            Math.abs(
              skillData.difficultyLevel - requiredSkillData.difficultyLevel
            ) /
              5;

          // Experience factor
          const experienceFactor = Math.min(
            skill.duration / config.experienceNormalizationMonths,
            1.0
          );

          return baseTransferability * experienceFactor;
        });

        transferabilityScores.push(...scores);
        const avgTransferability =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        totalScore += weight * avgTransferability;
      } else {
        totalScore += weight * 0;
      }
    }

    return {
      score: totalWeight > 0 ? totalScore / totalWeight : 0,
      transferableSkills,
      transferabilityScores,
    };
  }

  /**
   * Calculate potential score (10% weight)
   *
   * @param candidate - Candidate to evaluate
   * @returns PotentialResult with score and detailed breakdown
   */
  function calculatePotentialScore(candidate: Candidate): PotentialResult {
    // Education factor
    const educationScore = calculateEducationScore(candidate.education);

    // Learning indicators
    const learningScore = calculateLearningIndicators(candidate);

    // Growth trajectory
    const growthScore = calculateGrowthTrajectory(candidate);

    const potentialScore =
      educationScore * 0.3 + learningScore * 0.4 + growthScore * 0.3;

    // Identify potential indicators
    const indicators: string[] = [];

    if (
      candidate.education.some((edu) =>
        edu.field.toLowerCase().includes("computer")
      )
    ) {
      indicators.push("Strong educational background in computer science");
    }

    if (candidate.experience.some((exp) => exp.hasLeadershipRole)) {
      indicators.push("Demonstrated leadership experience");
    }

    if (candidate.skills.length > 5) {
      indicators.push("Diverse skill set");
    }

    if (candidate.education.some((edu) => 2024 - edu.graduationYear <= 5)) {
      indicators.push("Recent education");
    }

    return {
      score: potentialScore,
      educationScore,
      learningScore,
      growthScore,
      indicators,
    };
  }

  /**
   * Generate detailed score breakdown
   *
   * @param requirements - Job requirements to match against
   * @param candidate - Candidate to evaluate
   * @returns ScoreBreakdown with comprehensive analysis
   */
  function generateScoreBreakdown(
    requirements: JobRequirement[],
    candidate: Candidate
  ): ScoreBreakdown {
    const skillMatchResult = calculateSkillMatchScore(requirements, candidate);
    const experienceResult = calculateExperienceScore(requirements, candidate);
    const potentialResult = calculatePotentialScore(candidate);

    const matchedSkills = skillMatchResult.directMatches;
    const missingSkills = skillMatchResult.missingSkills;
    const relatedSkills = skillMatchResult.relatedMatches;
    const experienceGaps = experienceResult.gaps;
    const potentialIndicators = potentialResult.indicators;
    const riskFactors: string[] = [];

    // Identify risk factors
    if (missingSkills.length > requirements.length * 0.5) {
      riskFactors.push("Significant skill gaps");
    }

    if (experienceGaps.some((gap) => gap.gap > 12)) {
      riskFactors.push("Large experience gaps in key areas");
    }

    if (candidate.experience.length < 2) {
      riskFactors.push("Limited work experience");
    }

    return {
      matchedSkills,
      missingSkills,
      relatedSkills,
      experienceGaps,
      potentialIndicators,
      riskFactors,
    };
  }

  // Helper methods
  function findCandidateSkill(
    skillId: string,
    candidate: Candidate
  ): string | undefined {
    return candidate.skills.find((skill) => skill === skillId);
  }

  function findRelevantExperience(
    skillId: string,
    candidate: Candidate
  ): Experience | undefined {
    return candidate.experience.find((exp) => exp.skillId === skillId);
  }

  function findTransferableSkills(
    skillId: string,
    candidate: Candidate
  ): Experience[] {
    const requiredSkill = skillNormalizer.getSkillById(skillId);
    if (!requiredSkill) return [];

    return candidate.experience.filter((exp) => {
      const candidateSkill = skillNormalizer.getSkillById(exp.skillId);
      if (!candidateSkill) return false;

      // Check if skills are related
      return skillNormalizer.areSkillsRelated(skillId, exp.skillId);
    });
  }

  function calculateRelatedSkillsBonus(
    requiredSkillId: string,
    candidate: Candidate
  ): number {
    const relatedSkills = findTransferableSkills(requiredSkillId, candidate);
    if (relatedSkills.length === 0) return 0;

    // Calculate average experience level of related skills
    const avgExperience =
      relatedSkills.reduce((sum, skill) => sum + skill.duration, 0) /
      relatedSkills.length;
    return Math.min(avgExperience / config.experienceNormalizationMonths, 1.0);
  }

  function calculateLevelAlignment(
    candidateLevel: number,
    requiredLevel: number
  ): number {
    const levelDiff = Math.abs(candidateLevel - requiredLevel);
    return Math.max(0, 1 - levelDiff / 5);
  }

  function calculateEducationScore(
    education: { degree: string; field: string; graduationYear: number }[]
  ): number {
    if (education.length === 0) return 0.3;

    const highestDegree = education.reduce((highest, edu) => {
      const degreeLevel = getDegreeLevel(edu.degree);
      return degreeLevel > highest ? degreeLevel : highest;
    }, 0);

    return Math.min(highestDegree / 3, 1.0); // Normalize to PhD level
  }

  function getDegreeLevel(degree: string): number {
    const degreeLower = degree.toLowerCase();

    for (const [key, level] of Object.entries(config.degreeLevels)) {
      if (degreeLower.includes(key)) {
        return level;
      }
    }

    return 0;
  }

  function calculateLearningIndicators(candidate: Candidate): number {
    let indicators = 0;
    let total = 0;

    // Check for diverse skill set
    if (candidate.skills.length > 5) {
      indicators += 1;
    }
    total += 1;

    // Check for recent education
    const recentEducation = candidate.education.some(
      (edu) => 2024 - edu.graduationYear <= 5
    );
    if (recentEducation) {
      indicators += 1;
    }
    total += 1;

    // Check for leadership experience
    if (candidate.experience.some((exp) => exp.hasLeadershipRole)) {
      indicators += 1;
    }
    total += 1;

    return total > 0 ? indicators / total : 0;
  }

  function calculateGrowthTrajectory(candidate: Candidate): number {
    if (candidate.experience.length < 2) return 0.5;

    // Sort experience by duration to see progression
    const sortedExperience = [...candidate.experience].sort(
      (a, b) => a.duration - b.duration
    );

    // Check if complexity increases over time
    let complexityIncrease = 0;
    for (let i = 1; i < sortedExperience.length; i++) {
      if (
        sortedExperience[i].complexityLevel >
        sortedExperience[i - 1].complexityLevel
      ) {
        complexityIncrease += 1;
      }
    }

    return complexityIncrease / (sortedExperience.length - 1);
  }

  function calculateLearnability(
    skillId: string,
    candidate: Candidate
  ): number {
    const skill = skillNormalizer.getSkillById(skillId);
    if (!skill) return 0.5;

    // Base learnability on skill difficulty
    const baseLearnability = 1 - skill.difficultyLevel / 5;

    // Adjust based on candidate's learning indicators
    const learningIndicators = calculateLearningIndicators(candidate);

    return Math.min(1, baseLearnability + learningIndicators * 0.3);
  }

  // Return the public API
  return {
    calculateMatchingScore,
    calculateSkillMatchScore,
    calculateExperienceScore,
    calculateTransferableSkillsScore,
    calculatePotentialScore,
    generateScoreBreakdown,
  };
}

// Export a singleton instance for backward compatibility
export const scoringEngine = createScoringEngine();
