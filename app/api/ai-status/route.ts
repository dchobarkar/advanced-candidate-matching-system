import { NextRequest, NextResponse } from "next/server";

import { aiService } from "../../lib/aiService";

export async function GET() {
  try {
    const status = aiService.getStatus();

    return NextResponse.json({
      status: "success",
      data: {
        isMockMode: status.isMockMode,
        hasOpenAIKey: status.hasOpenAIKey,
        requestCount: status.requestCount,
        message: status.isMockMode
          ? "AI service is running in mock mode. Set OPENAI_API_KEY to enable real AI integration."
          : "AI service is running with OpenAI integration.",
      },
    });
  } catch (error) {
    console.error("AI Status API error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: "Failed to get AI service status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      skillName,
      contextText,
      sourceSkill,
      targetSkill,
      candidateExperience,
      companyCulture,
      teamSize,
    } = body;

    if (action === "test-skill-context" && skillName && contextText) {
      const result = await aiService.analyzeSkillContext(
        skillName,
        contextText
      );

      return NextResponse.json({
        status: "success",
        data: {
          action: "test-skill-context",
          result,
          serviceStatus: aiService.getStatus(),
        },
      });
    }

    if (action === "test-learning-assessment" && skillName) {
      const result = await aiService.assessLearningPotential(
        skillName,
        "Software developer with 3 years of experience"
      );

      return NextResponse.json({
        status: "success",
        data: {
          action: "test-learning-assessment",
          result,
          serviceStatus: aiService.getStatus(),
        },
      });
    }

    if (
      action === "test-skill-transferability" &&
      sourceSkill &&
      targetSkill &&
      candidateExperience
    ) {
      const result = await aiService.analyzeSkillTransferability(
        sourceSkill,
        targetSkill,
        candidateExperience
      );

      return NextResponse.json({
        status: "success",
        data: {
          action: "test-skill-transferability",
          result,
          serviceStatus: aiService.getStatus(),
        },
      });
    }

    if (
      action === "test-cultural-fit" &&
      candidateExperience &&
      companyCulture &&
      teamSize
    ) {
      const result = await aiService.assessCulturalFit(
        candidateExperience,
        companyCulture,
        teamSize
      );

      return NextResponse.json({
        status: "success",
        data: {
          action: "test-cultural-fit",
          result,
          serviceStatus: aiService.getStatus(),
        },
      });
    }

    return NextResponse.json(
      {
        status: "error",
        error: "Invalid action or missing parameters",
        details:
          "Supported actions: test-skill-context, test-learning-assessment, test-skill-transferability, test-cultural-fit",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("AI Test API error:", error);

    return NextResponse.json(
      {
        status: "error",
        error: "AI test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
