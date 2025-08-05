// Grade system utilities based on the grade calculator logic

export const GRADES = [
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

export const OVERALL_GRADES = [
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

export type Grade = (typeof GRADES)[number];
export type OverallGrade = (typeof OVERALL_GRADES)[number];

// Convert numerical score (0-100) to letter grade
export function scoreToGrade(score: number): Grade {
  // Ensure score is within bounds
  const normalizedScore = Math.max(0, Math.min(100, score));
  
  // Convert to grade based on standard grading scale
  if (normalizedScore >= 97) return "A";
  if (normalizedScore >= 93) return "A-";
  if (normalizedScore >= 90) return "B+";
  if (normalizedScore >= 87) return "B";
  if (normalizedScore >= 83) return "B-";
  if (normalizedScore >= 80) return "C+";
  if (normalizedScore >= 77) return "C";
  if (normalizedScore >= 73) return "C-";
  if (normalizedScore >= 70) return "D+";
  if (normalizedScore >= 67) return "D";
  if (normalizedScore >= 60) return "D-";
  return "F";
}

// Get grade color for styling (consistent with grade calculator)
export function getGradeColor(grade: OverallGrade | Grade | null): string {
  if (!grade) return "text-slate-400";

  if (grade === "A+" || grade === "A") return "text-green-400";
  if (grade === "A-" || grade === "B+") return "text-green-300";
  if (grade === "B" || grade === "B-") return "text-yellow-400";
  if (grade === "C+" || grade === "C") return "text-orange-400";
  if (grade === "C-" || grade === "D+") return "text-orange-500";
  if (grade === "D" || grade === "D-") return "text-red-400";
  return "text-red-500"; // F
}

// Get grade description
export function getGradeDescription(grade: Grade | OverallGrade): string {
  switch (grade) {
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
}

// Calculate overall grade from multiple scores
export function calculateOverallGrade(scores: number[]): OverallGrade {
  if (scores.length === 0) return "F";
  
  // Convert scores to grades first
  const grades = scores.map(scoreToGrade);
  
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
  
  // Special case: if all grades are 'A', return 'A+'
  if (grades.every((grade) => grade === "A")) {
    return "A+";
  }

  // Calculate average
  const total = grades.reduce((sum, grade) => sum + gradeValues[grade], 0);
  const average = total / grades.length;

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