import { skillNormalizer } from "../skillNormalizer";

describe("skillNormalizer", () => {
  it("should normalize skill aliases to canonical form", () => {
    expect(skillNormalizer.normalizeSkill("ReactJS")).toBe("React");
    expect(skillNormalizer.normalizeSkill("js")).toBe("JavaScript");
    expect(skillNormalizer.normalizeSkill("Node")).toBe("Node.js");
  });

  it("should extract skills from text", () => {
    const text = "Experienced in React, Node.js, and TypeScript.";
    const skills = skillNormalizer.extractSkillsFromText(text);
    expect(skills).toContain("React");
    expect(skills).toContain("Node.js");
    expect(skills).toContain("TypeScript");
  });
});
