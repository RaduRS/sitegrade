-- SiteGrade Automation Database Schema
-- Run this in your Supabase Query Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analysis requests table
CREATE TABLE IF NOT EXISTS analysis_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  report_url TEXT,
  error_message TEXT
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES analysis_requests(id) ON DELETE CASCADE,
  pillar TEXT NOT NULL CHECK (pillar IN ('performance', 'design', 'responsiveness', 'seo', 'security', 'compliance', 'analytics')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  raw_data JSONB,
  insights TEXT,
  recommendations TEXT[],
  analyzed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis metadata
CREATE TABLE IF NOT EXISTS analysis_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES analysis_requests(id) ON DELETE CASCADE,
  screenshot_url TEXT,
  lighthouse_report_url TEXT,
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  analysis_duration INTEGER, -- in seconds
  extracted_data JSONB, -- Store Puppeteer extracted data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_requests_status ON analysis_requests(status);
CREATE INDEX IF NOT EXISTS idx_analysis_requests_created_at ON analysis_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_request_id ON analysis_results(request_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_pillar ON analysis_results(pillar);
CREATE INDEX IF NOT EXISTS idx_analysis_metadata_request_id ON analysis_metadata(request_id);

-- Row Level Security (RLS) policies
ALTER TABLE analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_metadata ENABLE ROW LEVEL SECURITY;

-- Allow public read access to completed analyses (for report viewing)
CREATE POLICY "Public read access to completed analyses" ON analysis_requests
  FOR SELECT USING (status = 'completed');

CREATE POLICY "Public read access to analysis results" ON analysis_results
  FOR SELECT USING (true);

CREATE POLICY "Public read access to analysis metadata" ON analysis_metadata
  FOR SELECT USING (true);

-- Allow service role full access (for API operations)
CREATE POLICY "Service role full access to analysis_requests" ON analysis_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to analysis_results" ON analysis_results
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to analysis_metadata" ON analysis_metadata
  FOR ALL USING (auth.role() = 'service_role');

-- Function to calculate overall score
CREATE OR REPLACE FUNCTION calculate_overall_score(request_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_score NUMERIC;
BEGIN
  SELECT AVG(score) INTO avg_score
  FROM analysis_results
  WHERE request_id = request_uuid AND analyzed = true AND score IS NOT NULL;
  
  RETURN COALESCE(ROUND(avg_score), 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update analysis request status
CREATE OR REPLACE FUNCTION update_analysis_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the analysis_requests table when all pillars are analyzed
  UPDATE analysis_requests
  SET 
    status = CASE 
      WHEN (
        SELECT COUNT(*) 
        FROM analysis_results 
        WHERE request_id = NEW.request_id AND analyzed = true
      ) >= 6 THEN 'completed' -- All 6 pillars: Performance, Design, Responsiveness, SEO, Security, Compliance
      ELSE 'processing'
    END,
    completed_at = CASE 
      WHEN (
        SELECT COUNT(*) 
        FROM analysis_results 
        WHERE request_id = NEW.request_id AND analyzed = true
      ) >= 6 THEN NOW()
      ELSE completed_at
    END
  WHERE id = NEW.request_id;
  
  -- Update total score in metadata
  UPDATE analysis_metadata
  SET total_score = calculate_overall_score(NEW.request_id)
  WHERE request_id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update status when analysis results are inserted/updated
CREATE TRIGGER update_analysis_status_trigger
  AFTER INSERT OR UPDATE ON analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_status();

-- Insert sample data for testing (optional)
-- INSERT INTO analysis_requests (url, email) VALUES 
--   ('https://example.com', 'test@example.com');