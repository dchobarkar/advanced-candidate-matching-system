// Environment configuration utility

export const config = {
  // AI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY,
  isAIMockMode:
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "your_openai_api_key_here",

  // App Configuration
  appName:
    process.env.NEXT_PUBLIC_APP_NAME || "Advanced Candidate Matching System",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

  // API Configuration
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;

// Helper function to validate required environment variables
export function validateEnvironment(): string[] {
  const errors: string[] = [];

  // Add validation for required env vars here if needed
  // For now, we're using mock mode so no required vars

  return errors;
}

// Helper function to get API endpoint URL
export function getApiUrl(endpoint: string): string {
  return `${config.apiBaseUrl}${endpoint}`;
}
