import { Skill, SkillRelationship } from "../types/matching";

// Comprehensive skills knowledge graph
export const skills: Skill[] = [
  // Frontend Skills
  {
    id: "react",
    canonicalName: "React",
    aliases: ["ReactJS", "React.js", "ReactJS", "React Native"],
    category: "Frontend",
    relatedSkills: ["javascript", "typescript", "jsx", "redux", "nextjs"],
    difficultyLevel: 3,
    timeToProficiency: 6,
  },
  {
    id: "javascript",
    canonicalName: "JavaScript",
    aliases: ["JS", "ES6", "ES2015", "ECMAScript"],
    category: "Programming",
    relatedSkills: ["typescript", "react", "vue", "angular", "nodejs"],
    difficultyLevel: 2,
    timeToProficiency: 4,
  },
  {
    id: "typescript",
    canonicalName: "TypeScript",
    aliases: ["TS", "TypeScript"],
    category: "Programming",
    relatedSkills: ["javascript", "react", "angular", "nodejs"],
    difficultyLevel: 3,
    timeToProficiency: 3,
  },
  {
    id: "vue",
    canonicalName: "Vue.js",
    aliases: ["Vue", "VueJS", "Vue.js"],
    category: "Frontend",
    relatedSkills: ["javascript", "typescript", "vuex", "nuxt"],
    difficultyLevel: 3,
    timeToProficiency: 5,
  },
  {
    id: "angular",
    canonicalName: "Angular",
    aliases: ["AngularJS", "Angular 2+", "Angular"],
    category: "Frontend",
    relatedSkills: ["typescript", "javascript", "rxjs", "ngrx"],
    difficultyLevel: 4,
    timeToProficiency: 8,
  },

  // Backend Skills
  {
    id: "nodejs",
    canonicalName: "Node.js",
    aliases: ["NodeJS", "Node", "Node.js"],
    category: "Backend",
    relatedSkills: ["javascript", "express", "mongodb", "postgresql"],
    difficultyLevel: 3,
    timeToProficiency: 6,
  },
  {
    id: "python",
    canonicalName: "Python",
    aliases: ["Python 3", "Python"],
    category: "Programming",
    relatedSkills: ["django", "flask", "fastapi", "pandas", "numpy"],
    difficultyLevel: 2,
    timeToProficiency: 4,
  },
  {
    id: "java",
    canonicalName: "Java",
    aliases: ["Java 8", "Java 11", "Java"],
    category: "Programming",
    relatedSkills: ["spring", "hibernate", "maven", "gradle"],
    difficultyLevel: 4,
    timeToProficiency: 8,
  },
  {
    id: "express",
    canonicalName: "Express.js",
    aliases: ["Express", "ExpressJS", "Express.js"],
    category: "Backend",
    relatedSkills: ["nodejs", "javascript", "mongodb", "postgresql"],
    difficultyLevel: 3,
    timeToProficiency: 4,
  },

  // Database Skills
  {
    id: "mongodb",
    canonicalName: "MongoDB",
    aliases: ["Mongo", "MongoDB"],
    category: "Database",
    relatedSkills: ["nodejs", "express", "mongoose", "nosql"],
    difficultyLevel: 3,
    timeToProficiency: 4,
  },
  {
    id: "postgresql",
    canonicalName: "PostgreSQL",
    aliases: ["Postgres", "PostgreSQL"],
    category: "Database",
    relatedSkills: ["sql", "nodejs", "express", "prisma"],
    difficultyLevel: 3,
    timeToProficiency: 5,
  },
  {
    id: "mysql",
    canonicalName: "MySQL",
    aliases: ["MySQL", "MariaDB"],
    category: "Database",
    relatedSkills: ["sql", "php", "nodejs"],
    difficultyLevel: 2,
    timeToProficiency: 3,
  },

  // DevOps Skills
  {
    id: "docker",
    canonicalName: "Docker",
    aliases: ["Docker", "Containerization"],
    category: "DevOps",
    relatedSkills: ["kubernetes", "aws", "azure", "ci-cd"],
    difficultyLevel: 3,
    timeToProficiency: 4,
  },
  {
    id: "aws",
    canonicalName: "AWS",
    aliases: ["Amazon Web Services", "AWS Cloud"],
    category: "Cloud",
    relatedSkills: ["docker", "kubernetes", "terraform", "serverless"],
    difficultyLevel: 4,
    timeToProficiency: 8,
  },
  {
    id: "kubernetes",
    canonicalName: "Kubernetes",
    aliases: ["K8s", "Kubernetes"],
    category: "DevOps",
    relatedSkills: ["docker", "aws", "azure", "helm"],
    difficultyLevel: 4,
    timeToProficiency: 6,
  },

  // AI/ML Skills
  {
    id: "tensorflow",
    canonicalName: "TensorFlow",
    aliases: ["TensorFlow", "TF"],
    category: "AI/ML",
    relatedSkills: ["python", "machine-learning", "deep-learning", "keras"],
    difficultyLevel: 4,
    timeToProficiency: 8,
  },
  {
    id: "pytorch",
    canonicalName: "PyTorch",
    aliases: ["PyTorch", "Torch"],
    category: "AI/ML",
    relatedSkills: ["python", "machine-learning", "deep-learning"],
    difficultyLevel: 4,
    timeToProficiency: 7,
  },

  // Testing Skills
  {
    id: "jest",
    canonicalName: "Jest",
    aliases: ["Jest", "Testing"],
    category: "Testing",
    relatedSkills: ["javascript", "react", "testing-library"],
    difficultyLevel: 2,
    timeToProficiency: 2,
  },
  {
    id: "cypress",
    canonicalName: "Cypress",
    aliases: ["Cypress", "E2E Testing"],
    category: "Testing",
    relatedSkills: ["javascript", "testing", "selenium"],
    difficultyLevel: 3,
    timeToProficiency: 3,
  },
];

// Skill relationships for the knowledge graph
export const skillRelationships: SkillRelationship[] = [
  // Frontend relationships
  {
    sourceSkill: "react",
    targetSkill: "javascript",
    relationshipType: "prerequisite",
    strength: 0.9,
  },
  {
    sourceSkill: "react",
    targetSkill: "typescript",
    relationshipType: "related",
    strength: 0.7,
  },
  {
    sourceSkill: "vue",
    targetSkill: "javascript",
    relationshipType: "prerequisite",
    strength: 0.8,
  },
  {
    sourceSkill: "angular",
    targetSkill: "typescript",
    relationshipType: "prerequisite",
    strength: 0.9,
  },

  // Backend relationships
  {
    sourceSkill: "nodejs",
    targetSkill: "javascript",
    relationshipType: "prerequisite",
    strength: 0.8,
  },
  {
    sourceSkill: "express",
    targetSkill: "nodejs",
    relationshipType: "prerequisite",
    strength: 0.9,
  },
  {
    sourceSkill: "django",
    targetSkill: "python",
    relationshipType: "prerequisite",
    strength: 0.9,
  },
  {
    sourceSkill: "spring",
    targetSkill: "java",
    relationshipType: "prerequisite",
    strength: 0.9,
  },

  // Database relationships
  {
    sourceSkill: "mongodb",
    targetSkill: "nodejs",
    relationshipType: "related",
    strength: 0.6,
  },
  {
    sourceSkill: "postgresql",
    targetSkill: "sql",
    relationshipType: "prerequisite",
    strength: 0.8,
  },
  {
    sourceSkill: "mysql",
    targetSkill: "sql",
    relationshipType: "prerequisite",
    strength: 0.8,
  },

  // DevOps relationships
  {
    sourceSkill: "kubernetes",
    targetSkill: "docker",
    relationshipType: "prerequisite",
    strength: 0.8,
  },
  {
    sourceSkill: "aws",
    targetSkill: "docker",
    relationshipType: "related",
    strength: 0.6,
  },

  // AI/ML relationships
  {
    sourceSkill: "tensorflow",
    targetSkill: "python",
    relationshipType: "prerequisite",
    strength: 0.9,
  },
  {
    sourceSkill: "pytorch",
    targetSkill: "python",
    relationshipType: "prerequisite",
    strength: 0.9,
  },

  // Testing relationships
  {
    sourceSkill: "jest",
    targetSkill: "javascript",
    relationshipType: "prerequisite",
    strength: 0.7,
  },
  {
    sourceSkill: "cypress",
    targetSkill: "javascript",
    relationshipType: "prerequisite",
    strength: 0.6,
  },

  // Alternative relationships
  {
    sourceSkill: "react",
    targetSkill: "vue",
    relationshipType: "alternative",
    strength: 0.5,
  },
  {
    sourceSkill: "react",
    targetSkill: "angular",
    relationshipType: "alternative",
    strength: 0.5,
  },
  {
    sourceSkill: "mongodb",
    targetSkill: "postgresql",
    relationshipType: "alternative",
    strength: 0.4,
  },
  {
    sourceSkill: "tensorflow",
    targetSkill: "pytorch",
    relationshipType: "alternative",
    strength: 0.6,
  },
];

// Helper function to find skill by name or alias
export function findSkillByName(name: string): Skill | undefined {
  const normalizedName = name.toLowerCase().trim();
  return skills.find(
    (skill) =>
      skill.canonicalName.toLowerCase() === normalizedName ||
      skill.aliases.some((alias) => alias.toLowerCase() === normalizedName)
  );
}

// Helper function to get related skills
export function getRelatedSkills(skillId: string): Skill[] {
  const relationships = skillRelationships.filter(
    (rel) => rel.sourceSkill === skillId
  );
  return relationships
    .map((rel) => skills.find((s) => s.id === rel.targetSkill))
    .filter(Boolean) as Skill[];
}

// Helper function to normalize skill name
export function normalizeSkillName(name: string): string {
  const skill = findSkillByName(name);
  return skill ? skill.canonicalName : name;
}
