'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { scoreToGrade, calculateOverallGrade, getGradeColor, getGradeDescription } from '@/lib/gradeUtils';

interface PillarResult {
  score: number;
  analyzed: boolean;
  insights: string;
  recommendations: string[];
  error?: string;
}

interface AnalysisStatusData {
  id: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  overallScore?: number;
  analysisDuration?: number;
  pillars: {
    [key: string]: PillarResult;
  };
  estimatedTimeRemaining: number;
}

interface AnalysisStatusProps {
  requestId: string;
  onComplete?: (data: AnalysisStatusData) => void;
}

export default function AnalysisStatus({ requestId, onComplete }: AnalysisStatusProps) {
  const [data, setData] = useState<AnalysisStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/analyze/status/${requestId}`);
        const statusData = await response.json();

        if (!response.ok) {
          throw new Error(statusData.error || 'Failed to fetch status');
        }

        setData(statusData);
        setError('');

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          if (onComplete) {
            onComplete(statusData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 5 seconds if still processing
    const interval = setInterval(() => {
      if (data?.status === 'processing' || data?.status === 'pending') {
        fetchStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [requestId, data?.status, onComplete]);

  if (loading && !data) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="flex items-center justify-center"
          >
            <Loader2 className="h-12 w-12 text-blue-400" />
          </motion.div>
          <span className="text-slate-300 text-lg font-medium">Loading analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
        <div className="p-3 bg-red-900 border border-red-600 text-red-300 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'processing': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };



  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg shadow-md border border-slate-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Analysis Status</h2>
        <p className="text-slate-300">URL: {data.url}</p>
        <p className={`font-medium ${getStatusColor(data.status)}`}>
          Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          <span>Progress</span>
          <span>{data.progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${data.progress}%` }}
          ></div>
        </div>
        {data.estimatedTimeRemaining > 0 && (
          <p className="text-sm text-slate-400 mt-1">
            Estimated time remaining: {Math.ceil(data.estimatedTimeRemaining / 60)} minutes
          </p>
        )}
      </div>

      {/* Overall Grade - Only show when analysis is complete */}
      {data.status === 'completed' && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <h3 className="text-lg font-semibold mb-2 text-white">Overall Score</h3>
          {(() => {
            const scores = Object.values(data.pillars)
              .filter(pillar => pillar.analyzed)
              .map(pillar => pillar.score);
            
            // Use calculated grade from analyzed pillars if available, otherwise use stored overall score
            const overallGrade = scores.length > 0 ? calculateOverallGrade(scores) : 
                               data.overallScore !== undefined ? scoreToGrade(data.overallScore) : null;
            
            if (!overallGrade) {
              return (
                <div className="flex items-center justify-center gap-4 py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="h-10 w-10 text-blue-400" />
                  </motion.div>
                  <span className="text-slate-300 text-lg font-medium">Calculating...</span>
                </div>
              );
            }
            
            return (
              <div className="flex items-center gap-3">
                <div className={`text-4xl font-bold font-mono ${getGradeColor(overallGrade)}`}>
                  {overallGrade}
                </div>
                <div className={`text-lg font-medium ${getGradeColor(overallGrade)}`}>
                  {getGradeDescription(overallGrade)}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Spinner while analysis is in progress */}
      {data.status !== 'completed' && data.status !== 'failed' && (
        <div className="mb-6 p-6 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <span className="text-slate-300 text-lg font-medium">Analysis in progress...</span>
          </div>
        </div>
      )}

      {/* Pillar Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
        {Object.entries(data.pillars).map(([pillar, result]) => (
          <div key={pillar} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium capitalize text-white">{pillar}</h4>
              {result.analyzed ? (
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold font-mono ${getGradeColor(scoreToGrade(result.score))}`}>
                    {scoreToGrade(result.score)}
                  </span>
                  <span className={`text-sm font-medium ${getGradeColor(scoreToGrade(result.score))}`}>
                    {getGradeDescription(scoreToGrade(result.score))}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">
                  {result.error ? 'Failed' : 'Pending...'}
                </span>
              )}
            </div>
            
            {result.analyzed && (
              <>
                <p className="text-slate-300 mb-2">{result.insights}</p>
                {result.recommendations.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-1 text-white">Recommendations:</h5>
                    <ul className="text-sm text-slate-300 list-disc list-inside">
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            
            {result.error && (
              <p className="text-red-400 text-sm">{result.error}</p>
            )}
          </div>
        ))}
      </div>

      {data.errorMessage && (
        <div className="mt-4 p-3 bg-red-900 border border-red-600 text-red-300 rounded">
          {data.errorMessage}
        </div>
      )}
    </div>
  );
}