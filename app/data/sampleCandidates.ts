import { Candidate } from "../types/matching";

export const sampleCandidates: Candidate[] = [
  {
    id: "candidate-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    summary:
      "Senior React developer with 5+ years of experience building scalable web applications. Passionate about clean code, performance optimization, and mentoring junior developers. Experience with modern React patterns, TypeScript, and full-stack development.",
    skills: ["react", "javascript", "typescript", "nodejs", "jest"],
    experience: [
      {
        id: "exp-1-1",
        skillId: "react",
        duration: 60,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Led development of enterprise React applications with 100k+ users",
        technologies: ["React", "TypeScript", "Redux", "Material-UI"],
      },
      {
        id: "exp-1-2",
        skillId: "javascript",
        duration: 72,
        complexityLevel: 4,
        hasLeadershipRole: false,
        projectDescription:
          "Built complex JavaScript applications with modern ES6+ features",
        technologies: ["JavaScript", "ES6+", "Webpack", "Babel"],
      },
      {
        id: "exp-1-3",
        skillId: "typescript",
        duration: 36,
        complexityLevel: 4,
        hasLeadershipRole: false,
        projectDescription:
          "Migrated large codebases to TypeScript and established best practices",
        technologies: ["TypeScript", "React", "Node.js"],
      },
      {
        id: "exp-1-4",
        skillId: "nodejs",
        duration: 24,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription: "Developed RESTful APIs and microservices",
        technologies: ["Node.js", "Express", "MongoDB", "JWT"],
      },
      {
        id: "exp-1-5",
        skillId: "jest",
        duration: 18,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Implemented comprehensive testing strategies with 90%+ coverage",
        technologies: ["Jest", "React Testing Library", "Cypress"],
      },
    ],
    education: [
      {
        degree: "Bachelor of Science",
        institution: "Stanford University",
        graduationYear: 2018,
        field: "Computer Science",
      },
    ],
  },
  {
    id: "candidate-2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    summary:
      "Full-stack developer with strong backend focus and DevOps experience. Expert in Node.js, Python, and cloud technologies. Passionate about scalable architecture and automation.",
    skills: ["javascript", "nodejs", "python", "mongodb", "aws", "docker"],
    experience: [
      {
        id: "exp-2-1",
        skillId: "javascript",
        duration: 48,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Architected and led development of microservices platform",
        technologies: ["JavaScript", "Node.js", "Express", "Redis"],
      },
      {
        id: "exp-2-2",
        skillId: "nodejs",
        duration: 42,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Built high-performance Node.js applications serving millions of requests",
        technologies: ["Node.js", "Express", "MongoDB", "Redis"],
      },
      {
        id: "exp-2-3",
        skillId: "python",
        duration: 36,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Developed data processing pipelines and automation scripts",
        technologies: ["Python", "Pandas", "NumPy", "FastAPI"],
      },
      {
        id: "exp-2-4",
        skillId: "mongodb",
        duration: 30,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Designed and optimized database schemas for high-traffic applications",
        technologies: ["MongoDB", "Mongoose", "Redis", "Elasticsearch"],
      },
      {
        id: "exp-2-5",
        skillId: "aws",
        duration: 24,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Deployed and managed applications on AWS with auto-scaling",
        technologies: ["AWS", "EC2", "S3", "Lambda", "CloudFormation"],
      },
      {
        id: "exp-2-6",
        skillId: "docker",
        duration: 18,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Containerized applications and implemented CI/CD pipelines",
        technologies: ["Docker", "Kubernetes", "Jenkins", "GitHub Actions"],
      },
    ],
    education: [
      {
        degree: "Master of Science",
        institution: "MIT",
        graduationYear: 2019,
        field: "Software Engineering",
      },
    ],
  },
  {
    id: "candidate-3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@email.com",
    summary:
      "Python developer with expertise in data science and machine learning. Strong background in building scalable backend systems and ML pipelines. Experience with big data technologies and cloud deployment.",
    skills: ["python", "postgresql", "docker", "aws", "tensorflow"],
    experience: [
      {
        id: "exp-3-1",
        skillId: "python",
        duration: 54,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Led development of ML-powered data processing systems",
        technologies: ["Python", "FastAPI", "Celery", "Redis"],
      },
      {
        id: "exp-3-2",
        skillId: "postgresql",
        duration: 36,
        complexityLevel: 4,
        hasLeadershipRole: false,
        projectDescription:
          "Designed and optimized database schemas for large datasets",
        technologies: ["PostgreSQL", "SQLAlchemy", "Alembic", "Redis"],
      },
      {
        id: "exp-3-3",
        skillId: "docker",
        duration: 24,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Containerized ML models and data processing pipelines",
        technologies: ["Docker", "Kubernetes", "Helm", "ArgoCD"],
      },
      {
        id: "exp-3-4",
        skillId: "aws",
        duration: 30,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription: "Deployed ML models and data pipelines on AWS",
        technologies: ["AWS", "SageMaker", "ECS", "S3", "RDS"],
      },
      {
        id: "exp-3-5",
        skillId: "tensorflow",
        duration: 18,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription: "Developed and deployed machine learning models",
        technologies: ["TensorFlow", "Keras", "Scikit-learn", "Pandas"],
      },
    ],
    education: [
      {
        degree: "Master of Science",
        institution: "UC Berkeley",
        graduationYear: 2020,
        field: "Data Science",
      },
    ],
  },
  {
    id: "candidate-4",
    name: "David Kim",
    email: "david.kim@email.com",
    summary:
      "DevOps engineer with extensive experience in cloud infrastructure and automation. Expert in AWS, Kubernetes, and CI/CD pipelines. Passionate about infrastructure as code and monitoring.",
    skills: ["docker", "kubernetes", "aws", "python", "javascript"],
    experience: [
      {
        id: "exp-4-1",
        skillId: "docker",
        duration: 48,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Led containerization strategy for enterprise applications",
        technologies: [
          "Docker",
          "Docker Compose",
          "Registry",
          "Security Scanning",
        ],
      },
      {
        id: "exp-4-2",
        skillId: "kubernetes",
        duration: 36,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Architected and managed Kubernetes clusters for production workloads",
        technologies: ["Kubernetes", "Helm", "Istio", "Prometheus"],
      },
      {
        id: "exp-4-3",
        skillId: "aws",
        duration: 42,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Designed and implemented cloud infrastructure for high-availability systems",
        technologies: ["AWS", "Terraform", "CloudFormation", "ECS/EKS"],
      },
      {
        id: "exp-4-4",
        skillId: "python",
        duration: 24,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Developed automation scripts and infrastructure tools",
        technologies: ["Python", "Boto3", "Ansible", "Terraform"],
      },
      {
        id: "exp-4-5",
        skillId: "javascript",
        duration: 18,
        complexityLevel: 2,
        hasLeadershipRole: false,
        projectDescription: "Built monitoring dashboards and alerting systems",
        technologies: ["JavaScript", "Node.js", "Grafana", "Prometheus"],
      },
    ],
    education: [
      {
        degree: "Bachelor of Science",
        institution: "Georgia Tech",
        graduationYear: 2017,
        field: "Computer Engineering",
      },
    ],
  },
  {
    id: "candidate-5",
    name: "Lisa Wang",
    email: "lisa.wang@email.com",
    summary:
      "Machine Learning Engineer with strong background in deep learning and model deployment. Experience with TensorFlow, PyTorch, and production ML systems. Passionate about making AI accessible and scalable.",
    skills: ["python", "tensorflow", "docker", "aws", "postgresql"],
    experience: [
      {
        id: "exp-5-1",
        skillId: "python",
        duration: 60,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Led development of ML infrastructure and model training pipelines",
        technologies: ["Python", "FastAPI", "Celery", "Redis", "Ray"],
      },
      {
        id: "exp-5-2",
        skillId: "tensorflow",
        duration: 42,
        complexityLevel: 4,
        hasLeadershipRole: true,
        projectDescription:
          "Developed and deployed production ML models with TensorFlow",
        technologies: ["TensorFlow", "Keras", "TensorFlow Serving", "MLflow"],
      },
      {
        id: "exp-5-3",
        skillId: "docker",
        duration: 30,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription: "Containerized ML models and inference services",
        technologies: [
          "Docker",
          "Kubernetes",
          "TensorFlow Serving",
          "NVIDIA Docker",
        ],
      },
      {
        id: "exp-5-4",
        skillId: "aws",
        duration: 36,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Deployed ML models on AWS SageMaker and custom infrastructure",
        technologies: ["AWS", "SageMaker", "EC2", "S3", "Lambda"],
      },
      {
        id: "exp-5-5",
        skillId: "postgresql",
        duration: 24,
        complexityLevel: 3,
        hasLeadershipRole: false,
        projectDescription:
          "Designed databases for ML feature stores and model metadata",
        technologies: ["PostgreSQL", "SQLAlchemy", "Feature Store", "MLflow"],
      },
    ],
    education: [
      {
        degree: "Master of Science",
        institution: "Carnegie Mellon University",
        graduationYear: 2021,
        field: "Machine Learning",
      },
    ],
  },
];

// Helper function to find candidate by ID
export function findCandidateById(id: string): Candidate | undefined {
  return sampleCandidates.find((candidate) => candidate.id === id);
}

// Helper function to get all candidates
export function getAllCandidates(): Candidate[] {
  return sampleCandidates;
}

// Helper function to get candidates by skill
export function getCandidatesBySkill(skillId: string): Candidate[] {
  return sampleCandidates.filter(
    (candidate) =>
      candidate.skills.includes(skillId) ||
      candidate.experience.some((exp) => exp.skillId === skillId)
  );
}

// Helper function to get candidates by experience level
export function getCandidatesByExperienceLevel(
  minDuration: number
): Candidate[] {
  return sampleCandidates.filter((candidate) =>
    candidate.experience.some((exp) => exp.duration >= minDuration)
  );
}
