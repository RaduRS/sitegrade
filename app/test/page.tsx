'use client';

import { useState } from 'react';
import AnalysisForm from '../../components/AnalysisForm';
import AnalysisStatus from '../../components/AnalysisStatus';

export default function TestPage() {
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const handleAnalysisSubmit = (requestId: string) => {
    setCurrentRequestId(requestId);
  };

  const handleAnalysisComplete = () => {
    // Could add completion logic here
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          SiteGrade Analysis Test
        </h1>
        
        <div className="space-y-8">
          {/* Analysis Form */}
          <AnalysisForm onSubmit={handleAnalysisSubmit} />
          
          {/* Analysis Status */}
          {currentRequestId && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Analysis Progress
              </h2>
              <AnalysisStatus 
                requestId={currentRequestId} 
                onComplete={handleAnalysisComplete}
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}