import OpenAI from "openai";
import crypto from "crypto";

import { AIContext } from "../types/matching";
import { config } from "./config";

// Type definitions for better type safety
interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
  fallbackUsed?: boolean;
}

interface LearningAssessment {
  learnability: number;
  timeToProficiency: number;
  recommendations: string[];
}

interface ExperienceValidation {
  isValid: boolean;
  confidence: number;
  complexityLevel: number;
}

interface GapAnalysis {
  gaps: string[];
  recommendations: string[];
  priority: "high" | "medium" | "low";
}

interface SkillTransferability {
  transferabilityScore: number;
  learningPath: string[];
  timeToTransfer: number;
  confidence: number;
}

interface CulturalFitAssessment {
  culturalFitScore: number;
  teamCollaborationScore: number;
  adaptabilityScore: number;
  recommendations: string[];
}

// Configuration interface
interface AIServiceConfig {
  openaiApiKey?: string;
  isMockMode: boolean;
  rateLimitDelay: number;
  maxRetries: number;
}

// State management
interface AIServiceState {
  isMockMode: boolean;
  openai: OpenAI | null;
  requestCount: number;
  lastRequestTime: number;
  aiCache: Map<string, string>;
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
 * const aiService = createAIService();
 * const analysis = await aiService.analyzeSkillContext("React", "Built React apps...");
 * ```
 */

// Create AI service with configuration
export function createAIService(): ReturnType<typeof createAIServiceInstance> {
  return createAIServiceInstance();
}

function createAIServiceInstance() {
  // Configuration
  const serviceConfig: AIServiceConfig = {
    openaiApiKey: config.openaiApiKey,
    isMockMode: config.isAIMockMode,
    rateLimitDelay: 1000, // 1 second between requests
    maxRetries: 3,
  };

  // State
  const state: AIServiceState = {
    isMockMode: serviceConfig.isMockMode,
    openai: null,
    requestCount: 0,
    lastRequestTime: 0,
    aiCache: new Map(),
  };

  // Initialize OpenAI if available
  if (!state.isMockMode && serviceConfig.openaiApiKey) {
    try {
      state.openai = new OpenAI({
        apiKey: serviceConfig.openaiApiKey,
      });
      console.log("AI Service initialized with OpenAI integration");
    } catch (error) {
      console.error("Failed to initialize OpenAI:", error);
      state.isMockMode = true;
    }
  } else {
    console.log(
      "AI Service running in mock mode. Set OPENAI_API_KEY to enable real AI integration."
    );
  }

  // Utility functions
  function getCacheKey(
    prompt: string,
    maxTokens: number,
    temperature: number
  ): string {
    const hash = crypto.createHash("sha256");
    hash.update(prompt + "|" + maxTokens + "|" + temperature);
    return hash.digest("hex");
  }

  async function enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - state.lastRequestTime;

    if (timeSinceLastRequest < serviceConfig.rateLimitDelay) {
      const delay = serviceConfig.rateLimitDelay - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    state.lastRequestTime = Date.now();
  }

  async function makeOpenAICall(
    prompt: string,
    maxTokens: number = 500,
    temperature: number = 0.7
  ): Promise<AIResponse> {
    if (!state.openai) {
      return {
        success: false,
        error: "OpenAI client not initialized",
        fallbackUsed: true,
      };
    }

    const cacheKey = getCacheKey(prompt, maxTokens, temperature);
    if (state.aiCache.has(cacheKey)) {
      return {
        success: true,
        data: state.aiCache.get(cacheKey),
      };
    }

    await enforceRateLimit();

    for (let attempt = 1; attempt <= serviceConfig.maxRetries; attempt++) {
      try {
        const response = await state.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: temperature,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          state.aiCache.set(cacheKey, content);
          state.requestCount++;
          return {
            success: true,
            data: content,
          };
        } else {
          throw new Error("No content in OpenAI response");
        }
      } catch (error) {
        console.error(`OpenAI API call attempt ${attempt} failed:`, error);

        if (attempt === serviceConfig.maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
            fallbackUsed: true,
          };
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      error: "All retry attempts failed",
      fallbackUsed: true,
    };
  }

  function validateAndParseJSON(
    jsonString: string,
    context: string
  ): Record<string, unknown> {
    try {
      // Clean markdown formatting if present
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

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Parsed result is not an object");
      }

      return parsed;
    } catch (error) {
      console.error(`JSON parsing failed for ${context}:`, error);
      console.error("Raw response:", jsonString);
      throw new Error(
        `Invalid JSON response for ${context}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Mock implementations
  function getMockSkillContext(
    skillName: string,
    contextText: string
  ): AIContext {
    const skillContext = contextText
      .toLowerCase()
      .includes(skillName.toLowerCase())
      ? `Strong experience with ${skillName} demonstrated in project work`
      : `Some exposure to ${skillName} concepts`;

    return {
      skillContext,
      projectComplexity: 3,
      leadershipIndicators: ["Team collaboration", "Project coordination"],
      learningPotential: 0.7,
    };
  }

  function getMockLearningAssessment(
    missingSkill: string,
    candidateBackground: string
  ): LearningAssessment {
    const backgroundStrength = assessBackgroundStrength(candidateBackground);
    const skillDifficulty = getSkillDifficulty(missingSkill);

    return {
      learnability: Math.min(1, backgroundStrength * (1 - skillDifficulty / 5)),
      timeToProficiency: Math.max(2, skillDifficulty * 2),
      recommendations: [
        `Start with ${missingSkill} fundamentals`,
        "Consider online courses or bootcamps",
        "Build small projects to gain hands-on experience",
        "Focus on practical applications",
      ],
    };
  }

  function getMockExperienceValidation(
    skillName: string,
    experienceDescription: string,
    duration: number
  ): ExperienceValidation {
    const descriptionQuality = experienceDescription.length > 50 ? 0.9 : 0.6;
    const durationRelevance = Math.min(1, duration / 12);

    return {
      isValid: descriptionQuality > 0.7 && durationRelevance > 0.3,
      confidence: Math.min(1, (descriptionQuality + durationRelevance) / 2),
      complexityLevel: Math.min(5, Math.max(1, Math.floor(duration / 6))),
    };
  }

  function getMockGapAnalysis(
    requiredSkills: string[],
    candidateSkills: string[]
  ): GapAnalysis {
    const gaps = requiredSkills.filter(
      (skill) => !candidateSkills.includes(skill)
    );
    const gapCount = gaps.length;

    return {
      gaps,
      recommendations: [
        "Focus on the most critical missing skills first",
        "Consider certification programs for key technologies",
        "Build portfolio projects to demonstrate skills",
        "Seek mentorship or pair programming opportunities",
      ],
      priority: gapCount > 3 ? "high" : gapCount > 1 ? "medium" : "low",
    };
  }

  function getMockSkillTransferability(
    sourceSkill: string,
    targetSkill: string,
    candidateExperience: string
  ): SkillTransferability {
    const similarity = calculateSkillSimilarity(sourceSkill, targetSkill);
    const experienceStrength = assessBackgroundStrength(candidateExperience);

    return {
      transferabilityScore: Math.min(1, similarity * experienceStrength),
      learningPath: [
        `Leverage ${sourceSkill} concepts`,
        "Study fundamental differences",
        "Practice with small projects",
        "Build confidence gradually",
      ],
      timeToTransfer: Math.max(1, Math.floor((1 - similarity) * 6)),
      confidence: Math.min(1, similarity * 0.8),
    };
  }

  function getMockCulturalFit(
    candidateExperience: string,
    companyCulture: string,
    teamSize: string
  ): CulturalFitAssessment {
    const experienceLength = candidateExperience.length;
    const adaptabilityScore = experienceLength > 100 ? 0.8 : 0.6;

    return {
      culturalFitScore: 0.75,
      teamCollaborationScore: 0.8,
      adaptabilityScore,
      recommendations: [
        "Highlight collaborative project experience",
        "Emphasize adaptability and learning ability",
        "Showcase cross-functional work experience",
        "Demonstrate communication skills",
      ],
    };
  }

  // Helper functions
  function calculateSkillSimilarity(skill1: string, skill2: string): number {
    const s1 = skill1.toLowerCase();
    const s2 = skill2.toLowerCase();

    // Exact match
    if (s1 === s2) return 1.0;

    // Contains relationship
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Category similarity (simplified)
    const frontendSkills = [
      "react",
      "vue",
      "angular",
      "javascript",
      "typescript",
    ];
    const backendSkills = ["nodejs", "python", "java", "express", "django"];
    const databaseSkills = ["mongodb", "postgresql", "mysql", "sql"];

    const s1Category = frontendSkills.includes(s1)
      ? "frontend"
      : backendSkills.includes(s1)
      ? "backend"
      : databaseSkills.includes(s1)
      ? "database"
      : "other";

    const s2Category = frontendSkills.includes(s2)
      ? "frontend"
      : backendSkills.includes(s2)
      ? "backend"
      : databaseSkills.includes(s2)
      ? "database"
      : "other";

    if (s1Category === s2Category && s1Category !== "other") return 0.6;

    return 0.2; // Default low similarity
  }

  function getSkillDifficulty(skillName: string): number {
    const skill = skillName.toLowerCase();

    // Simplified difficulty mapping
    const difficultyMap: Record<string, number> = {
      javascript: 2,
      html: 1,
      css: 1,
      react: 3,
      vue: 3,
      angular: 4,
      typescript: 3,
      nodejs: 3,
      python: 2,
      java: 4,
      mongodb: 3,
      postgresql: 3,
      aws: 4,
      docker: 3,
      kubernetes: 4,
      tensorflow: 4,
      pytorch: 4,
    };

    return difficultyMap[skill] || 3; // Default medium difficulty
  }

  function assessBackgroundStrength(background: string): number {
    const length = background.length;
    const hasTechnicalTerms =
      /(programming|development|coding|software|technical)/i.test(background);
    const hasExperience = /(years?|experience|worked|developed|built)/i.test(
      background
    );

    let strength = 0.5; // Base strength

    if (length > 200) strength += 0.2;
    if (hasTechnicalTerms) strength += 0.2;
    if (hasExperience) strength += 0.1;

    return Math.min(1, strength);
  }

  // Public API methods
  async function analyzeSkillContext(
    skillName: string,
    contextText: string
  ): Promise<AIContext> {
    if (state.isMockMode) {
      return getMockSkillContext(skillName, contextText);
    }

    const prompt = `Analyze the skill usage of ${skillName} in this context:

CONTEXT: "${contextText}"
SKILL: ${skillName}

Provide a JSON response with exactly these fields:
{
  "proficiencyLevel": "beginner|intermediate|advanced",
  "contextRelevance": number (0-1, how relevant the context is to the skill),
  "skillUsage": "string (specific usage pattern)",
  "confidence": number (0-1, confidence in the analysis),
  "skillContext": "string (detailed context analysis)",
  "projectComplexity": number (1-5, complexity level),
  "learningPotential": number (0-1, potential for growth)
}

Consider:
- How the skill is used in the context
- The depth and breadth of usage
- Project complexity and scale
- Learning indicators and growth potential

Respond ONLY with valid JSON.`;

    const response = await makeOpenAICall(prompt, 500, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = validateAndParseJSON(response.data, "skillContext");

        return {
          skillContext:
            (parsed.skillContext as string) || `Experience with ${skillName}`,
          projectComplexity: Math.max(
            1,
            Math.min(5, (parsed.projectComplexity as number) || 3)
          ),
          leadershipIndicators: Array.isArray(parsed.leadershipIndicators)
            ? (parsed.leadershipIndicators as string[]).slice(0, 3)
            : [],
          learningPotential: Math.max(
            0,
            Math.min(1, (parsed.learningPotential as number) || 0.7)
          ),
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return getMockSkillContext(skillName, contextText);
      }
    }

    return getMockSkillContext(skillName, contextText);
  }

  async function assessLearningPotential(
    missingSkill: string,
    candidateBackground: string
  ): Promise<LearningAssessment> {
    if (state.isMockMode) {
      return getMockLearningAssessment(missingSkill, candidateBackground);
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

    const response = await makeOpenAICall(prompt, 500, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = validateAndParseJSON(
          response.data,
          "learningAssessment"
        );

        return {
          learnability: Math.min(
            1,
            Math.max(0, (parsed.learnability as number) || 0.5)
          ),
          timeToProficiency: Math.max(
            1,
            (parsed.timeToProficiency as number) || 6
          ),
          recommendations: Array.isArray(parsed.recommendations)
            ? (parsed.recommendations as string[]).slice(0, 4)
            : [
                `Start with ${missingSkill} fundamentals`,
                "Consider online courses or bootcamps",
                "Build small projects to gain hands-on experience",
              ],
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return getMockLearningAssessment(missingSkill, candidateBackground);
      }
    }

    return getMockLearningAssessment(missingSkill, candidateBackground);
  }

  async function validateExperience(
    skillName: string,
    experienceDescription: string,
    duration: number
  ): Promise<ExperienceValidation> {
    if (state.isMockMode) {
      return getMockExperienceValidation(
        skillName,
        experienceDescription,
        duration
      );
    }

    const prompt = `Validate this experience claim for ${skillName}:

SKILL: ${skillName}
DESCRIPTION: "${experienceDescription}"
DURATION: ${duration} months

Provide a JSON response with exactly these fields:
{
  "isValid": boolean (whether the experience claim is credible),
  "confidence": number (0-1, confidence in the validation),
  "complexityLevel": number (1-5, complexity of the work described)
}

Consider:
- Description detail and specificity
- Duration vs. complexity alignment
- Technical depth and terminology
- Project scale and impact

Respond ONLY with valid JSON.`;

    const response = await makeOpenAICall(prompt, 400, 0.2);

    if (response.success && response.data) {
      try {
        const parsed = validateAndParseJSON(
          response.data,
          "experienceValidation"
        );

        return {
          isValid: Boolean(parsed.isValid),
          confidence: Math.min(
            1,
            Math.max(0, (parsed.confidence as number) || 0.7)
          ),
          complexityLevel: Math.max(
            1,
            Math.min(5, (parsed.complexityLevel as number) || 3)
          ),
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return getMockExperienceValidation(
          skillName,
          experienceDescription,
          duration
        );
      }
    }

    return getMockExperienceValidation(
      skillName,
      experienceDescription,
      duration
    );
  }

  async function generateGapAnalysis(
    requiredSkills: string[],
    candidateSkills: string[]
  ): Promise<GapAnalysis> {
    if (state.isMockMode) {
      return getMockGapAnalysis(requiredSkills, candidateSkills);
    }

    const prompt = `Analyze skill gaps between required and candidate skills:

REQUIRED SKILLS: ${requiredSkills.join(", ")}
CANDIDATE SKILLS: ${candidateSkills.join(", ")}

Provide a JSON response with exactly these fields:
{
  "gaps": ["array", "of", "missing", "skills"],
  "recommendations": ["array", "of", "4-5", "specific", "recommendations"],
  "priority": "high|medium|low"
}

Consider:
- Critical vs. nice-to-have skills
- Learning time and effort required
- Market demand and career impact
- Available learning resources

Respond ONLY with valid JSON.`;

    const response = await makeOpenAICall(prompt, 400, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = validateAndParseJSON(response.data, "gapAnalysis");

        const priority = ["high", "medium", "low"].includes(
          parsed.priority as string
        )
          ? (parsed.priority as "high" | "medium" | "low")
          : "medium";

        return {
          gaps: Array.isArray(parsed.gaps) ? (parsed.gaps as string[]) : [],
          recommendations: Array.isArray(parsed.recommendations)
            ? (parsed.recommendations as string[]).slice(0, 5)
            : ["Focus on the most critical missing skills"],
          priority,
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return getMockGapAnalysis(requiredSkills, candidateSkills);
      }
    }

    return getMockGapAnalysis(requiredSkills, candidateSkills);
  }

  async function analyzeSkillTransferability(
    sourceSkill: string,
    targetSkill: string,
    candidateExperience: string
  ): Promise<SkillTransferability> {
    if (state.isMockMode) {
      return getMockSkillTransferability(
        sourceSkill,
        targetSkill,
        candidateExperience
      );
    }

    const prompt = `Analyze skill transferability from ${sourceSkill} to ${targetSkill}:

SOURCE SKILL: ${sourceSkill}
TARGET SKILL: ${targetSkill}
CANDIDATE EXPERIENCE: "${candidateExperience}"

Provide a JSON response with exactly these fields:
{
  "transferabilityScore": number (0-1, how well skills transfer),
  "learningPath": ["array", "of", "4-5", "learning", "steps"],
  "timeToTransfer": number (estimated months to transfer skills),
  "confidence": number (0-1, confidence in the analysis)
}

Consider:
- Conceptual similarities between skills
- Technical overlap and prerequisites
- Learning curve and complexity differences
- Available resources and support

Respond ONLY with valid JSON.`;

    const response = await makeOpenAICall(prompt, 500, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = validateAndParseJSON(
          response.data,
          "skillTransferability"
        );

        return {
          transferabilityScore: Math.min(
            1,
            Math.max(0, (parsed.transferabilityScore as number) || 0.5)
          ),
          learningPath: Array.isArray(parsed.learningPath)
            ? (parsed.learningPath as string[]).slice(0, 5)
            : [`Learn ${targetSkill} fundamentals`],
          timeToTransfer: Math.max(1, (parsed.timeToTransfer as number) || 3),
          confidence: Math.min(
            1,
            Math.max(0, (parsed.confidence as number) || 0.7)
          ),
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return getMockSkillTransferability(
          sourceSkill,
          targetSkill,
          candidateExperience
        );
      }
    }

    return getMockSkillTransferability(
      sourceSkill,
      targetSkill,
      candidateExperience
    );
  }

  async function assessCulturalFit(
    candidateExperience: string,
    companyCulture: string,
    teamSize: string
  ): Promise<CulturalFitAssessment> {
    if (state.isMockMode) {
      return getMockCulturalFit(candidateExperience, companyCulture, teamSize);
    }

    const prompt = `Assess cultural fit between candidate and company:

CANDIDATE EXPERIENCE: "${candidateExperience}"
COMPANY CULTURE: ${companyCulture}
TEAM SIZE: ${teamSize}

Provide a JSON response with exactly these fields:
{
  "culturalFitScore": number (0-1, overall cultural alignment),
  "teamCollaborationScore": number (0-1, team collaboration ability),
  "adaptabilityScore": number (0-1, adaptability to new environments),
  "recommendations": ["array", "of", "4-5", "specific", "recommendations"]
}

Consider:
- Work style and preferences
- Communication patterns
- Adaptability and learning ability
- Team dynamics and collaboration

Respond ONLY with valid JSON.`;

    const response = await makeOpenAICall(prompt, 500, 0.3);

    if (response.success && response.data) {
      try {
        const parsed = validateAndParseJSON(response.data, "culturalFit");

        return {
          culturalFitScore: Math.min(
            1,
            Math.max(0, (parsed.culturalFitScore as number) || 0.7)
          ),
          teamCollaborationScore: Math.min(
            1,
            Math.max(0, (parsed.teamCollaborationScore as number) || 0.7)
          ),
          adaptabilityScore: Math.min(
            1,
            Math.max(0, (parsed.adaptabilityScore as number) || 0.7)
          ),
          recommendations: Array.isArray(parsed.recommendations)
            ? (parsed.recommendations as string[]).slice(0, 5)
            : ["Highlight collaborative experience"],
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return getMockCulturalFit(
          candidateExperience,
          companyCulture,
          teamSize
        );
      }
    }

    return getMockCulturalFit(candidateExperience, companyCulture, teamSize);
  }

  function setMockMode(enabled: boolean): void {
    state.isMockMode = enabled;
  }

  function getStatus(): {
    isMockMode: boolean;
    hasOpenAIKey: boolean;
    requestCount: number;
  } {
    return {
      isMockMode: state.isMockMode,
      hasOpenAIKey: Boolean(config.openaiApiKey),
      requestCount: state.requestCount,
    };
  }

  // Return the public API
  return {
    analyzeSkillContext,
    assessLearningPotential,
    validateExperience,
    generateGapAnalysis,
    analyzeSkillTransferability,
    assessCulturalFit,
    setMockMode,
    getStatus,
  };
}

// Export a singleton instance for backward compatibility
export const aiService = createAIService();
