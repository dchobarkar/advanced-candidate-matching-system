import {
  Candidate,
  Job,
  JobRequirement,
  MatchingScore,
  ScoreBreakdown,
  ExperienceGap,
  Experience,
} from "../types/matching";
import { skillNormalizer } from "./skillNormalizer";

/**
 * Multi-factor scoring engine for candidate-job matching.
 *
 * This engine implements a sophisticated scoring algorithm that goes beyond
 * simple skill matching to consider multiple factors that contribute to
 * job-candidate fit:
 *
 * Scoring Weights:
 * - Skill Match (40%): Direct and related skill matches
 * - Experience (25%): Depth and relevance of experience
 * - Transferable Skills (20%): Skills that can transfer to required skills
 * - Potential (15%): Learning ability, growth trajectory, education
 *
 * The scoring system provides explainable results with detailed breakdowns
 * showing matched skills, missing skills, experience gaps, and potential indicators.
 *
 * @example
 * ```typescript
 * const score = scoringEngine.calculateMatchingScore(candidate, job);
 * console.log(`Overall Score: ${score.overallScore}%`);
 * console.log(`Skill Match: ${score.skillMatchScore}%`);
 * ```
 */
export class ScoringEngine {
  private readonly SKILL_MATCH_WEIGHT = 0.4;
  private readonly EXPERIENCE_WEIGHT = 0.3;
  private readonly TRANSFERABLE_SKILLS_WEIGHT = 0.2;
  private readonly POTENTIAL_WEIGHT = 0.1;

  /**
   * Calculate the overall matching score between a candidate and job.
   *
   * This is the main scoring function that combines multiple factors:
   * 1. Skill match score (40% weight) - direct and related skill matches
   * 2. Experience score (25% weight) - depth and relevance of experience
   * 3. Transferable skills score (20% weight) - skills that can transfer
   * 4. Potential score (15% weight) - learning ability and growth trajectory
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
  public calculateMatchingScore(candidate: Candidate, job: Job): MatchingScore {
    const skillMatchScore = this.calculateSkillMatchScore(
      job.requirements,
      candidate
    );
    const experienceScore = this.calculateExperienceScore(
      job.requirements,
      candidate
    );
    const transferableSkillsScore = this.calculateTransferableSkillsScore(
      job.requirements,
      candidate
    );
    const potentialScore = this.calculatePotentialScore(candidate);

    const overallScore =
      skillMatchScore * this.SKILL_MATCH_WEIGHT +
      experienceScore * this.EXPERIENCE_WEIGHT +
      transferableSkillsScore * this.TRANSFERABLE_SKILLS_WEIGHT +
      potentialScore * this.POTENTIAL_WEIGHT;

    const breakdown = this.generateScoreBreakdown(job.requirements, candidate);

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      skillMatchScore: Math.round(skillMatchScore * 100) / 100,
      experienceScore: Math.round(experienceScore * 100) / 100,
      transferableSkillsScore: Math.round(transferableSkillsScore * 100) / 100,
      potentialScore: Math.round(potentialScore * 100) / 100,
      breakdown,
    };
  }

  /**
   * Calculate skill match score (40% weight)
   */
  private calculateSkillMatchScore(
    requirements: JobRequirement[],
    candidate: Candidate
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const requirement of requirements) {
      const weight = requirement.isRequired ? 2 : 1;
      totalWeight += weight;

      const candidateSkill = this.findCandidateSkill(
        requirement.skillId,
        candidate
      );

      if (candidateSkill) {
        // Direct match
        totalScore += weight * 1.0;

        // Related skills bonus
        const relatedBonus = this.calculateRelatedSkillsBonus(
          requirement.skillId,
          candidate
        );
        totalScore += weight * relatedBonus * 0.3;
      } else {
        // Check for related skills
        const relatedBonus = this.calculateRelatedSkillsBonus(
          requirement.skillId,
          candidate
        );
        totalScore += weight * relatedBonus * 0.5;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate experience score (30% weight)
   */
  private calculateExperienceScore(
    requirements: JobRequirement[],
    candidate: Candidate
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const requirement of requirements) {
      const weight = requirement.isRequired ? 2 : 1;
      totalWeight += weight;

      const relevantExperience = this.findRelevantExperience(
        requirement.skillId,
        candidate
      );

      if (relevantExperience) {
        // Duration factor (0-1)
        const durationScore = Math.min(
          relevantExperience.duration / requirement.minDuration,
          1.0
        );

        // Complexity factor (0-1)
        const complexityScore = relevantExperience.complexityLevel / 5.0;

        // Leadership factor
        const leadershipScore = relevantExperience.hasLeadershipRole
          ? 1.0
          : 0.5;

        // Level alignment factor
        const levelScore = this.calculateLevelAlignment(
          relevantExperience.complexityLevel,
          requirement.requiredLevel
        );

        const experienceScore =
          (durationScore + complexityScore + leadershipScore + levelScore) / 4;
        totalScore += weight * experienceScore;
      } else {
        // No relevant experience
        totalScore += weight * 0.1;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate transferable skills score (20% weight)
   */
  private calculateTransferableSkillsScore(
    requirements: JobRequirement[],
    candidate: Candidate
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const requirement of requirements) {
      const weight = requirement.isRequired ? 2 : 1;
      totalWeight += weight;

      // Find transferable skills
      const transferableSkills = this.findTransferableSkills(
        requirement.skillId,
        candidate
      );

      if (transferableSkills.length > 0) {
        // Calculate average transferability score
        const transferabilityScores = transferableSkills.map((skill) => {
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
          const experienceFactor = Math.min(skill.duration / 24, 1.0); // Normalize to 2 years

          return baseTransferability * experienceFactor;
        });

        const avgTransferability =
          transferabilityScores.reduce((sum, score) => sum + score, 0) /
          transferabilityScores.length;
        totalScore += weight * avgTransferability;
      } else {
        totalScore += weight * 0;
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate potential score (10% weight)
   */
  private calculatePotentialScore(candidate: Candidate): number {
    let potentialScore = 0;

    // Education factor
    const educationScore = this.calculateEducationScore(candidate.education);
    potentialScore += educationScore * 0.3;

    // Learning indicators
    const learningScore = this.calculateLearningIndicators(candidate);
    potentialScore += learningScore * 0.4;

    // Growth trajectory
    const growthScore = this.calculateGrowthTrajectory(candidate);
    potentialScore += growthScore * 0.3;

    return potentialScore;
  }

  /**
   * Generate detailed score breakdown
   */
  private generateScoreBreakdown(
    requirements: JobRequirement[],
    candidate: Candidate
  ): ScoreBreakdown {
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const relatedSkills: string[] = [];
    const experienceGaps: ExperienceGap[] = [];
    const potentialIndicators: string[] = [];
    const riskFactors: string[] = [];

    // Analyze each requirement
    for (const requirement of requirements) {
      const candidateSkill = this.findCandidateSkill(
        requirement.skillId,
        candidate
      );
      const relevantExperience = this.findRelevantExperience(
        requirement.skillId,
        candidate
      );

      if (candidateSkill) {
        matchedSkills.push(requirement.skillId);
      } else {
        missingSkills.push(requirement.skillId);
      }

      // Find related skills
      const related = this.findTransferableSkills(
        requirement.skillId,
        candidate
      );
      related.forEach((skill) => {
        if (!relatedSkills.includes(skill.skillId)) {
          relatedSkills.push(skill.skillId);
        }
      });

      // Calculate experience gaps
      if (relevantExperience) {
        const gap = Math.max(
          0,
          requirement.minDuration - relevantExperience.duration
        );
        if (gap > 0) {
          experienceGaps.push({
            skillId: requirement.skillId,
            requiredDuration: requirement.minDuration,
            candidateDuration: relevantExperience.duration,
            gap,
            learnability: this.calculateLearnability(
              requirement.skillId,
              candidate
            ),
          });
        }
      } else {
        experienceGaps.push({
          skillId: requirement.skillId,
          requiredDuration: requirement.minDuration,
          candidateDuration: 0,
          gap: requirement.minDuration,
          learnability: this.calculateLearnability(
            requirement.skillId,
            candidate
          ),
        });
      }
    }

    // Analyze potential indicators
    if (
      candidate.education.some((edu) =>
        edu.field.toLowerCase().includes("computer")
      )
    ) {
      potentialIndicators.push(
        "Strong educational background in computer science"
      );
    }

    if (candidate.experience.some((exp) => exp.hasLeadershipRole)) {
      potentialIndicators.push("Demonstrated leadership experience");
    }

    // Identify risk factors
    if (missingSkills.length > requirements.length * 0.5) {
      riskFactors.push("Significant skill gaps");
    }

    if (experienceGaps.some((gap) => gap.gap > 12)) {
      riskFactors.push("Large experience gaps in key areas");
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
  private findCandidateSkill(
    skillId: string,
    candidate: Candidate
  ): string | undefined {
    return candidate.skills.find((skill) => skill === skillId);
  }

  private findRelevantExperience(
    skillId: string,
    candidate: Candidate
  ): Experience | undefined {
    return candidate.experience.find((exp) => exp.skillId === skillId);
  }

  private findTransferableSkills(
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

  private calculateRelatedSkillsBonus(
    requiredSkillId: string,
    candidate: Candidate
  ): number {
    const relatedSkills = this.findTransferableSkills(
      requiredSkillId,
      candidate
    );
    if (relatedSkills.length === 0) return 0;

    // Calculate average experience level of related skills
    const avgExperience =
      relatedSkills.reduce((sum, skill) => sum + skill.duration, 0) /
      relatedSkills.length;
    return Math.min(avgExperience / 24, 1.0); // Normalize to 2 years
  }

  private calculateLevelAlignment(
    candidateLevel: number,
    requiredLevel: number
  ): number {
    const levelDiff = Math.abs(candidateLevel - requiredLevel);
    return Math.max(0, 1 - levelDiff / 5);
  }

  private calculateEducationScore(
    education: { degree: string; field: string; graduationYear: number }[]
  ): number {
    if (education.length === 0) return 0.3;

    const highestDegree = education.reduce((highest, edu) => {
      const degreeLevel = this.getDegreeLevel(edu.degree);
      return degreeLevel > highest ? degreeLevel : highest;
    }, 0);

    return Math.min(highestDegree / 3, 1.0); // Normalize to PhD level
  }

  private getDegreeLevel(degree: string): number {
    const degreeLower = degree.toLowerCase();
    if (degreeLower.includes("phd") || degreeLower.includes("doctorate"))
      return 3;
    if (degreeLower.includes("master")) return 2;
    if (degreeLower.includes("bachelor")) return 1;
    return 0;
  }

  private calculateLearningIndicators(candidate: Candidate): number {
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

  private calculateGrowthTrajectory(candidate: Candidate): number {
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

  private calculateLearnability(skillId: string, candidate: Candidate): number {
    const skill = skillNormalizer.getSkillById(skillId);
    if (!skill) return 0.5;

    // Base learnability on skill difficulty
    const baseLearnability = 1 - skill.difficultyLevel / 5;

    // Adjust based on candidate's learning indicators
    const learningIndicators = this.calculateLearningIndicators(candidate);

    return Math.min(1, baseLearnability + learningIndicators * 0.3);
  }
}

// Export a singleton instance
export const scoringEngine = new ScoringEngine();
