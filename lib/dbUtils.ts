import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AnalysisResultData {
  request_id: string;
  pillar: string;
  score: number;
  raw_data: unknown;
  insights: string;
  recommendations: string[];
  analyzed: boolean;
  error_message?: string | null;
}

interface AnalysisMetadataUpdate {
  extracted_data?: unknown;
  total_score?: number;
  analysis_duration?: number;
  status?: string;
  overall_score?: number;
  overall_grade?: string;
}

export class DatabaseOperations {
  /**
   * Insert analysis result for a specific pillar
   */
  static async insertAnalysisResult(data: AnalysisResultData) {
    const { error } = await supabase
      .from('analysis_results')
      .insert(data);

    if (error) {
      throw new Error(`Failed to store ${data.pillar} results: ${error.message}`);
    }
  }

  /**
   * Update analysis metadata
   */
  static async updateAnalysisMetadata(requestId: string, updates: AnalysisMetadataUpdate) {
    const { error } = await supabase
      .from('analysis_metadata')
      .update(updates)
      .eq('request_id', requestId);

    if (error) {
      throw new Error(`Failed to update analysis metadata: ${error.message}`);
    }
  }

  /**
   * Update analysis request status
   */
  static async updateAnalysisStatus(
    requestId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed',
    completedAt?: string
  ) {
    const updateData: { status: string; completed_at?: string } = { status };
    if (completedAt || status === 'completed') {
      updateData.completed_at = completedAt || new Date().toISOString();
    }

    console.log(`[DB] Updating status for ${requestId}:`, updateData);

    const { error, data } = await supabase
      .from('analysis_requests')
      .update(updateData)
      .eq('id', requestId)
      .select();

    if (error) {
      console.error(`[DB] Failed to update status:`, error);
      throw new Error(`Failed to update analysis status: ${error.message}`);
    }

    console.log(`[DB] Status updated successfully:`, data);
  }

  /**
   * Get analysis results for a request
   */
  static async getAnalysisResults(requestId: string) {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('pillar, score, analyzed, insights, recommendations')
      .eq('request_id', requestId)
      .eq('analyzed', true);

    if (error) {
      throw new Error(`Failed to fetch analysis results: ${error.message}`);
    }

    return data;
  }

  /**
   * Get analysis request by ID
   */
  static async getAnalysisRequest(requestId: string) {
    const { data, error } = await supabase
      .from('analysis_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error || !data) {
      throw new Error('Analysis request not found');
    }

    return data;
  }

  /**
   * Check for recent analysis to prevent spam
   */
  static async checkRecentAnalysis(url: string, minutesAgo: number = 5) {
    const { data } = await supabase
      .from('analysis_requests')
      .select('id')
      .eq('url', url)
      .gte('created_at', new Date(Date.now() - minutesAgo * 60 * 1000).toISOString())
      .single();

    return data;
  }

  /**
   * Create analysis request with metadata
   */
  static async createAnalysisRequest(url: string, email: string) {
    // Create analysis request
    const { data: analysisRequest, error: insertError } = await supabase
      .from('analysis_requests')
      .insert({
        url,
        email,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create analysis request: ${insertError.message}`);
    }

    // Create analysis metadata
    const { error: metadataError } = await supabase
      .from('analysis_metadata')
      .insert({
        request_id: analysisRequest.id,
        created_at: new Date().toISOString(),
      });

    if (metadataError) {
      console.error('Failed to create analysis metadata:', metadataError);
      // Don't throw error here, analysis can still proceed
    }

    return analysisRequest;
  }
}