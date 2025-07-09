import { AIContext } from "../types/matching";
import { config } from "./config";

export class AIService {
  private isMockMode: boolean = true;
  private openaiApiKey: string | undefined;

  constructor() {
    // Use configuration from config utility
    this.openaiApiKey = config.openaiApiKey;
    this.isMockMode = config.isAIMockMode;

    if (this.isMockMode) {
      console.log(
        "AI Service running in mock mode. Set OPENAI_API_KEY to enable real AI integration."
      );
    }
  }

  /**
   * Analyze skill context from resume text
   */
  public async analyzeSkillContext(
    skillName: string,
    contextText: string
  ): Promise<AIContext> {
    if (this.isMockMode) {
      return this.getMockSkillContext(skillName, contextText);
    }

    // TODO: Implement real AI integration
    throw new Error("AI integration not implemented yet");
  }

  /**
   * Assess learning potential for missing skills
   */
  public async assessLearningPotential(
    missingSkill: string,
    candidateBackground: string
  ): Promise<{
    learnability: number;
    timeToProficiency: number;
    recommendations: string[];
  }> {
    if (this.isMockMode) {
      return this.getMockLearningAssessment(missingSkill, candidateBackground);
    }

    // TODO: Implement real AI integration
    throw new Error("AI integration not implemented yet");
  }

  /**
   * Validate experience claims
   */
  public async validateExperience(
    skillName: string,
    experienceDescription: string,
    duration: number
  ): Promise<{
    isValid: boolean;
    confidence: number;
    complexityLevel: number;
  }> {
    if (this.isMockMode) {
      return this.getMockExperienceValidation(
        skillName,
        experienceDescription,
        duration
      );
    }

    // TODO: Implement real AI integration
    throw new Error("AI integration not implemented yet");
  }

  /**
   * Generate gap analysis
   */
  public async generateGapAnalysis(
    requiredSkills: string[],
    candidateSkills: string[]
  ): Promise<{
    gaps: string[];
    recommendations: string[];
    priority: "high" | "medium" | "low";
  }> {
    if (this.isMockMode) {
      return this.getMockGapAnalysis(requiredSkills, candidateSkills);
    }

    // TODO: Implement real AI integration
    throw new Error("AI integration not implemented yet");
  }

  // Mock implementations for demo
  private getMockSkillContext(
    skillName: string,
    contextText: string
  ): AIContext {
    const complexityKeywords = [
      "architected",
      "led",
      "managed",
      "designed",
      "implemented",
    ];
    const leadershipKeywords = [
      "team",
      "lead",
      "mentor",
      "supervise",
      "coordinate",
    ];

    const hasComplexity = complexityKeywords.some((keyword) =>
      contextText.toLowerCase().includes(keyword)
    );
    const hasLeadership = leadershipKeywords.some((keyword) =>
      contextText.toLowerCase().includes(keyword)
    );

    return {
      skillContext: `Experience with ${skillName} in ${contextText.substring(
        0,
        100
      )}...`,
      projectComplexity: hasComplexity ? 4 : 2,
      leadershipIndicators: hasLeadership
        ? ["Team leadership", "Project coordination"]
        : [],
      learningPotential: 0.7,
    };
  }

  private getMockLearningAssessment(
    missingSkill: string,
    candidateBackground: string
  ): {
    learnability: number;
    timeToProficiency: number;
    recommendations: string[];
  } {
    const skillDifficulty = this.getSkillDifficulty(missingSkill);
    const backgroundStrength =
      this.assessBackgroundStrength(candidateBackground);

    const learnability = Math.max(
      0.3,
      1 - skillDifficulty * 0.2 + backgroundStrength * 0.3
    );
    const timeToProficiency = Math.max(
      3,
      skillDifficulty * 2 - backgroundStrength * 2
    );

    return {
      learnability,
      timeToProficiency,
      recommendations: [
        `Start with ${missingSkill} fundamentals`,
        "Consider online courses or bootcamps",
        "Build small projects to gain hands-on experience",
      ],
    };
  }

  private getMockExperienceValidation(
    skillName: string,
    experienceDescription: string,
    duration: number
  ): { isValid: boolean; confidence: number; complexityLevel: number } {
    const hasTechnicalDetails =
      experienceDescription.includes("API") ||
      experienceDescription.includes("database") ||
      experienceDescription.includes("framework");

    const hasMetrics =
      experienceDescription.includes("users") ||
      experienceDescription.includes("performance") ||
      experienceDescription.includes("scale");

    const complexityLevel = hasTechnicalDetails ? 4 : 2;
    const confidence = hasMetrics ? 0.9 : 0.7;
    const isValid = duration > 0 && experienceDescription.length > 20;

    return {
      isValid,
      confidence,
      complexityLevel,
    };
  }

  private getMockGapAnalysis(
    requiredSkills: string[],
    candidateSkills: string[]
  ): {
    gaps: string[];
    recommendations: string[];
    priority: "high" | "medium" | "low";
  } {
    const gaps = requiredSkills.filter(
      (skill) => !candidateSkills.includes(skill)
    );

    let priority: "high" | "medium" | "low" = "low";
    if (gaps.length > requiredSkills.length * 0.5) {
      priority = "high";
    } else if (gaps.length > requiredSkills.length * 0.2) {
      priority = "medium";
    }

    const recommendations = gaps.map(
      (skill) => `Focus on gaining experience with ${skill}`
    );

    return { gaps, recommendations, priority };
  }

  private getSkillDifficulty(skillName: string): number {
    const difficultyMap: { [key: string]: number } = {
      javascript: 2,
      react: 3,
      nodejs: 3,
      python: 2,
      java: 4,
      docker: 3,
      kubernetes: 4,
      aws: 4,
      tensorflow: 4,
      postgresql: 3,
    };

    return difficultyMap[skillName.toLowerCase()] || 3;
  }

  private assessBackgroundStrength(background: string): number {
    const technicalKeywords = [
      "developer",
      "engineer",
      "programming",
      "coding",
      "software",
    ];
    const hasTechnicalBackground = technicalKeywords.some((keyword) =>
      background.toLowerCase().includes(keyword)
    );

    return hasTechnicalBackground ? 0.8 : 0.4;
  }

  /**
   * Enable/disable mock mode for testing
   */
  public setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }
}

// Export a singleton instance
export const aiService = new AIService();
