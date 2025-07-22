# API Documentation

This document provides comprehensive documentation for all API endpoints in the Advanced Candidate Matching System.

## Base URL

```api
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": string (optional),
  "processingTime": number (optional)
}
```

---

## 📋 Core Matching Endpoints

### POST `/api/matching`

Matches a candidate to a job and returns detailed analysis.

#### Request Body

```json
{
  "jobId": "job-1",
  "candidateId": "candidate-1"
}
```

#### Response

```json
{
  "result": {
    "candidate": {
      "id": "candidate-1",
      "name": "Sarah Johnson",
      "skills": ["react", "typescript", "nodejs"],
      "experience": [...],
      "education": [...],
      "summary": "Experienced React developer..."
    },
    "job": {
      "id": "job-1",
      "title": "Senior React Developer",
      "company": "TechCorp",
      "requirements": [...],
      "description": "We're looking for..."
    },
    "score": {
      "overallScore": 85.5,
      "skillMatchScore": 90.0,
      "experienceScore": 80.0,
      "transferableSkillsScore": 85.0,
      "potentialScore": 75.0,
      "breakdown": {
        "matchedSkills": ["react", "typescript"],
        "missingSkills": ["aws"],
        "relatedSkills": ["javascript"],
        "experienceGaps": [...],
        "potentialIndicators": ["leadership", "education"],
        "riskFactors": ["limited-cloud-experience"]
      }
    },
    "explanation": "Based on our analysis, Sarah Johnson has an 86% match...",
    "recommendations": [
      "Consider highlighting leadership experience in React team management",
      "Emphasize AWS cloud deployment experience"
    ]
  },
  "processingTime": 2450,
  "confidence": 0.85
}
```

#### Error Responses

```json
{
  "error": "Job with ID job-999 not found"
}
```

```json
{
  "error": "Candidate with ID candidate-999 not found"
}
```

#### Example Usage

```javascript
const response = await fetch("/api/matching", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jobId: "job-1",
    candidateId: "candidate-1",
  }),
});

const result = await response.json();
console.log(`Match Score: ${result.result.score.overallScore}%`);
```

---

## 📊 Data Retrieval Endpoints

### GET `/api/skills`

Returns all available skills from the knowledge graph.

#### Response

```json
{
  "skills": [
    {
      "id": "react",
      "canonicalName": "React",
      "aliases": ["ReactJS", "React.js"],
      "category": "frontend",
      "relatedSkills": ["javascript", "typescript", "redux"]
    },
    {
      "id": "python",
      "canonicalName": "Python",
      "aliases": ["py"],
      "category": "programming",
      "relatedSkills": ["django", "flask", "pandas"]
    }
  ]
}
```

#### Example Usage

```javascript
const response = await fetch("/api/skills");
const data = await response.json();
console.log(`Available skills: ${data.skills.length}`);
```

### GET `/api/knowledge`

Returns the complete knowledge graph data including skills, categories, and relationships.

#### Response

```json
{
  "skills": [...],
  "categories": [
    {
      "id": "frontend",
      "name": "Frontend Development",
      "description": "Client-side web development technologies"
    }
  ],
  "relationships": [
    {
      "skillId": "react",
      "relatedSkillId": "javascript",
      "relationshipType": "prerequisite",
      "strength": 0.8
    }
  ]
}
```

#### Example Usage

```javascript
const response = await fetch("/api/knowledge");
const data = await response.json();
console.log(`Knowledge graph contains ${data.skills.length} skills`);
```

---

## 🤖 AI Service Endpoints

### GET `/api/ai-status`

Returns the status of the AI service and available functions.

#### Response

```json
{
  "isMockMode": true,
  "hasOpenAIKey": false,
  "requestCount": 0,
  "availableFunctions": [
    "analyzeSkillContext",
    "assessLearningPotential",
    "analyzeSkillTransferability",
    "assessCulturalFit",
    "validateExperience"
  ]
}
```

#### Example Usage

```javascript
const response = await fetch("/api/ai-status");
const status = await response.json();
console.log(`AI Mode: ${status.isMockMode ? "Mock" : "Real"}`);
```

### POST `/api/ai-status`

Test individual AI functions (for debugging and development).

#### Request Body

```json
{
  "action": "analyzeSkillContext",
  "params": {
    "skillName": "React",
    "contextText": "Built React applications with TypeScript..."
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "proficiencyLevel": "intermediate",
    "contextRelevance": 0.85,
    "skillUsage": "component-development",
    "confidence": 0.9
  },
  "processingTime": 1200
}
```

#### Available Actions

- `analyzeSkillContext` - Analyze skill usage in context
- `assessLearningPotential` - Assess ability to learn missing skills
- `analyzeSkillTransferability` - Analyze skill transferability
- `assessCulturalFit` - Assess cultural fit

#### Example Usage

```javascript
const response = await fetch("/api/ai-status", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    action: "analyzeSkillContext",
    params: {
      skillName: "React",
      contextText: "Built React applications...",
    },
  }),
});

const result = await response.json();
console.log(`Proficiency: ${result.data.proficiencyLevel}`);
```

---

## 📈 Extended Matching Endpoints

### GET `/api/matching/candidates/{jobId}`

Find the best candidates for a specific job.

#### Path Parameters

- `jobId` (string): The ID of the job

#### Query Parameters

- `limit` (number, optional): Maximum number of candidates to return (default: 10)

#### Response

```json
{
  "candidates": [
    {
      "candidate": {...},
      "job": {...},
      "score": {...},
      "explanation": "...",
      "recommendations": [...]
    }
  ],
  "totalCandidates": 8,
  "processingTime": 3200
}
```

#### Example Usage

```javascript
const response = await fetch("/api/matching/candidates/job-1?limit=5");
const data = await response.json();
console.log(`Found ${data.candidates.length} candidates`);
```

### GET `/api/matching/jobs/{candidateId}`

Find the best jobs for a specific candidate.

#### Path Parameters

- `candidateId` (string): The ID of the candidate

#### Query Parameters

- `limit` (number, optional): Maximum number of jobs to return (default: 10)

#### Response

```json
{
  "jobs": [
    {
      "candidate": {...},
      "job": {...},
      "score": {...},
      "explanation": "...",
      "recommendations": [...]
    }
  ],
  "totalJobs": 6,
  "processingTime": 2800
}
```

#### Example Usage

```javascript
const response = await fetch("/api/matching/jobs/candidate-1?limit=3");
const data = await response.json();
console.log(`Found ${data.jobs.length} matching jobs`);
```

---

## 🔍 Error Handling

### Common Error Codes

| Status Code | Description           | Example                                |
| ----------- | --------------------- | -------------------------------------- |
| 400         | Bad Request           | Invalid request body or parameters     |
| 404         | Not Found             | Job or candidate not found             |
| 500         | Internal Server Error | AI service error or processing failure |

### Error Response Format

```json
{
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Messages

- `"Job with ID {id} not found"`
- `"Candidate with ID {id} not found"`
- `"Invalid request body"`
- `"AI service temporarily unavailable"`
- `"Processing timeout"`

---

## ⚡ Performance Considerations

### Response Times

- **Simple matching**: 1-3 seconds
- **AI-enhanced matching**: 3-8 seconds
- **Batch operations**: 5-15 seconds

### Rate Limiting

- AI endpoints: 1 request per second
- Regular endpoints: No rate limiting
- Caching: AI responses cached for 1 hour

### Optimization Tips

1. **Use caching**: AI responses are cached to improve performance
2. **Limit batch sizes**: Use `limit` parameter for large datasets
3. **Handle timeouts**: Set appropriate timeout values for AI operations
4. **Error handling**: Always check for error responses

---

## 🧪 Testing Endpoints

### GET `/api/test/health`

Health check endpoint for monitoring.

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### POST `/api/test/matching`

Test matching with sample data.

#### Request Body

```json
{
  "testScenario": "perfect-match"
}
```

#### Available Test Scenarios

- `perfect-match` - High-scoring match
- `transferable-skills` - Medium match with transferable skills
- `learning-potential` - Match based on learning ability
- `cultural-challenge` - Match with cultural fit considerations

#### Response

```json
{
  "scenario": "perfect-match",
  "result": {
    "candidate": {...},
    "job": {...},
    "score": {...},
    "explanation": "...",
    "recommendations": [...]
  },
  "expectedScore": "85-95%",
  "processingTime": 2100
}
```

---

## 📝 Usage Examples

### JavaScript/TypeScript

```javascript
class MatchingAPI {
  constructor(baseURL = "http://localhost:3000/api") {
    this.baseURL = baseURL;
  }

  async matchCandidate(jobId, candidateId) {
    const response = await fetch(`${this.baseURL}/matching`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, candidateId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getSkills() {
    const response = await fetch(`${this.baseURL}/skills`);
    return await response.json();
  }

  async getAIServiceStatus() {
    const response = await fetch(`${this.baseURL}/ai-status`);
    return await response.json();
  }
}

// Usage
const api = new MatchingAPI();
const result = await api.matchCandidate("job-1", "candidate-1");
console.log(`Match Score: ${result.result.score.overallScore}%`);
```

### Python

```python
import requests
import json

class MatchingAPI:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url

    def match_candidate(self, job_id, candidate_id):
        response = requests.post(
            f"{self.base_url}/matching",
            json={"jobId": job_id, "candidateId": candidate_id}
        )
        response.raise_for_status()
        return response.json()

    def get_skills(self):
        response = requests.get(f"{self.base_url}/skills")
        response.raise_for_status()
        return response.json()

# Usage
api = MatchingAPI()
result = api.match_candidate("job-1", "candidate-1")
print(f"Match Score: {result['result']['score']['overallScore']}%")
```

### cURL

```bash
# Match a candidate to a job
curl -X POST http://localhost:3000/api/matching \
  -H "Content-Type: application/json" \
  -d '{"jobId": "job-1", "candidateId": "candidate-1"}'

# Get all skills
curl http://localhost:3000/api/skills

# Check AI service status
curl http://localhost:3000/api/ai-status

# Test AI function
curl -X POST http://localhost:3000/api/ai-status \
  -H "Content-Type: application/json" \
  -d '{"action": "analyzeSkillContext", "params": {"skillName": "React", "contextText": "Built React apps..."}}'
```

---

## 🔧 Development Notes

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Local Development

```bash
npm run dev
# API available at http://localhost:3000/api
```

### Testing

```bash
npm test
# Runs API tests and integration tests
```

This API documentation provides comprehensive coverage of all endpoints with examples, error handling, and usage patterns for integrating with the Advanced Candidate Matching System.
