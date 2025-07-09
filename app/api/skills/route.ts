import { NextRequest, NextResponse } from "next/server";

import { skillNormalizer } from "../../lib/skillNormalizer";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const skillId = searchParams.get("skillId");
    const search = searchParams.get("search");

    if (skillId) {
      // Get specific skill by ID
      const skill = skillNormalizer.getSkillById(skillId);
      if (!skill) {
        return NextResponse.json(
          { error: `Skill with ID ${skillId} not found` },
          { status: 404 }
        );
      }
      return NextResponse.json({ skill });
    }

    if (category) {
      // Get skills by category
      const skills = skillNormalizer.getSkillsByCategory(category);
      return NextResponse.json({ skills });
    }

    if (search) {
      // Search skills by name
      const allSkills = skillNormalizer.getAllSkills();
      const matchingSkills = allSkills.filter(
        (skill) =>
          skill.canonicalName.toLowerCase().includes(search.toLowerCase()) ||
          skill.aliases.some((alias) =>
            alias.toLowerCase().includes(search.toLowerCase())
          )
      );
      return NextResponse.json({ skills: matchingSkills });
    }

    // Get all skills
    const skills = skillNormalizer.getAllSkills();
    return NextResponse.json({ skills });
  } catch (error) {
    console.error("Skills API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Skills API failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text field is required" },
        { status: 400 }
      );
    }

    // Extract skills from text
    const extractedSkills = skillNormalizer.extractSkillsFromText(text);

    return NextResponse.json({
      extractedSkills,
      count: extractedSkills.length,
    });
  } catch (error) {
    console.error("Skills extraction API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Skills extraction failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
