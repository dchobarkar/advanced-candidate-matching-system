import OpenAI from "openai";
import crypto from "crypto";

import { AIContext } from "../types/matching";
import { config } from "./config";

interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
  fallbackUsed?: boolean;
}

/**
 * Centralized AI service for intelligent candidate-job matching analysis.
 *
 * This service provides AI-powered analysis capabilities for the matching system,
 * including skill context analysis, learning potential assessment, experience
 * validation, and cultural fit evaluation.
 *
 * Key Features:
 * - OpenAI GPT-3.5-turbo integration with fallback to mock data
 * - Rate limiting (1-second delay between requests)
 * - Retry logic with exponential backoff
 * - In-memory caching for performance
 * - Comprehensive error handling
 * - Mock mode for development and testing
 *
 * AI Analysis Capabilities:
 * - Skill Context Analysis: Understand skill usage in experience descriptions
 * - Learning Potential Assessment: Evaluate ability to learn missing skills
 * - Experience Validation: Assess credibility and complexity of experience claims
 * - Skill Transferability Analysis: Determine how well skills transfer to others
 * - Cultural Fit Assessment: Evaluate alignment with company culture
 *
 * @example
 * ```typescript
 * const aiService = new AIService();
 * const analysis = await aiService.analyzeSkillContext("React", "Built React apps...");
 * ```
 */
export class AIService {
  private isMockMode: boolean = true;
  private openaiApiKey: string | undefined;
  private openai: OpenAI | null = null;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private readonly MAX_RETRIES = 3;
  private aiCache: Map<string, string> = new Map();

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
   * Generate a cache key based on the prompt and parameters
   */
  private getCacheKey(
    prompt: string,
    maxTokens: number,
    temperature: number
  ): string {
    const hash = crypto.createHash("sha256");
    hash.update(prompt + "|" + maxTokens + "|" + temperature);
    return hash.digest("hex");
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
   * Make OpenAI API call with retry logic, error handling, and caching
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

    const cacheKey = this.getCacheKey(prompt, maxTokens, temperature);
    if (this.aiCache.has(cacheKey)) {
      return {
        success: true,
        data: this.aiCache.get(cacheKey),
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

        // Cache the response
        this.aiCache.set(cacheKey, content);

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
   * Analyze skill context from resume text with enhanced AI analysis
   */
  public async analyzeSkillContext(
    skillName: string,
    contextText: string
  ): Promise<AIContext> {
    if (this.isMockMode) {
      return this.getMockSkillContext(skillName, contextText);
    }

    const prompt = `Analyze this technical experience with ${skillName}:

EXPERIENCE: "${contextText}"

Provide a JSON response with exactly these fields:
{
  "skillContext": "Brief technical description of the experience",
  "projectComplexity": number (1-5, where 1=basic, 3=intermediate, 5=architectural),
  "leadershipIndicators": ["array", "of", "leadership", "indicators"],
  "learningPotential": number (0-1, indicating learning ability)
}

Consider:
- Technical depth and project scale
- Leadership and mentoring indicators
- Innovation and problem-solving complexity
- Growth and learning indicators

Respond ONLY with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.2);

    if (response.success && response.data) {
      try {
        const parsed = this.validateAndParseJSON(response.data, "skillContext");
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
   * Enhanced learning potential assessment with detailed analysis
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

    const prompt = `Assess learning potential for ${missingSkill} based on this background:

BACKGROUND: "${candidateBackground}"
TARGET SKILL: ${missingSkill}

Provide a JSON response with exactly these fields:
{
  "learnability": number (0-1, how easily they can learn this skill),
  "timeToProficiency": number (estimated months to reach proficiency),
  "recommendations": ["array", "of", "3-4", "specific", "recommendations"]
}

Consider:
- Transferable skills from their background
- Learning patterns and adaptability
- Skill complexity and prerequisites
- Available learning resources

Respond ONLY with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 500, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = this.validateAndParseJSON(
          response.data,
          "learningAssessment"
        );
        return {
          learnability: Math.min(1, Math.max(0, parsed.learnability || 0.5)),
          timeToProficiency: Math.max(1, parsed.timeToProficiency || 6),
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.slice(0, 4)
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
   * Enhanced experience validation with detailed credibility assessment
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

DURATION: ${duration} months
DESCRIPTION: "${experienceDescription}"

Provide a JSON response with exactly these fields:
{
  "isValid": boolean (true if experience seems credible),
  "confidence": number (0-1, confidence in assessment),
  "complexityLevel": number (1-5, technical complexity level)
}

Consider:
- Technical specificity and depth
- Quantifiable metrics and impact
- Consistency with duration and skill level
- Industry standards and realistic expectations

Respond ONLY with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 350, 0.1);

    if (response.success && response.data) {
      try {
        const parsed = this.validateAndParseJSON(
          response.data,
          "experienceValidation"
        );
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
   * Enhanced gap analysis with strategic recommendations
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

REQUIRED: ${requiredSkills.join(", ")}
CANDIDATE HAS: ${candidateSkills.join(", ")}
MISSING: ${gaps.join(", ")}

Provide a JSON response with exactly these fields:
{
  "gaps": ["array", "of", "missing", "skills"],
  "recommendations": ["array", "of", "3-4", "specific", "recommendations"],
  "priority": "high" or "medium" or "low"
}

Consider:
- Skill interdependencies and learning prerequisites
- Market demand and career impact
- Learning efficiency and time investment

Respond ONLY with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 450, 0.2);

    if (response.success && response.data) {
      try {
        const parsed = this.validateAndParseJSON(response.data, "gapAnalysis");
        return {
          gaps: Array.isArray(parsed.gaps) ? parsed.gaps : gaps,
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.slice(0, 4)
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

  /**
   * NEW: Analyze skill transferability between related skills
   */
  public async analyzeSkillTransferability(
    sourceSkill: string,
    targetSkill: string,
    candidateExperience: string
  ): Promise<{
    transferabilityScore: number;
    learningPath: string[];
    timeToTransfer: number;
    confidence: number;
  }> {
    if (this.isMockMode) {
      return this.getMockSkillTransferability(
        sourceSkill,
        targetSkill,
        candidateExperience
      );
    }

    const prompt = `Analyze skill transferability from ${sourceSkill} to ${targetSkill}:

EXPERIENCE: "${candidateExperience}"
SOURCE SKILL: ${sourceSkill}
TARGET SKILL: ${targetSkill}

Provide a JSON response with exactly these fields:
{
  "transferabilityScore": number (0-1, how well skills transfer),
  "learningPath": ["array", "of", "3-4", "specific", "steps"],
  "timeToTransfer": number (estimated months to achieve proficiency),
  "confidence": number (0-1, confidence in assessment)
}

Consider:
- Conceptual similarities and differences
- Technical overlap and prerequisites
- Learning curve reduction from existing knowledge

Respond ONLY with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = this.validateAndParseJSON(
          response.data,
          "skillTransferability"
        );
        return {
          transferabilityScore: Math.min(
            1,
            Math.max(0, parsed.transferabilityScore || 0.5)
          ),
          learningPath: Array.isArray(parsed.learningPath)
            ? parsed.learningPath.slice(0, 4)
            : [
                `Leverage ${sourceSkill} concepts for ${targetSkill}`,
                "Focus on differences and new concepts",
                "Build projects combining both skills",
              ],
          timeToTransfer: Math.max(1, parsed.timeToTransfer || 3),
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.7)),
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return this.getMockSkillTransferability(
          sourceSkill,
          targetSkill,
          candidateExperience
        );
      }
    }

    // Fallback to mock implementation
    return this.getMockSkillTransferability(
      sourceSkill,
      targetSkill,
      candidateExperience
    );
  }

  /**
   * NEW: Assess cultural and team fit based on experience patterns
   */
  public async assessCulturalFit(
    candidateExperience: string,
    companyCulture: string,
    teamSize: string
  ): Promise<{
    culturalFitScore: number;
    teamCollaborationScore: number;
    adaptabilityScore: number;
    recommendations: string[];
  }> {
    if (this.isMockMode) {
      return this.getMockCulturalFit(
        candidateExperience,
        companyCulture,
        teamSize
      );
    }

    const prompt = `Assess cultural fit for this candidate:

EXPERIENCE: "${candidateExperience}"
COMPANY CULTURE: "${companyCulture}"
TEAM SIZE: ${teamSize}

Provide a JSON response with exactly these fields:
{
  "culturalFitScore": number (0-1, alignment with company values),
  "teamCollaborationScore": number (0-1, team collaboration experience),
  "adaptabilityScore": number (0-1, ability to adapt),
  "recommendations": ["array", "of", "2-3", "specific", "recommendations"]
}

Consider:
- Leadership and collaboration indicators
- Communication and teamwork patterns
- Adaptability and growth mindset

Respond ONLY with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = this.validateAndParseJSON(response.data, "culturalFit");
        return {
          culturalFitScore: Math.min(
            1,
            Math.max(0, parsed.culturalFitScore || 0.7)
          ),
          teamCollaborationScore: Math.min(
            1,
            Math.max(0, parsed.teamCollaborationScore || 0.7)
          ),
          adaptabilityScore: Math.min(
            1,
            Math.max(0, parsed.adaptabilityScore || 0.7)
          ),
          recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.slice(0, 3)
            : [
                "Focus on team collaboration skills",
                "Emphasize adaptability and learning",
                "Highlight cultural alignment",
              ],
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return this.getMockCulturalFit(
          candidateExperience,
          companyCulture,
          teamSize
        );
      }
    }

    // Fallback to mock implementation
    return this.getMockCulturalFit(
      candidateExperience,
      companyCulture,
      teamSize
    );
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

  /**
   * Mock implementation for skill transferability analysis
   */
  private getMockSkillTransferability(
    sourceSkill: string,
    targetSkill: string,
    candidateExperience: string
  ): {
    transferabilityScore: number;
    learningPath: string[];
    timeToTransfer: number;
    confidence: number;
  } {
    // Simple mock logic based on skill similarity and experience
    const skillSimilarity = this.calculateSkillSimilarity(
      sourceSkill,
      targetSkill
    );
    const hasRelevantExperience = candidateExperience
      .toLowerCase()
      .includes(sourceSkill.toLowerCase());
    const transferabilityScore = Math.min(
      0.9,
      skillSimilarity * 0.8 + (hasRelevantExperience ? 0.1 : 0)
    );

    return {
      transferabilityScore,
      learningPath: [
        `Leverage ${sourceSkill} concepts for ${targetSkill}`,
        "Focus on differences and new concepts",
        "Build projects combining both skills",
        "Practice with real-world applications",
      ],
      timeToTransfer: Math.max(2, Math.round(6 - skillSimilarity * 3)),
      confidence: 0.7,
    };
  }

  /**
   * Mock implementation for cultural fit assessment
   */
  private getMockCulturalFit(
    candidateExperience: string,
    companyCulture: string,
    teamSize: string
  ): {
    culturalFitScore: number;
    teamCollaborationScore: number;
    adaptabilityScore: number;
    recommendations: string[];
  } {
    // Simple mock logic based on experience keywords and company culture
    const hasLeadership =
      candidateExperience.toLowerCase().includes("lead") ||
      candidateExperience.toLowerCase().includes("manage");
    const hasTeamwork =
      candidateExperience.toLowerCase().includes("team") ||
      candidateExperience.toLowerCase().includes("collaborate");
    const hasAdaptability =
      candidateExperience.toLowerCase().includes("learn") ||
      candidateExperience.toLowerCase().includes("adapt");

    // Consider company culture and team size in assessment
    const isStartup =
      companyCulture.toLowerCase().includes("startup") ||
      companyCulture.toLowerCase().includes("fast-paced");
    const isLargeTeam =
      teamSize.toLowerCase().includes("large") || parseInt(teamSize) > 50;

    // Adjust scores based on company culture and team size
    const culturalFitScore = hasLeadership && hasTeamwork ? 0.8 : 0.6;
    const teamCollaborationScore = hasTeamwork ? 0.8 : 0.5;
    const adaptabilityScore = hasAdaptability ? 0.8 : 0.6;

    return {
      culturalFitScore: isStartup ? culturalFitScore * 0.9 : culturalFitScore,
      teamCollaborationScore: isLargeTeam
        ? teamCollaborationScore * 1.1
        : teamCollaborationScore,
      adaptabilityScore: isStartup
        ? adaptabilityScore * 1.1
        : adaptabilityScore,
      recommendations: [
        "Focus on team collaboration skills",
        "Emphasize adaptability and learning",
        "Highlight cultural alignment",
      ],
    };
  }

  /**
   * Calculate similarity between two skills for transferability analysis
   */
  private calculateSkillSimilarity(skill1: string, skill2: string): number {
    const skill1Lower = skill1.toLowerCase();
    const skill2Lower = skill2.toLowerCase();

    // Programming languages similarity
    if (
      (skill1Lower.includes("javascript") || skill1Lower.includes("js")) &&
      (skill2Lower.includes("typescript") || skill2Lower.includes("ts"))
    ) {
      return 0.9;
    }

    if (
      (skill1Lower.includes("react") || skill1Lower.includes("vue")) &&
      (skill2Lower.includes("react") || skill2Lower.includes("vue"))
    ) {
      return 0.8;
    }

    if (
      (skill1Lower.includes("python") || skill1Lower.includes("java")) &&
      (skill2Lower.includes("python") || skill2Lower.includes("java"))
    ) {
      return 0.7;
    }

    if (
      (skill1Lower.includes("docker") || skill1Lower.includes("kubernetes")) &&
      (skill2Lower.includes("docker") || skill2Lower.includes("kubernetes"))
    ) {
      return 0.8;
    }

    // Default similarity
    return 0.5;
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

  /**
   * Validate and parse JSON responses with error handling
   */
  private validateAndParseJSON(
    jsonString: string,
    context: string
  ): Record<string, unknown> {
    try {
      // Clean the response - remove any markdown formatting
      let cleanedString = jsonString.trim();
      if (cleanedString.startsWith("```json")) {
        cleanedString = cleanedString
          .replace(/```json\n?/, "")
          .replace(/```\n?/, "");
      }
      if (cleanedString.startsWith("```")) {
        cleanedString = cleanedString
          .replace(/```\n?/, "")
          .replace(/```\n?/, "");
      }

      const parsed = JSON.parse(cleanedString);

      // Log successful parsing for debugging
      console.log(`✅ Successfully parsed ${context} response`);

      return parsed;
    } catch (error) {
      console.error(`❌ Failed to parse ${context} response:`, error);
      console.error(`Raw response:`, jsonString);
      throw new Error(`Invalid JSON response for ${context}: ${error.message}`);
    }
  }
}

// Export a singleton instance
export const aiService = new AIService();
