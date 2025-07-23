import { skillNormalizer } from "../skillNormalizer";

describe("skillNormalizer", () => {
  it("should normalize skill aliases to canonical form", () => {
    expect(skillNormalizer.normalizeSkill("ReactJS")).toBe("React");
    expect(skillNormalizer.normalizeSkill("js")).toBe("JavaScript");
    expect(skillNormalizer.normalizeSkill("Node")).toBe("Node.js");
  });

  it("should extract skills from text", () => {
    const text = "Experienced in React, Node.js, and TypeScript.";
    const result = skillNormalizer.extractSkillsFromText(text);
    expect(result.skills).toContain("React");
    expect(result.skills).toContain("Node.js");
    expect(result.skills).toContain("TypeScript");
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.matchedTerms).toHaveLength(4); // react, js, typescript, node.js
    expect(result.unmatchedTerms.length).toBeGreaterThan(0);
  });
});
