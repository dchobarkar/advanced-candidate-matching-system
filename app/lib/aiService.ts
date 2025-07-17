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
   * Analyze skill context from resume text with enhanced AI analysis
   */
  public async analyzeSkillContext(
    skillName: string,
    contextText: string
  ): Promise<AIContext> {
    if (this.isMockMode) {
      return this.getMockSkillContext(skillName, contextText);
    }

    const prompt = `As an expert HR analyst specializing in technical skill assessment, analyze this experience with ${skillName}:

EXPERIENCE: "${contextText}"

Provide a detailed JSON analysis with:
- skillContext: A concise description of the technical experience and impact
- projectComplexity: A number 1-5 where 1=basic usage, 3=intermediate development, 5=architectural/leadership level
- leadershipIndicators: Array of specific leadership indicators found (e.g., "Team lead", "Mentored developers", "Architecture decisions")
- learningPotential: A number 0-1 indicating the candidate's learning potential based on complexity and growth indicators

Consider:
- Technical depth and breadth
- Project scale and impact
- Leadership and mentoring indicators
- Innovation and problem-solving complexity

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.2);

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

    const prompt = `As an expert in technical skill development and learning assessment, evaluate the learning potential for ${missingSkill} based on this candidate's background:

CANDIDATE BACKGROUND: "${candidateBackground}"
TARGET SKILL: ${missingSkill}

Provide a detailed JSON assessment with:
- learnability: A number 0-1 indicating how easily they can learn this skill (consider transferable skills, learning patterns, background relevance)
- timeToProficiency: Estimated months to reach professional proficiency (consider skill complexity, background strength, learning resources)
- recommendations: Array of 3-4 specific, actionable learning recommendations tailored to their background

Consider:
- Transferable skills from their background
- Learning patterns and adaptability indicators
- Skill complexity and prerequisites
- Available learning resources and pathways
- Industry demand and market relevance

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 500, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
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

    const prompt = `As an expert in technical experience validation, assess the credibility and complexity of this experience claim:

SKILL: ${skillName}
DURATION: ${duration} months
DESCRIPTION: "${experienceDescription}"

Provide a detailed JSON assessment with:
- isValid: Boolean indicating if the experience claim seems credible and realistic
- confidence: A number 0-1 indicating confidence in the assessment (consider technical details, metrics, consistency)
- complexityLevel: A number 1-5 indicating the technical complexity level (1=basic usage, 3=development, 5=architectural/advanced)

Consider:
- Technical specificity and depth
- Quantifiable metrics and impact
- Consistency with duration and skill level
- Industry standards and realistic expectations
- Red flags or credibility indicators

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 350, 0.1);

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

    const prompt = `As an expert in technical skill gap analysis, evaluate these skill gaps for a candidate:

REQUIRED SKILLS: ${requiredSkills.join(", ")}
CANDIDATE SKILLS: ${candidateSkills.join(", ")}
MISSING SKILLS: ${gaps.join(", ")}

Provide a strategic JSON analysis with:
- gaps: Array of missing skills prioritized by importance
- recommendations: Array of 3-4 specific, actionable recommendations to address gaps (consider learning paths, certifications, projects)
- priority: "high", "medium", or "low" based on gap severity and role requirements

Consider:
- Skill interdependencies and learning prerequisites
- Market demand and career impact
- Learning efficiency and time investment
- Alternative skills that could compensate
- Industry trends and emerging technologies

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 450, 0.2);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
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

    const prompt = `As an expert in skill transferability analysis, evaluate how well experience with ${sourceSkill} transfers to ${targetSkill}:

CANDIDATE EXPERIENCE: "${candidateExperience}"
SOURCE SKILL: ${sourceSkill}
TARGET SKILL: ${targetSkill}

Provide a detailed JSON analysis with:
- transferabilityScore: A number 0-1 indicating how well the skills transfer (consider conceptual overlap, technical similarities)
- learningPath: Array of 3-4 specific steps to leverage existing knowledge for the target skill
- timeToTransfer: Estimated months to achieve proficiency in target skill (consider existing foundation)
- confidence: A number 0-1 indicating confidence in this assessment

Consider:
- Conceptual similarities and differences
- Technical overlap and prerequisites
- Learning curve reduction from existing knowledge
- Industry practices and common transitions
- Specific technical concepts that transfer

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
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

    const prompt = `As an expert in cultural fit assessment, evaluate how well this candidate's experience aligns with the company culture:

CANDIDATE EXPERIENCE: "${candidateExperience}"
COMPANY CULTURE: "${companyCulture}"
TEAM SIZE: ${teamSize}

Provide a detailed JSON assessment with:
- culturalFitScore: A number 0-1 indicating alignment with company values and culture
- teamCollaborationScore: A number 0-1 indicating experience with team collaboration and communication
- adaptabilityScore: A number 0-1 indicating ability to adapt to different environments
- recommendations: Array of 2-3 specific recommendations for cultural integration

Consider:
- Leadership and collaboration indicators
- Communication and teamwork patterns
- Adaptability and growth mindset
- Cultural value alignment
- Remote work and distributed team experience

Respond only with valid JSON.`;

    const response = await this.makeOpenAICall(prompt, 400, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = JSON.parse(response.data);
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
}

// Export a singleton instance
export const aiService = new AIService();
