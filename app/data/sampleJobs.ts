import { Job } from "../types/matching";

export const sampleJobs: Job[] = [
  {
    id: "senior-react-developer",
    title: "Senior React Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$120,000 - $150,000",
    description: `We're looking for a Senior React Developer to join our growing team. You'll be responsible for building scalable, high-performance web applications using modern React patterns and best practices. You'll work closely with our design and backend teams to deliver exceptional user experiences.

Key responsibilities include:
- Developing and maintaining React-based web applications
- Collaborating with cross-functional teams to define and implement new features
- Optimizing applications for maximum speed and scalability
- Writing clean, maintainable, and well-documented code
- Mentoring junior developers and conducting code reviews`,
    requirements: [
      {
        skillId: "react",
        minDuration: 24,
        requiredLevel: 4,
        isRequired: true,
        description: "Deep understanding of React patterns and best practices",
      },
      {
        skillId: "javascript",
        minDuration: 36,
        requiredLevel: 4,
        isRequired: true,
        description: "Strong JavaScript fundamentals and ES6+ features",
      },
      {
        skillId: "typescript",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience with TypeScript in production applications",
      },
      {
        skillId: "nodejs",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: false,
        description: "Familiarity with Node.js and backend development",
      },
      {
        skillId: "jest",
        minDuration: 6,
        requiredLevel: 3,
        isRequired: false,
        description: "Experience with testing frameworks and TDD",
      },
    ],
    responsibilities: [
      "Lead development of new features and improvements",
      "Architect and implement scalable React applications",
      "Collaborate with UX/UI designers to implement pixel-perfect designs",
      "Write comprehensive tests and documentation",
      "Mentor junior developers and conduct code reviews",
      "Participate in technical discussions and architecture decisions",
    ],
  },
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    location: "Remote",
    salary: "$90,000 - $110,000",
    description: `Join our fast-growing startup as a Full Stack Developer! You'll work on both frontend and backend development, helping us build and scale our platform. We're looking for someone who can wear multiple hats and contribute across the entire tech stack.

This role offers the opportunity to work with cutting-edge technologies and make a real impact on our product. You'll be involved in everything from database design to UI/UX implementation.`,
    requirements: [
      {
        skillId: "javascript",
        minDuration: 24,
        requiredLevel: 3,
        isRequired: true,
        description: "Strong JavaScript skills for both frontend and backend",
      },
      {
        skillId: "nodejs",
        minDuration: 18,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience building and maintaining Node.js applications",
      },
      {
        skillId: "react",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience with React and modern frontend development",
      },
      {
        skillId: "mongodb",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience with MongoDB or similar NoSQL databases",
      },
      {
        skillId: "aws",
        minDuration: 6,
        requiredLevel: 2,
        isRequired: false,
        description: "Familiarity with AWS or cloud deployment",
      },
    ],
    responsibilities: [
      "Develop and maintain both frontend and backend components",
      "Design and implement database schemas and APIs",
      "Deploy and maintain applications in cloud environments",
      "Collaborate with the team on technical decisions",
      "Write clean, maintainable code with proper documentation",
      "Participate in agile development processes",
    ],
  },
  {
    id: "python-backend-developer",
    title: "Python Backend Developer",
    company: "DataTech Solutions",
    location: "New York, NY",
    salary: "$100,000 - $130,000",
    description: `We're seeking a Python Backend Developer to join our data-focused team. You'll be responsible for building robust, scalable backend services that process large amounts of data and provide APIs for our frontend applications.

This role involves working with big data technologies, building RESTful APIs, and ensuring high performance and reliability of our backend systems.`,
    requirements: [
      {
        skillId: "python",
        minDuration: 24,
        requiredLevel: 4,
        isRequired: true,
        description: "Strong Python programming skills and best practices",
      },
      {
        skillId: "postgresql",
        minDuration: 18,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience with PostgreSQL and database optimization",
      },
      {
        skillId: "docker",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience with Docker and containerization",
      },
      {
        skillId: "aws",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience deploying and managing applications on AWS",
      },
      {
        skillId: "tensorflow",
        minDuration: 6,
        requiredLevel: 2,
        isRequired: false,
        description: "Familiarity with machine learning frameworks",
      },
    ],
    responsibilities: [
      "Design and implement scalable backend services",
      "Build and optimize database queries and schemas",
      "Develop RESTful APIs and microservices",
      "Implement data processing pipelines",
      "Ensure high availability and performance",
      "Collaborate with data science team on ML integration",
    ],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    company: "CloudScale Inc.",
    location: "Austin, TX",
    salary: "$110,000 - $140,000",
    description: `Join our DevOps team to help us scale our infrastructure and improve our deployment processes. You'll work with cutting-edge cloud technologies and help us maintain high availability and performance across our platform.

This role involves automating deployment processes, monitoring system health, and working closely with development teams to ensure smooth releases.`,
    requirements: [
      {
        skillId: "docker",
        minDuration: 18,
        requiredLevel: 4,
        isRequired: true,
        description: "Expert knowledge of Docker and containerization",
      },
      {
        skillId: "kubernetes",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience with Kubernetes orchestration",
      },
      {
        skillId: "aws",
        minDuration: 18,
        requiredLevel: 4,
        isRequired: true,
        description: "Deep knowledge of AWS services and best practices",
      },
      {
        skillId: "python",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Python scripting for automation and tooling",
      },
      {
        skillId: "javascript",
        minDuration: 6,
        requiredLevel: 2,
        isRequired: false,
        description: "Basic JavaScript for monitoring and alerting",
      },
    ],
    responsibilities: [
      "Design and maintain cloud infrastructure",
      "Automate deployment and scaling processes",
      "Monitor system performance and health",
      "Implement security best practices",
      "Collaborate with development teams on CI/CD",
      "Troubleshoot and resolve infrastructure issues",
    ],
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    company: "AI Innovations",
    location: "Seattle, WA",
    salary: "$130,000 - $160,000",
    description: `We're looking for a Machine Learning Engineer to join our AI team. You'll be responsible for developing and deploying machine learning models that power our intelligent features. This role combines software engineering skills with machine learning expertise.

You'll work on everything from data preprocessing to model deployment, ensuring our ML systems are scalable, reliable, and maintainable.`,
    requirements: [
      {
        skillId: "python",
        minDuration: 24,
        requiredLevel: 4,
        isRequired: true,
        description: "Strong Python skills for ML development",
      },
      {
        skillId: "tensorflow",
        minDuration: 18,
        requiredLevel: 4,
        isRequired: true,
        description: "Deep experience with TensorFlow or PyTorch",
      },
      {
        skillId: "docker",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience containerizing ML models",
      },
      {
        skillId: "aws",
        minDuration: 12,
        requiredLevel: 3,
        isRequired: true,
        description: "Experience deploying ML models on cloud platforms",
      },
      {
        skillId: "postgresql",
        minDuration: 6,
        requiredLevel: 2,
        isRequired: false,
        description: "Familiarity with databases for ML data storage",
      },
    ],
    responsibilities: [
      "Develop and train machine learning models",
      "Preprocess and analyze large datasets",
      "Deploy ML models to production environments",
      "Monitor model performance and accuracy",
      "Collaborate with data scientists and engineers",
      "Optimize ML pipelines for scalability",
    ],
  },
];

// Helper function to find job by ID
export function findJobById(id: string): Job | undefined {
  return sampleJobs.find((job) => job.id === id);
}

// Helper function to get all jobs
export function getAllJobs(): Job[] {
  return sampleJobs;
}

// Helper function to get jobs by category
export function getJobsByCategory(category: string): Job[] {
  return sampleJobs.filter((job) =>
    job.requirements.some((req) => {
      // This would need to be enhanced with actual skill categories
      return true; // Placeholder
    })
  );
}
