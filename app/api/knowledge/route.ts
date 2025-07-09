import { NextRequest, NextResponse } from "next/server";

import { skillNormalizer } from "../../lib/skillNormalizer";
import { skills, skillRelationships } from "../../data/skills";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get("skillId");
    const relationshipType = searchParams.get("type");

    if (skillId) {
      // Get knowledge graph for a specific skill
      const skill = skillNormalizer.getSkillById(skillId);
      if (!skill) {
        return NextResponse.json(
          { error: `Skill with ID ${skillId} not found` },
          { status: 404 }
        );
      }

      const relatedSkills = skillNormalizer.getRelatedSkills(skillId);
      const relationships = skillRelationships.filter(
        (rel) => rel.sourceSkill === skillId || rel.targetSkill === skillId
      );

      return NextResponse.json({
        skill,
        relatedSkills,
        relationships,
      });
    }

    if (relationshipType) {
      // Get relationships by type
      const filteredRelationships = skillRelationships.filter(
        (rel) => rel.relationshipType === relationshipType
      );
      return NextResponse.json({ relationships: filteredRelationships });
    }

    // Get full knowledge graph
    return NextResponse.json({
      skills,
      relationships: skillRelationships,
      totalSkills: skills.length,
      totalRelationships: skillRelationships.length,
    });
  } catch (error) {
    console.error("Knowledge API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Knowledge API failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill1Id, skill2Id } = body;

    if (!skill1Id || !skill2Id) {
      return NextResponse.json(
        { error: "Both skill1Id and skill2Id are required" },
        { status: 400 }
      );
    }

    // Check if skills are related
    const areRelated = skillNormalizer.areSkillsRelated(skill1Id, skill2Id);

    // Get relationship details if they exist
    const relationship = skillRelationships.find(
      (rel) =>
        (rel.sourceSkill === skill1Id && rel.targetSkill === skill2Id) ||
        (rel.sourceSkill === skill2Id && rel.targetSkill === skill1Id)
    );

    return NextResponse.json({
      areRelated,
      relationship,
      skill1: skillNormalizer.getSkillById(skill1Id),
      skill2: skillNormalizer.getSkillById(skill2Id),
    });
  } catch (error) {
    console.error("Knowledge API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Knowledge API failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
