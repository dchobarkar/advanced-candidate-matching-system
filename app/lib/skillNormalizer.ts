import { skills } from "../data/skills";
import { Skill } from "../types/matching";

export class SkillNormalizer {
  private skillMap: Map<string, Skill> = new Map();
  private aliasMap: Map<string, string> = new Map();

  constructor() {
    this.initializeSkillMaps();
  }

  private initializeSkillMaps(): void {
    // Create maps for fast lookups
    skills.forEach((skill) => {
      this.skillMap.set(skill.id, skill);
      this.skillMap.set(skill.canonicalName.toLowerCase(), skill);

      // Add aliases to the alias map
      skill.aliases.forEach((alias) => {
        this.aliasMap.set(alias.toLowerCase(), skill.canonicalName);
      });
    });
  }

  /**
   * Normalize a skill name to its canonical form
   */
  public normalizeSkill(skillName: string): string {
    const normalizedName = skillName.toLowerCase().trim();

    // Check if it's already a canonical name
    if (this.skillMap.has(normalizedName)) {
      return this.skillMap.get(normalizedName)!.canonicalName;
    }

    // Check if it's an alias
    if (this.aliasMap.has(normalizedName)) {
      return this.aliasMap.get(normalizedName)!;
    }

    // Try fuzzy matching for common variations
    const fuzzyMatch = this.findFuzzyMatch(normalizedName);
    if (fuzzyMatch) {
      return fuzzyMatch.canonicalName;
    }

    // Return original if no match found
    return skillName;
  }

  /**
   * Find a skill by name with fuzzy matching
   */
  private findFuzzyMatch(name: string): Skill | undefined {
    // Common variations and abbreviations
    const variations: { [key: string]: string } = {
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
    };

    const variation = variations[name];
    if (variation) {
      return this.skillMap.get(variation);
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
   * Extract skills from text content
   */
  public extractSkillsFromText(text: string): string[] {
    const normalizedText = text.toLowerCase();
    const extractedSkills: string[] = [];
    const foundSkills = new Set<string>();

    // First pass: look for exact matches
    for (const skill of skills) {
      const skillName = skill.canonicalName.toLowerCase();
      const aliases = skill.aliases.map((alias) => alias.toLowerCase());

      // Check canonical name
      if (normalizedText.includes(skillName) && !foundSkills.has(skill.id)) {
        extractedSkills.push(skill.canonicalName);
        foundSkills.add(skill.id);
        continue;
      }

      // Check aliases
      for (const alias of aliases) {
        if (normalizedText.includes(alias) && !foundSkills.has(skill.id)) {
          extractedSkills.push(skill.canonicalName);
          foundSkills.add(skill.id);
          break;
        }
      }
    }

    // Second pass: fuzzy matching for remaining text
    const words = normalizedText.split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue; // Skip short words

      const fuzzyMatch = this.findFuzzyMatch(word);
      if (fuzzyMatch && !foundSkills.has(fuzzyMatch.id)) {
        extractedSkills.push(fuzzyMatch.canonicalName);
        foundSkills.add(fuzzyMatch.id);
      }
    }

    return extractedSkills;
  }

  /**
   * Get skill by ID
   */
  public getSkillById(skillId: string): Skill | undefined {
    return this.skillMap.get(skillId);
  }

  /**
   * Get all skills
   */
  public getAllSkills(): Skill[] {
    return skills;
  }

  /**
   * Get skills by category
   */
  public getSkillsByCategory(category: string): Skill[] {
    return skills.filter(
      (skill) => skill.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get related skills for a given skill
   */
  public getRelatedSkills(skillId: string): Skill[] {
    const skill = this.getSkillById(skillId);
    if (!skill) return [];

    return skill.relatedSkills
      .map((relatedId) => this.getSkillById(relatedId))
      .filter(Boolean) as Skill[];
  }

  /**
   * Check if two skills are related
   */
  public areSkillsRelated(skill1Id: string, skill2Id: string): boolean {
    const skill1 = this.getSkillById(skill1Id);
    const skill2 = this.getSkillById(skill2Id);

    if (!skill1 || !skill2) return false;

    return (
      skill1.relatedSkills.includes(skill2Id) ||
      skill2.relatedSkills.includes(skill1Id)
    );
  }

  /**
   * Get skill difficulty level
   */
  public getSkillDifficulty(skillId: string): number {
    const skill = this.getSkillById(skillId);
    return skill ? skill.difficultyLevel : 1;
  }

  /**
   * Get time to proficiency for a skill
   */
  public getTimeToProficiency(skillId: string): number {
    const skill = this.getSkillById(skillId);
    return skill ? skill.timeToProficiency : 3;
  }
}

// Export a singleton instance
export const skillNormalizer = new SkillNormalizer();
