"use client";

import { useState, useEffect } from "react";

import { Skill, SkillRelationship } from "../types/matching";
import { skills, skillRelationships } from "../data/skills";

interface KnowledgeGraphProps {
  selectedSkills?: string[];
  onSkillSelect?: (skillId: string) => void;
}

export default function KnowledgeGraph({
  selectedSkills = [],
  onSkillSelect,
}: KnowledgeGraphProps) {
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [relationships, setRelationships] = useState<SkillRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  useEffect(() => {
    // Load skills and relationships data from the data files
    const loadData = async () => {
      try {
        setSkillsData(skills);
        setRelationships(skillRelationships);
      } catch (error) {
        console.error("Failed to load knowledge graph data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getSkillColor = (skillId: string) => {
    if (selectedSkills.includes(skillId)) return "bg-blue-500 text-white";
    if (selectedSkill === skillId) return "bg-green-500 text-white";
    return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case "prerequisite":
        return "text-red-600";
      case "related":
        return "text-blue-600";
      case "alternative":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case "prerequisite":
        return "→";
      case "related":
        return "↔";
      case "alternative":
        return "≈";
      default:
        return "•";
    }
  };

  const handleSkillClick = (skillId: string) => {
    setSelectedSkill(skillId === selectedSkill ? null : skillId);
    onSkillSelect?.(skillId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Knowledge Graph</h2>

      {/* Skills Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {skillsData.map((skill) => (
            <button
              key={skill.id}
              onClick={() => handleSkillClick(skill.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getSkillColor(
                skill.id
              )}`}
            >
              {skill.canonicalName}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Skill Details */}
      {selectedSkill && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">
            Selected Skill Details
          </h4>
          {(() => {
            const skill = skillsData.find((s) => s.id === selectedSkill);
            if (!skill) return null;

            return (
              <div>
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900">
                    {skill.canonicalName}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Category: {skill.category}
                  </p>
                  <p className="text-sm text-gray-600">
                    Difficulty: Level {skill.difficultyLevel}/5
                  </p>
                  <p className="text-sm text-gray-600">
                    Time to proficiency: {skill.timeToProficiency} months
                  </p>
                </div>

                {skill.aliases.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Aliases:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {skill.aliases.map((alias, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                        >
                          {alias}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Relationships */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Skill Relationships
        </h3>
        <div className="space-y-3">
          {relationships.map((rel, index) => {
            const sourceSkill = skillsData.find(
              (s) => s.id === rel.sourceSkill
            );
            const targetSkill = skillsData.find(
              (s) => s.id === rel.targetSkill
            );

            if (!sourceSkill || !targetSkill) return null;

            return (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded"
              >
                <span className="font-medium text-gray-900">
                  {sourceSkill.canonicalName}
                </span>
                <span
                  className={`text-lg ${getRelationshipColor(
                    rel.relationshipType
                  )}`}
                >
                  {getRelationshipIcon(rel.relationshipType)}
                </span>
                <span className="font-medium text-gray-900">
                  {targetSkill.canonicalName}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {Math.round(rel.strength * 100)}% strength
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${getRelationshipColor(
                    rel.relationshipType
                  )} bg-opacity-10`}
                >
                  {rel.relationshipType}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Skill States:</h5>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span>Selected for matching</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span>Currently selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                <span>Available</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">
              Relationship Types:
            </h5>
            <div className="space-y-1">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">→</span>
                <span>Prerequisite</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">↔</span>
                <span>Related</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">≈</span>
                <span>Alternative</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
