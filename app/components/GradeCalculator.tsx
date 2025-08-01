"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Palette,
  Smartphone,
  Search,
  Shield,
  CheckCircle,
  BarChart3,
} from "lucide-react";

// Icon mapping
const iconMap = {
  Zap,
  Palette,
  Smartphone,
  Search,
  Shield,
  CheckCircle,
  BarChart3,
} as const;

// Grade system definition
const GRADES = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
] as const;
const OVERALL_GRADES = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
] as const;

type Grade = (typeof GRADES)[number];
type OverallGrade = (typeof OVERALL_GRADES)[number];

interface Pillar {
  name: string;
  description: string;
  icon: string;
}

interface GradeCalculatorProps {
  pillars: Pillar[];
}

// Grade to numeric value mapping for calculation
const gradeValues: Record<Grade, number> = {
  A: 12,
  "A-": 11,
  "B+": 10,
  B: 9,
  "B-": 8,
  "C+": 7,
  C: 6,
  "C-": 5,
  "D+": 4,
  D: 3,
  "D-": 2,
  F: 1,
};

// Calculate overall grade based on individual grades
function calculateOverallGrade(grades: (Grade | null)[]): OverallGrade | null {
  // Check if all grades are filled
  const validGrades = grades.filter((grade): grade is Grade => grade !== null);
  if (validGrades.length !== 7) return null;

  // Special case: if all grades are 'A', return 'A+'
  if (validGrades.every((grade) => grade === "A")) {
    return "A+";
  }

  // Calculate average
  const total = validGrades.reduce((sum, grade) => sum + gradeValues[grade], 0);
  const average = total / validGrades.length;

  // Map average to overall grade (excluding A+ since that's only for all A's)
  if (average >= 11.5) return "A";
  if (average >= 10.5) return "A-";
  if (average >= 9.5) return "B+";
  if (average >= 8.5) return "B";
  if (average >= 7.5) return "B-";
  if (average >= 6.5) return "C+";
  if (average >= 5.5) return "C";
  if (average >= 4.5) return "C-";
  if (average >= 3.5) return "D+";
  if (average >= 2.5) return "D";
  if (average >= 1.5) return "D-";
  return "F";
}

// Get grade color for styling
function getGradeColor(grade: OverallGrade | Grade | null): string {
  if (!grade) return "text-slate-400";

  if (grade === "A+" || grade === "A") return "text-green-400";
  if (grade === "A-" || grade === "B+") return "text-green-300";
  if (grade === "B" || grade === "B-") return "text-yellow-400";
  if (grade === "C+" || grade === "C") return "text-orange-400";
  if (grade === "C-" || grade === "D+") return "text-orange-500";
  if (grade === "D" || grade === "D-") return "text-red-400";
  return "text-red-500"; // F
}

export default function GradeCalculator({ pillars }: GradeCalculatorProps) {
  const [mounted, setMounted] = useState(false);
  const [grades, setGrades] = useState<(Grade | null)[]>(
    new Array(7).fill(null)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const overallGrade = useMemo(() => calculateOverallGrade(grades), [grades]);

  const handleGradeChange = (pillarIndex: number, grade: Grade) => {
    const newGrades = [...grades];
    newGrades[pillarIndex] = grade;
    setGrades(newGrades);
  };

  const resetCalculator = () => {
    setGrades(new Array(7).fill(null));
  };

  const MotionDiv = mounted ? motion.div : "div";

  return (
    <section className="py-12 px-4 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Overall Grade Display */}
        <MotionDiv
          className="text-center mb-12"
          {...(mounted && {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.6 },
          })}
        >
          <div className="bg-slate-800/50 border-2 border-slate-700 p-8 mb-6">
            <h1 className="text-2xl md:text-3xl font-mono text-amber-400 mb-4">
              Website Grade
            </h1>
            <div className="flex items-center justify-center">
              <div
                className={`text-6xl md:text-8xl font-bold font-mono ${getGradeColor(
                  overallGrade
                )}`}
                aria-live="polite"
                aria-label={
                  overallGrade
                    ? `Overall grade: ${overallGrade}`
                    : "Overall grade: Not calculated"
                }
              >
                {overallGrade || "?"}
              </div>
            </div>

            {/* Grade Meaning */}
            {overallGrade && (
              <div className="mt-4">
                <p
                  className={`text-xl font-mono font-bold ${getGradeColor(
                    overallGrade
                  )}`}
                >
                  {(() => {
                    switch (overallGrade) {
                      case "A+":
                        return "Perfect";
                      case "A":
                        return "Excellent";
                      case "A-":
                        return "Very Good";
                      case "B+":
                        return "Good";
                      case "B":
                        return "Solid";
                      case "B-":
                        return "Decent";
                      case "C+":
                        return "Fair";
                      case "C":
                        return "Average";
                      case "C-":
                        return "Below Average";
                      case "D+":
                        return "Below Standards";
                      case "D":
                        return "Significant Issues";
                      case "D-":
                        return "Major Problems";
                      case "F":
                        return "Critical Issues";
                      default:
                        return "";
                    }
                  })()}
                </p>
                <p className="text-slate-400 text-sm font-mono mt-2">
                  Based on 7 core web performance pillars
                </p>
              </div>
            )}

            {!overallGrade && (
              <div className="mt-4">
                <p className="text-slate-400 font-mono">
                  Grade all 7 pillars to see your overall score
                </p>
              </div>
            )}
          </div>
        </MotionDiv>

        {/* Grade Scale Reference */}
        <MotionDiv
          className="mb-12 bg-slate-800/30 border border-slate-700 p-6"
          {...(mounted && {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            transition: { delay: 0.3, duration: 0.5 },
          })}
        >
          <h3 className="text-lg font-mono text-amber-400 mb-4">
            Grade Scale Reference
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
            {OVERALL_GRADES.map((grade) => {
              const getGradeName = (g: string) => {
                switch (g) {
                  case "A+":
                    return "Perfect";
                  case "A":
                    return "Excellent";
                  case "A-":
                    return "Very Good";
                  case "B+":
                    return "Good";
                  case "B":
                    return "Solid";
                  case "B-":
                    return "Decent";
                  case "C+":
                    return "Fair";
                  case "C":
                    return "Average";
                  case "C-":
                    return "Below Average";
                  case "D+":
                    return "Below Standards";
                  case "D":
                    return "Significant Issues";
                  case "D-":
                    return "Major Problems";
                  case "F":
                    return "Critical Issues";
                  default:
                    return "";
                }
              };

              return (
                <div key={grade} className="flex items-center gap-2">
                  <span className={`font-bold ${getGradeColor(grade)}`}>
                    {grade}
                  </span>
                  <span className="text-slate-400">{getGradeName(grade)}</span>
                </div>
              );
            })}
          </div>
        </MotionDiv>

        {/* Pillar Grading Grid */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {pillars.map((pillar, index) => {
            const IconComponent = iconMap[pillar.icon as keyof typeof iconMap];
            const currentGrade = grades[index];

            return (
              <MotionDiv
                key={pillar.name}
                className="bg-slate-800/50 border border-slate-700 p-5"
                {...(mounted && {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.1, duration: 0.5 },
                })}
              >
                {/* Pillar Header */}
                <div className="flex items-start gap-3 mb-2">
                  <IconComponent className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-mono text-amber-400 mb-2">
                      {pillar.name}
                    </h3>
                  </div>
                </div>

                {/* Grade Selection */}
                <div>
                  {/* Grade Buttons */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
                    {GRADES.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => handleGradeChange(index, grade)}
                        className={`
                          px-3 py-3 font-mono font-bold text-sm border-2 transition-all duration-200
                          hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400
                          ${
                            currentGrade === grade
                              ? `${getGradeColor(
                                  grade
                                )} border-current bg-current/10`
                              : `text-slate-400 border-slate-600 hover:${getGradeColor(
                                  grade
                                )} hover:border-current hover:bg-current/10`
                          }
                        `}
                        aria-label={`Set ${pillar.name} grade to ${grade}`}
                        type="button"
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            );
          })}
        </div>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={resetCalculator}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 hover:border-slate-500 text-white font-mono transition-all duration-200 hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400"
            type="button"
            aria-label="Reset all grades"
          >
            Reset All Grades
          </button>
        </div>
      </div>
    </section>
  );
}
