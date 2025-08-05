"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { siteData } from "../../data/siteData";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  Globe,
  Lightbulb,
  Target,
  Square,
} from "lucide-react";
import {
  scoreToGrade,
  getGradeColor,
  getGradeDescription,
  calculateOverallGrade,
} from "@/lib/gradeUtils";

interface AnalysisStatus {
  id: string;
  url: string;
  email: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  overallScore?: number | string;
  analysisDuration?: number;
  pillars?: {
    [key: string]: {
      score: number;
      analyzed: boolean;
      insights?: string[];
      recommendations?: string[];
    };
  };
}

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnalysisStatus = async () => {
      try {
        const response = await fetch(`/api/analyze/status/${id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAnalysis(data);

        // If analysis is still in progress, set up polling
        if (data.status === "pending" || data.status === "processing") {
          setTimeout(fetchAnalysisStatus, 10000); // Poll every 10 seconds
        }
      } catch (err) {
        console.error("Error fetching analysis status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analysis"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisStatus();

    // Poll for updates if analysis is not complete
    const interval = setInterval(() => {
      if (analysis?.status === "pending" || analysis?.status === "processing") {
        fetchAnalysisStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, analysis?.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case "failed":
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case "processing":
        return <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Analysis Complete";
      case "failed":
        return "Analysis Failed";
      case "processing":
        return "Analysis in Progress";
      default:
        return "Analysis Queued";
    }
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-white min-h-screen">
        <Header title={siteData.brand.name} />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-300">Loading report...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-slate-900 text-white min-h-screen">
        <Header title={siteData.brand.name} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="heading-lg text-white mb-4">Report Not Found</h1>
            <p className="text-slate-300 mb-6">
              {error || "The requested analysis report could not be found."}
            </p>
            <Link href="/" className="button-3d inline-block">
              <span className="button_top">Back to Home</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <Header title={siteData.brand.name} />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="heading-xl text-white mb-4 font-retro">
            Website Analysis Report
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-slate-400" />
            <a
              href={analysis.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
            >
              {analysis.url}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {getStatusIcon(analysis.status)}
            <h2 className="heading-md text-white font-retro">
              {getStatusText(analysis.status)}
            </h2>
          </div>

          {/* Progress Bar */}
          {(analysis.status === "pending" ||
            analysis.status === "processing") && (
            <div className="mb-4">
              <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${analysis.progress}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm text-center mt-2">
                {analysis.progress}% complete
              </p>
            </div>
          )}

          {/* Overall Score */}
          {analysis.status === "completed" &&
            analysis.overallScore !== undefined && (
              <div className="text-center">
                {(() => {
                  // Calculate overall grade the same way as email
                  const scores = analysis.pillars
                    ? Object.values(analysis.pillars)
                        .filter((pillar) => pillar.analyzed)
                        .map((pillar) => pillar.score)
                    : [];

                  const overallGrade =
                    scores.length > 0
                      ? calculateOverallGrade(scores)
                      : scoreToGrade(Number(analysis.overallScore));

                  return (
                    <>
                      <div
                        className={`text-6xl font-bold mb-2 ${getGradeColor(
                          overallGrade
                        )}`}
                      >
                        {overallGrade}
                      </div>
                      <p
                        className={`text-slate-300 text-lg ${getGradeColor(
                          overallGrade
                        )}`}
                      >
                        {getGradeDescription(overallGrade)}
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

          {/* Error Message */}
          {analysis.status === "failed" && analysis.errorMessage && (
            <div className="bg-red-900/50 border border-red-700 rounded p-4 text-center">
              <p className="text-red-300">{analysis.errorMessage}</p>
            </div>
          )}
        </div>

        {/* Pillars Section */}
        {analysis.status === "completed" && analysis.pillars && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analysis.pillars).map(
              ([pillarName, pillarData]) => (
                <div
                  key={pillarName}
                  className="bg-slate-800 rounded-lg border border-slate-700 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="heading-sm text-white capitalize font-retro">
                      {pillarName}
                    </h3>
                    <div
                      className={`text-2xl font-bold ${getGradeColor(
                        scoreToGrade(pillarData.score)
                      )}`}
                    >
                      {scoreToGrade(pillarData.score)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pillarData.score >= 90
                            ? "bg-green-500"
                            : pillarData.score >= 80
                            ? "bg-blue-500"
                            : pillarData.score >= 70
                            ? "bg-yellow-500"
                            : pillarData.score >= 60
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${pillarData.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Insights */}
                  {pillarData.insights && (
                    <div className="mb-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-blue-400" />
                        Key Insights:
                      </h4>
                      <div className="text-slate-300 text-sm">
                        {Array.isArray(pillarData.insights) ? (
                          <ul className="space-y-1">
                            {pillarData.insights.map((insight, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-400 mt-1">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            {pillarData.insights}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {pillarData.recommendations && (
                    <div>
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-yellow-400" />
                        Recommendations:
                      </h4>
                      <div className="text-slate-300 text-sm">
                        {Array.isArray(pillarData.recommendations) ? (
                          <ul className="space-y-1">
                            {pillarData.recommendations.map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Square className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="flex items-start gap-2">
                            <Square className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            {pillarData.recommendations}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Action Buttons */}
        {analysis.status === "completed" && (
          <div className="text-center mt-8">
            <Link href="/" className="button-3d inline-block mr-4">
              <span className="button_top">Analyze Another Site</span>
            </Link>

            <button
              onClick={() => window.print()}
              className="button-3d inline-block"
            >
              <span className="button_top">Print Report</span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
