import OpenAI from "openai";

import { AIContext } from "../types/matching";
import { config } from "./config";

interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
  fallbackUsed?: boolean;
}

export class AIService {
  private isMockMode: boolean = true;
  private openaiApiKey: string | undefined;
  private openai: OpenAI | null = null;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private readonly MAX_RETRIES = 3;

  constructor() {
    // Use configuration from config utility
    this.openaiApiKey = config.openaiApiKey;
    this.isMockMode = config.isAIMockMode;

    if (!this.isMockMode && this.openaiApiKey) {
      try {
        this.openai = new OpenAI({
          apiKey: this.openaiApiKey,
        });
        console.log("AI Service initialized with OpenAI integration");
      } catch (error) {
        console.error("Failed to initialize OpenAI:", error);
        this.isMockMode = true;
      }
    } else {
      console.log(
        "AI Service running in mock mode. Set OPENAI_API_KEY to enable real AI integration."
      );
    }
  }

  /**
   * Rate limiting utility
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make OpenAI API call with retry logic and error handling
   */
  private async makeOpenAICall(
    prompt: string,
    maxTokens: number = 500,
    temperature: number = 0.7
  ): Promise<AIResponse> {
    if (!this.openai) {
      return {
        success: false,
        error: "OpenAI client not initialized",
        fallbackUsed: true,
      };
    }

    await this.enforceRateLimit();

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert HR analyst specializing in technical skill assessment and candidate evaluation. Provide concise, accurate analysis in JSON format when requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: temperature,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from OpenAI");
        }

        return {
          success: true,
          data: content,
        };
      } catch (error) {
        console.error(`OpenAI API call attempt ${attempt} failed:`, error);

        if (attempt === this.MAX_RETRIES) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            fallbackUsed: true,
          };
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    return {
      success: false,
      error: "All retry attempts failed",
      fallbackUsed: true,
    };
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

    const prompt = `Analyze the following experience with ${skillName} and provide a JSON response with:
- skillContext: A brief description of the experience
- projectComplexity: A number 1-5 indicating complexity level
- leadershipIndicators: Array of leadership indicators found
- learningPotential: A number 0-1 indicating learning potential

Experience: "${contextText}"

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 300, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
        return {
          skillContext: parsed.skillContext || `Experience with ${skillName}`,
          projectComplexity: Math.min(
            5,
            Math.max(1, parsed.projectComplexity || 3)
          ),
          leadershipIndicators: Array.isArray(parsed.leadershipIndicators)
            ? parsed.leadershipIndicators
            : [],
          learningPotential: Math.min(
            1,
            Math.max(0, parsed.learningPotential || 0.7)
          ),
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return this.getMockSkillContext(skillName, contextText);
      }
    }

    // Fallback to mock implementation
    return this.getMockSkillContext(skillName, contextText);
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

    const prompt = `Assess the learning potential for ${missingSkill} based on this candidate background: "${candidateBackground}"

Provide a JSON response with:
- learnability: A number 0-1 indicating how easily they can learn this skill
- timeToProficiency: Estimated months to reach proficiency
- recommendations: Array of 3 specific learning recommendations

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.4);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
        return {
          learnability: Math.min(1, Math.max(0, parsed.learnability || 0.5)),
          timeToProficiency: Math.max(1, parsed.timeToProficiency || 6),
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.slice(0, 3)
            : [
                `Start with ${missingSkill} fundamentals`,
                "Consider online courses or bootcamps",
                "Build small projects to gain hands-on experience",
              ],
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return this.getMockLearningAssessment(
          missingSkill,
          candidateBackground
        );
      }
    }

    // Fallback to mock implementation
    return this.getMockLearningAssessment(missingSkill, candidateBackground);
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

    const prompt = `Validate this experience claim for ${skillName}:
Duration: ${duration} months
Description: "${experienceDescription}"

Provide a JSON response with:
- isValid: Boolean indicating if the experience seems valid
- confidence: A number 0-1 indicating confidence in the assessment
- complexityLevel: A number 1-5 indicating the complexity level

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 300, 0.2);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
        return {
          isValid: Boolean(parsed.isValid),
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
          complexityLevel: Math.min(
            5,
            Math.max(1, parsed.complexityLevel || 3)
          ),
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return this.getMockExperienceValidation(
          skillName,
          experienceDescription,
          duration
        );
      }
    }

    // Fallback to mock implementation
    return this.getMockExperienceValidation(
      skillName,
      experienceDescription,
      duration
    );
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

    const gaps = requiredSkills.filter(
      (skill) => !candidateSkills.includes(skill)
    );

    if (gaps.length === 0) {
      return {
        gaps: [],
        recommendations: ["All required skills are present"],
        priority: "low",
      };
    }

    const prompt = `Analyze these skill gaps for a candidate:
Required skills: ${requiredSkills.join(", ")}
Candidate skills: ${candidateSkills.join(", ")}
Missing skills: ${gaps.join(", ")}

Provide a JSON response with:
- gaps: Array of missing skills
- recommendations: Array of 3 specific recommendations to address gaps
- priority: "high", "medium", or "low" based on gap severity

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
        return {
          gaps: Array.isArray(parsed.gaps) ? parsed.gaps : gaps,
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.slice(0, 3)
            : gaps.map((skill) => `Focus on gaining experience with ${skill}`),
          priority: ["high", "medium", "low"].includes(parsed.priority)
            ? parsed.priority
            : "medium",
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return this.getMockGapAnalysis(requiredSkills, candidateSkills);
      }
    }

    // Fallback to mock implementation
    return this.getMockGapAnalysis(requiredSkills, candidateSkills);
  }

  // Mock implementations for fallback
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

  /**
   * Get service status
   */
  public getStatus(): {
    isMockMode: boolean;
    hasOpenAIKey: boolean;
    requestCount: number;
  } {
    return {
      isMockMode: this.isMockMode,
      hasOpenAIKey: !!this.openaiApiKey,
      requestCount: this.requestCount,
    };
  }
}

// Export a singleton instance
export const aiService = new AIService();
