import { skills } from "../data/skills";
import { Skill } from "../types/matching";

// Type definitions for better type safety
interface SkillNormalizerConfig {
  fuzzyMatchVariations: Record<string, string>;
  minWordLength: number;
  defaultDifficultyLevel: number;
  defaultTimeToProficiency: number;
}

interface SkillExtractionResult {
  skills: string[];
  confidence: number;
  matchedTerms: string[];
  unmatchedTerms: string[];
}

interface SkillSearchResult {
  skill: Skill;
  matchType: "exact" | "alias" | "fuzzy" | "partial";
  confidence: number;
}

interface SkillAnalysisResult {
  skill: Skill;
  relatedSkills: Skill[];
  difficultyLevel: number;
  timeToProficiency: number;
  categorySkills: Skill[];
}

/**
 * Skill normalization and management utility.
 *
 * This module provides comprehensive skill management capabilities including:
 * - Skill name normalization and canonicalization
 * - Fuzzy matching for skill variations and aliases
 * - Skill extraction from text content
 * - Related skill analysis and categorization
 * - Difficulty assessment and proficiency time estimation
 *
 * The normalizer maintains fast lookup maps for efficient skill resolution
 * and provides both exact and fuzzy matching capabilities.
 *
 * @example
 * ```typescript
 * const normalizer = createSkillNormalizer();
 *
 * // Normalize skill names
 * const normalized = normalizer.normalizeSkill('js'); // Returns 'javascript'
 *
 * // Extract skills from text
 * const skills = normalizer.extractSkillsFromText('I know React and Node.js');
 *
 * // Get related skills
 * const related = normalizer.getRelatedSkills('javascript');
 * ```
 */

// Create skill normalizer with configuration
export function createSkillNormalizer(): ReturnType<
  typeof createSkillNormalizerInstance
> {
  return createSkillNormalizerInstance();
}

function createSkillNormalizerInstance() {
  // Configuration
  const config: SkillNormalizerConfig = {
    fuzzyMatchVariations: {
      js: "javascript",
      ts: "typescript",
      reactjs: "react",
      "react.js": "react",
      node: "nodejs",
      "node.js": "nodejs",
      postgres: "postgresql",
      mysql: "mysql",
      tf: "tensorflow",
      torch: "pytorch",
      k8s: "kubernetes",
      "aws cloud": "aws",
      "amazon web services": "aws",
      "machine learning": "ml",
      "artificial intelligence": "ai",
      "data science": "datascience",
      "web development": "webdev",
      "mobile development": "mobiledev",
      devops: "devops",
      "cloud computing": "cloud",
    },
    minWordLength: 3,
    defaultDifficultyLevel: 1,
    defaultTimeToProficiency: 3,
  };

  // Internal state
  const skillMap = new Map<string, Skill>();
  const aliasMap = new Map<string, string>();

  // Initialize skill maps
  function initializeSkillMaps(): void {
    // Create maps for fast lookups
    skills.forEach((skill) => {
      skillMap.set(skill.id, skill);
      skillMap.set(skill.canonicalName.toLowerCase(), skill);

      // Add aliases to the alias map
      skill.aliases.forEach((alias) => {
        aliasMap.set(alias.toLowerCase(), skill.canonicalName);
      });
    });
  }

  // Initialize on creation
  initializeSkillMaps();

  /**
   * Normalize a skill name to its canonical form
   *
   * @param skillName - The skill name to normalize
   * @returns The canonical skill name or original if no match found
   */
  function normalizeSkill(skillName: string): string {
    const normalizedName = skillName.toLowerCase().trim();

    // Check if it's already a canonical name
    if (skillMap.has(normalizedName)) {
      const skill = skillMap.get(normalizedName);
      return skill ? skill.canonicalName : skillName;
    }

    // Check if it's an alias
    if (aliasMap.has(normalizedName)) {
      return aliasMap.get(normalizedName) || skillName;
    }

    // Try fuzzy matching for common variations
    const fuzzyMatch = findFuzzyMatch(normalizedName);
    if (fuzzyMatch) {
      return fuzzyMatch.canonicalName;
    }

    // Return original if no match found
    return skillName;
  }

  /**
   * Find a skill by name with fuzzy matching
   *
   * @param name - The skill name to search for
   * @returns Skill if found, undefined otherwise
   */
  function findFuzzyMatch(name: string): Skill | undefined {
    // Check common variations and abbreviations
    const variation = config.fuzzyMatchVariations[name];
    if (variation) {
      return skillMap.get(variation);
    }

    // Try partial matching
    for (const skill of skills) {
      if (
        skill.canonicalName.toLowerCase().includes(name) ||
        name.includes(skill.canonicalName.toLowerCase())
      ) {
        return skill;
      }

      // Check aliases
      for (const alias of skill.aliases) {
        if (
          alias.toLowerCase().includes(name) ||
          name.includes(alias.toLowerCase())
        ) {
          return skill;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract skills from text content with detailed analysis
   *
   * @param text - The text to extract skills from
   * @returns SkillExtractionResult with extracted skills and analysis
   */
  function extractSkillsFromText(text: string): SkillExtractionResult {
    const normalizedText = text.toLowerCase();
    const extractedSkills: string[] = [];
    const foundSkills = new Set<string>();
    const matchedTerms: string[] = [];
    const unmatchedTerms: string[] = [];

    // First pass: look for exact matches
    for (const skill of skills) {
      const skillName = skill.canonicalName.toLowerCase();
      const aliases = skill.aliases.map((alias) => alias.toLowerCase());

      // Check canonical name
      if (normalizedText.includes(skillName) && !foundSkills.has(skill.id)) {
        extractedSkills.push(skill.canonicalName);
        foundSkills.add(skill.id);
        matchedTerms.push(skillName);
        continue;
      }

      // Check aliases
      for (const alias of aliases) {
        if (normalizedText.includes(alias) && !foundSkills.has(skill.id)) {
          extractedSkills.push(skill.canonicalName);
          foundSkills.add(skill.id);
          matchedTerms.push(alias);
          break;
        }
      }
    }

    // Second pass: fuzzy matching for remaining text
    const words = normalizedText.split(/\s+/);
    for (const word of words) {
      if (word.length < config.minWordLength) {
        unmatchedTerms.push(word);
        continue;
      }

      const fuzzyMatch = findFuzzyMatch(word);
      if (fuzzyMatch && !foundSkills.has(fuzzyMatch.id)) {
        extractedSkills.push(fuzzyMatch.canonicalName);
        foundSkills.add(fuzzyMatch.id);
        matchedTerms.push(word);
      } else {
        unmatchedTerms.push(word);
      }
    }

    // Calculate confidence based on match quality
    const confidence =
      matchedTerms.length > 0
        ? Math.min(
            1.0,
            matchedTerms.length / (matchedTerms.length + unmatchedTerms.length)
          )
        : 0;

    return {
      skills: extractedSkills,
      confidence,
      matchedTerms,
      unmatchedTerms,
    };
  }

  /**
   * Search for skills with detailed matching information
   *
   * @param query - The search query
   * @returns Array of SkillSearchResult with match details
   */
  function searchSkills(query: string): SkillSearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    const results: SkillSearchResult[] = [];

    for (const skill of skills) {
      let matchType: "exact" | "alias" | "fuzzy" | "partial" = "partial";
      let confidence = 0;

      // Exact match
      if (skill.canonicalName.toLowerCase() === normalizedQuery) {
        matchType = "exact";
        confidence = 1.0;
      }
      // Alias match
      else if (
        skill.aliases.some((alias) => alias.toLowerCase() === normalizedQuery)
      ) {
        matchType = "alias";
        confidence = 0.9;
      }
      // Fuzzy match
      else if (config.fuzzyMatchVariations[normalizedQuery] === skill.id) {
        matchType = "fuzzy";
        confidence = 0.8;
      }
      // Partial match
      else if (
        skill.canonicalName.toLowerCase().includes(normalizedQuery) ||
        normalizedQuery.includes(skill.canonicalName.toLowerCase()) ||
        skill.aliases.some(
          (alias) =>
            alias.toLowerCase().includes(normalizedQuery) ||
            normalizedQuery.includes(alias.toLowerCase())
        )
      ) {
        matchType = "partial";
        confidence = 0.6;
      }

      if (confidence > 0) {
        results.push({ skill, matchType, confidence });
      }
    }

    // Sort by confidence and match type
    return results.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      const typeOrder = { exact: 0, alias: 1, fuzzy: 2, partial: 3 };
      return typeOrder[a.matchType] - typeOrder[b.matchType];
    });
  }

  /**
   * Get skill by ID
   *
   * @param skillId - The skill ID to look up
   * @returns Skill if found, undefined otherwise
   */
  function getSkillById(skillId: string): Skill | undefined {
    return skillMap.get(skillId);
  }

  /**
   * Get all skills
   *
   * @returns Array of all available skills
   */
  function getAllSkills(): Skill[] {
    return skills;
  }

  /**
   * Get skills by category
   *
   * @param category - The category to filter by
   * @returns Array of skills in the specified category
   */
  function getSkillsByCategory(category: string): Skill[] {
    return skills.filter(
      (skill) => skill.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get related skills for a given skill
   *
   * @param skillId - The skill ID to find related skills for
   * @returns Array of related skills
   */
  function getRelatedSkills(skillId: string): Skill[] {
    const skill = getSkillById(skillId);
    if (!skill) return [];

    return skill.relatedSkills
      .map((relatedId) => getSkillById(relatedId))
      .filter(Boolean) as Skill[];
  }

  /**
   * Check if two skills are related
   *
   * @param skill1Id - First skill ID
   * @param skill2Id - Second skill ID
   * @returns True if skills are related, false otherwise
   */
  function areSkillsRelated(skill1Id: string, skill2Id: string): boolean {
    const skill1 = getSkillById(skill1Id);
    const skill2 = getSkillById(skill2Id);

    if (!skill1 || !skill2) return false;

    return (
      skill1.relatedSkills.includes(skill2Id) ||
      skill2.relatedSkills.includes(skill1Id)
    );
  }

  /**
   * Get comprehensive skill analysis
   *
   * @param skillId - The skill ID to analyze
   * @returns SkillAnalysisResult with detailed analysis
   */
  function analyzeSkill(skillId: string): SkillAnalysisResult | null {
    const skill = getSkillById(skillId);
    if (!skill) return null;

    const relatedSkills = getRelatedSkills(skillId);
    const categorySkills = getSkillsByCategory(skill.category);

    return {
      skill,
      relatedSkills,
      difficultyLevel: skill.difficultyLevel,
      timeToProficiency: skill.timeToProficiency,
      categorySkills,
    };
  }

  /**
   * Get skill difficulty level
   *
   * @param skillId - The skill ID
   * @returns Difficulty level (1-5) or default if not found
   */
  function getSkillDifficulty(skillId: string): number {
    const skill = getSkillById(skillId);
    return skill ? skill.difficultyLevel : config.defaultDifficultyLevel;
  }

  /**
   * Get time to proficiency for a skill
   *
   * @param skillId - The skill ID
   * @returns Time to proficiency in months or default if not found
   */
  function getTimeToProficiency(skillId: string): number {
    const skill = getSkillById(skillId);
    return skill ? skill.timeToProficiency : config.defaultTimeToProficiency;
  }

  /**
   * Get skills by difficulty level
   *
   * @param difficultyLevel - The difficulty level to filter by
   * @returns Array of skills with the specified difficulty level
   */
  function getSkillsByDifficulty(difficultyLevel: number): Skill[] {
    return skills.filter((skill) => skill.difficultyLevel === difficultyLevel);
  }

  /**
   * Get skills that can be learned within a time frame
   *
   * @param maxMonths - Maximum months to proficiency
   * @returns Array of skills that can be learned within the time frame
   */
  function getSkillsByTimeToProficiency(maxMonths: number): Skill[] {
    return skills.filter((skill) => skill.timeToProficiency <= maxMonths);
  }

  /**
   * Get skill categories
   *
   * @returns Array of unique skill categories
   */
  function getSkillCategories(): string[] {
    const categories = new Set<string>();
    skills.forEach((skill) => categories.add(skill.category));
    return Array.from(categories).sort();
  }

  /**
   * Get skill statistics
   *
   * @returns Object with skill statistics
   */
  function getSkillStatistics(): {
    totalSkills: number;
    categories: number;
    averageDifficulty: number;
    averageTimeToProficiency: number;
    difficultyDistribution: Record<number, number>;
  } {
    const categories = new Set(skills.map((skill) => skill.category));
    const totalDifficulty = skills.reduce(
      (sum, skill) => sum + skill.difficultyLevel,
      0
    );
    const totalTimeToProficiency = skills.reduce(
      (sum, skill) => sum + skill.timeToProficiency,
      0
    );

    const difficultyDistribution: Record<number, number> = {};
    skills.forEach((skill) => {
      difficultyDistribution[skill.difficultyLevel] =
        (difficultyDistribution[skill.difficultyLevel] || 0) + 1;
    });

    return {
      totalSkills: skills.length,
      categories: categories.size,
      averageDifficulty: totalDifficulty / skills.length,
      averageTimeToProficiency: totalTimeToProficiency / skills.length,
      difficultyDistribution,
    };
  }

  // Return the public API
  return {
    normalizeSkill,
    findFuzzyMatch,
    extractSkillsFromText,
    searchSkills,
    getSkillById,
    getAllSkills,
    getSkillsByCategory,
    getRelatedSkills,
    areSkillsRelated,
    analyzeSkill,
    getSkillDifficulty,
    getTimeToProficiency,
    getSkillsByDifficulty,
    getSkillsByTimeToProficiency,
    getSkillCategories,
    getSkillStatistics,
  };
}

// Export a singleton instance for backward compatibility
export const skillNormalizer = createSkillNormalizer();
