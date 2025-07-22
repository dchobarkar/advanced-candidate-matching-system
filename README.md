# Advanced Candidate Matching System

An AI-augmented candidate-job matching system that goes beyond simple text comparison to address skill equivalence, experience depth, and potential fit using advanced algorithms and LLM integration.

## 🚀 Features

- **AI-Augmented Matching**: Uses OpenAI GPT-3.5-turbo for intelligent skill analysis
- **Skill Normalization**: Identifies equivalent skills (e.g., "React" vs "ReactJS")
- **Multi-factor Scoring**: Considers skill match, experience, transferable skills, and potential
- **Explainable AI**: Provides detailed breakdowns and recommendations
- **Knowledge Graph**: In-memory representation of skills, aliases, and relationships
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Production Ready**: Error boundaries, rate limiting, caching, and retry logic

## 🏗️ System Architecture

### Frontend

- **Next.js 14 (App Router)**: Modern React framework with server-side rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Components**: Modular, reusable UI components with memoization

### Backend

- **Next.js API Routes**: Serverless functions for backend logic
- **Node.js**: JavaScript runtime
- **In-memory Storage**: For demo purposes (easily extensible to database)

### AI Integration

- **OpenAI GPT-3.5-turbo**: LLM for intelligent analysis
- **Rate Limiting**: 1-second delay between API calls
- **Retry Logic**: Exponential backoff for resilience
- **Caching**: In-memory cache for AI responses
- **Mock Mode**: Graceful fallback when API key not available

### Core Services

- **Matching Service**: Orchestrates the matching process
- **Scoring Engine**: Multi-factor scoring algorithm
- **Skill Normalizer**: Handles skill equivalence and extraction
- **AI Service**: Centralized LLM integration with error handling

## 🎯 Design Decisions

### 1. AI-Augmented Matching

**Challenge**: Simple text comparison fails to capture skill equivalence and context.
**Solution**:

- LLM integration for semantic understanding
- Skill transferability analysis
- Cultural fit assessment
- Learning potential evaluation
- Experience validation

### 2. Skill Normalization

**Challenge**: Different terms for the same skill (React vs ReactJS).
**Solution**:

- Comprehensive knowledge graph with aliases
- Fuzzy matching for similar skills
- Canonical skill names for consistency

### 3. Multi-factor Scoring

**Challenge**: Single score doesn't capture complexity of job-candidate fit.
**Solution**:

- Skill match score (40%)
- Experience score (25%)
- Transferable skills score (20%)
- Potential score (15%)

### 4. Explainable AI

**Challenge**: Black-box matching systems lack transparency.
**Solution**:

- Detailed score breakdowns
- Specific recommendations
- Confidence levels with reasoning
- Learning path suggestions

### 5. Production Readiness

**Challenge**: Demo systems often lack production features.
**Solution**:

- Error boundaries for graceful failure handling
- Rate limiting to prevent API abuse
- Retry logic with exponential backoff
- In-memory caching for performance
- Comprehensive error handling

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd advanced-candidate-matching-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.template .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
npm test
```

## 📚 API Documentation

### Core Endpoints

#### `POST /api/matching`

Matches a candidate to a job.

**Request Body:**

```json
{
  "jobId": "job-1",
  "candidateId": "candidate-1"
}
```

**Response:**

```json
{
  "result": {
    "candidate": {
      /* candidate object */
    },
    "job": {
      /* job object */
    },
    "score": {
      "overallScore": 85.5,
      "skillMatchScore": 90.0,
      "experienceScore": 80.0,
      "transferableSkillsScore": 85.0,
      "potentialScore": 75.0,
      "breakdown": {
        /* detailed breakdown */
      }
    },
    "explanation": "Detailed explanation of the match...",
    "recommendations": ["Recommendation 1", "Recommendation 2"],
    "confidence": 0.85
  }
}
```

#### `GET /api/skills`

Returns all available skills from the knowledge graph.

#### `GET /api/knowledge`

Returns the complete knowledge graph data.

#### `GET /api/ai-status`

Returns the status of the AI service and available functions.

## 🧪 Testing

The project includes comprehensive testing:

- **Unit Tests**: Core business logic (matching, scoring, normalization)
- **Integration Tests**: End-to-end matching flow
- **Code Coverage**: Jest coverage reporting

Run tests with:

```bash
npm test
```

## 🚀 Scalability Considerations

### Current Architecture

- **In-memory storage**: Suitable for demo and small-scale use
- **Serverless API routes**: Auto-scaling with Next.js
- **Caching**: Reduces API calls and improves performance

### Future Scalability

- **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
- **Redis Caching**: Distributed caching for high-traffic scenarios
- **Microservices**: Split into separate services for different domains
- **Queue System**: Background processing for heavy AI operations
- **CDN**: Static asset delivery optimization

## 🎨 Demo Scenarios

### Scenario 1: Perfect Match

- **Job**: Senior React Developer
- **Candidate**: Experienced React developer with 5+ years
- **Expected**: High score (85-95%) with strong skill alignment

### Scenario 2: Transferable Skills

- **Job**: Vue.js Developer
- **Candidate**: React developer with no Vue experience
- **Expected**: Medium score (60-75%) with transferability analysis

### Scenario 3: Learning Potential

- **Job**: Machine Learning Engineer
- **Candidate**: Software engineer with strong math background
- **Expected**: Medium-high score (70-80%) with learning recommendations

### Scenario 4: Cultural Fit

- **Job**: Startup environment, fast-paced
- **Candidate**: Enterprise background, methodical approach
- **Expected**: Lower score with cultural fit considerations

## 🔍 How Challenges Were Addressed

### 1. Skill Equivalence

- **Problem**: "React" vs "ReactJS" treated as different skills
- **Solution**: Comprehensive knowledge graph with aliases and fuzzy matching

### 2. Experience Depth

- **Problem**: Years of experience doesn't capture skill proficiency
- **Solution**: AI analysis of experience descriptions and skill usage context

### 3. Transferable Skills

- **Problem**: Missing skills treated as complete disqualification
- **Solution**: AI-powered transferability analysis and learning potential assessment

### 4. Cultural Fit

- **Problem**: Technical skills only, ignoring team dynamics
- **Solution**: AI assessment of cultural alignment and work style compatibility

### 5. Explainability

- **Problem**: Black-box matching decisions
- **Solution**: Detailed breakdowns, specific recommendations, and confidence levels

## 🛠️ Development

### Project Structure

```
advanced-candidate-matching-system/
├── app/
│   ├── api/                 # API routes
│   ├── components/          # React components
│   ├── data/               # Sample data
│   ├── lib/                # Core business logic
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── tests/                  # Test files
```

### Key Files

- `app/lib/matchingService.ts`: Core matching logic
- `app/lib/scoringEngine.ts`: Multi-factor scoring algorithm
- `app/lib/aiService.ts`: AI integration with error handling
- `app/lib/skillNormalizer.ts`: Skill normalization and extraction
- `app/data/skills.ts`: Knowledge graph definition

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-3.5-turbo API
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first styling approach
