export interface Skill {
  id: string;
  canonicalName: string;
  aliases: string[];
  category: string;
  relatedSkills: string[];
  difficultyLevel: number; // 1-5 scale
  timeToProficiency: number; // months
}

export interface SkillRelationship {
  sourceSkill: string;
  targetSkill: string;
  relationshipType: "prerequisite" | "related" | "alternative";
  strength: number; // 0-1 relationship strength
}

export interface Experience {
  id: string;
  skillId: string;
  duration: number; // months
  complexityLevel: number; // 1-5 scale
  hasLeadershipRole: boolean;
  projectDescription?: string;
  technologies: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  experience: Experience[];
  skills: string[]; // skill IDs
  education: Education[];
  summary: string;
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: number;
  field: string;
}

export interface JobRequirement {
  skillId: string;
  minDuration: number; // months
  requiredLevel: number; // 1-5 scale
  isRequired: boolean;
  description?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: JobRequirement[];
  responsibilities: string[];
  location: string;
  salary?: string;
}

export interface MatchingScore {
  overallScore: number; // 0-100
  skillMatchScore: number; // 0-100
  experienceScore: number; // 0-100
  transferableSkillsScore: number; // 0-100
  potentialScore: number; // 0-100
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  matchedSkills: string[];
  missingSkills: string[];
  relatedSkills: string[];
  experienceGaps: ExperienceGap[];
  potentialIndicators: string[];
  riskFactors: string[];
}

export interface ExperienceGap {
  skillId: string;
  requiredDuration: number;
  candidateDuration: number;
  gap: number;
  learnability: number; // 0-1 scale
}

export interface MatchingResult {
  candidate: Candidate;
  job: Job;
  score: MatchingScore;
  explanation: string;
  recommendations: string[];
}

export interface KnowledgeGraph {
  skills: Skill[];
  relationships: SkillRelationship[];
}

export interface AIContext {
  skillContext: string;
  projectComplexity: number;
  leadershipIndicators: string[];
  learningPotential: number;
}

export interface MatchingRequest {
  jobId: string;
  candidateId: string;
}

export interface MatchingResponse {
  result: MatchingResult;
  processingTime: number;
  confidence: number;
}
