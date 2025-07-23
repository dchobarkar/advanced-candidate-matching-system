# Advanced Candidate Matching System

A modern, AI-powered candidate-job matching system built with Next.js 15, TypeScript, and Tailwind CSS. This project implements intelligent matching algorithms that go beyond simple text comparison to address skill equivalence, experience depth, and potential fit using advanced AI integration.

## 🚀 Features

### Core Matching System

- **AI-Augmented Matching** - OpenAI GPT-3.5-turbo integration for intelligent skill analysis
- **Multi-factor Scoring** - Comprehensive scoring algorithm considering skill match, experience, transferable skills, and potential
- **Skill Normalization** - Identifies equivalent skills (e.g., "React" vs "ReactJS") with fuzzy matching
- **Knowledge Graph** - In-memory representation of skills, aliases, and relationships
- **Explainable AI** - Detailed breakdowns, recommendations, and confidence levels

### User Interface

- **Interactive Dashboard** - Modern, responsive UI with real-time matching results
- **Progress Indicators** - Visual feedback during matching process
- **Knowledge Graph Visualization** - Interactive skill relationship explorer
- **Score Breakdown** - Detailed analysis with visual charts and metrics
- **Mobile-Responsive Design** - Optimized for all device sizes

### Error Handling & Performance

- **Global Error Boundaries** - Graceful error handling with recovery options
- **Loading States** - Skeleton loaders and progress indicators
- **Rate Limiting** - 1-second delay between AI API calls
- **Retry Logic** - Exponential backoff for resilience
- **Mock Mode** - Graceful fallback when API key not available

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Integration**: OpenAI GPT-3.5-turbo
- **State Management**: React hooks
- **Testing**: Jest with TypeScript support
- **Package Manager**: npm/pnpm
- **Development**: Turbopack for faster builds

## 📁 Project Structure

```structure
advanced-candidate-matching-system/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main dashboard page
│   ├── globals.css              # Global styles
│   ├── favicon.ico              # Site favicon
│   ├── api/                     # API routes
│   │   ├── matching/            # Matching endpoint
│   │   ├── skills/              # Skills endpoint
│   │   ├── knowledge/           # Knowledge graph endpoint
│   │   └── ai-status/           # AI service status
│   ├── components/              # React components
│   │   ├── JobInput.tsx         # Job selection component
│   │   ├── CandidateInput.tsx   # Candidate selection component
│   │   ├── MatchingResults.tsx  # Results display
│   │   ├── ScoreBreakdown.tsx   # Score analysis
│   │   ├── KnowledgeGraph.tsx   # Skill graph visualization
│   │   ├── LoadingSpinner.tsx   # Loading component
│   │   ├── StatusIndicator.tsx  # Status display
│   │   ├── MatchingProgress.tsx # Progress indicator
│   │   ├── WelcomeGuide.tsx     # Onboarding guide
│   │   └── Tooltip.tsx          # Tooltip component
│   ├── data/                    # Sample data
│   │   ├── sampleCandidates.ts  # Candidate data
│   │   ├── sampleJobs.ts        # Job data
│   │   └── skills.ts            # Skills knowledge graph
│   ├── lib/                     # Core business logic
│   │   ├── matchingService.ts   # Main matching orchestration
│   │   ├── scoringEngine.ts     # Multi-factor scoring algorithm
│   │   ├── aiService.ts         # AI integration service
│   │   ├── skillNormalizer.ts   # Skill normalization
│   │   ├── config.ts            # Configuration
│   │   └── performanceOptimizer.ts # Performance optimization
│   └── types/                   # TypeScript types
│       └── matching.ts          # Core type definitions
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── jest.config.js               # Jest configuration
├── eslint.config.mjs            # ESLint configuration
└── env.template                 # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- OpenAI API key (optional, mock mode available)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dchobarkar/advanced-candidate-matching-system.git
   cd advanced-candidate-matching-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.template .env.local
   ```

   Edit `.env.local` and add your OpenAI API key (optional):

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Development

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Jest for unit testing
- Component-based architecture

### Performance

- Next.js Image optimization
- Code splitting with dynamic imports
- Optimized bundle sizes
- In-memory caching for AI responses
- Turbopack for faster development

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📚 API Documentation

### Core Endpoints

#### `POST /api/matching`

Matches a candidate to a job.

**Request Body:**

```json
{
  "jobId": "senior-react-developer",
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
  },
  "processingTime": 1250,
  "confidence": 0.85
}
```

#### `GET /api/skills`

Returns all available skills from the knowledge graph.

#### `GET /api/knowledge`

Returns the complete knowledge graph data.

#### `GET /api/ai-status`

Returns the status of the AI service and available functions.

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

## 🔍 System Architecture

### Core Services

- **Matching Service** - Orchestrates the matching process with AI integration
- **Scoring Engine** - Multi-factor scoring algorithm (skill match 40%, experience 30%, transferable skills 20%, potential 10%)
- **Skill Normalizer** - Handles skill equivalence and extraction with fuzzy matching
- **AI Service** - Centralized LLM integration with error handling and mock mode

### Data Flow

1. **Job/Candidate Selection** - User selects from sample data
2. **Matching Process** - AI-enhanced analysis with multiple scoring factors
3. **Result Generation** - Detailed breakdown with explanations and recommendations
4. **Visualization** - Interactive knowledge graph and score breakdown

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

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run Jest tests
npm test -- --coverage  # Run tests with coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Made with ❤️ by Darshan Jitendra Chobarkar

## 💡 Author

Built by [Darshan Chobarkar](https://github.com/dchobarkar)  
LinkedIn: [https://www.linkedin.com/in/dchobarkar/](https://www.linkedin.com/in/dchobarkar/)

---

**Note**: This system can run in mock mode without an OpenAI API key for demonstration purposes.
