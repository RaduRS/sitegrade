# SiteGrade MVP Setup Guide

This guide will help you set up the MVP version of SiteGrade with the core functionality implemented.

## Features Implemented

### ✅ Database Setup (Supabase)
- Complete schema with tables for analysis requests, results, and metadata
- Row Level Security (RLS) policies
- Automatic triggers for status updates and score calculations
- PostgreSQL functions for data processing

### ✅ Data Extraction Engine
- Puppeteer-based web scraping
- Screenshot capture
- Meta data extraction (title, description, headings, etc.)
- Performance metrics collection
- Cookie and script analysis

### ✅ Performance Pillar
- Google PageSpeed Insights API integration
- Lighthouse scores extraction
- Core Web Vitals analysis
- Fallback analysis using extracted data
- Performance insights and recommendations

### ✅ Basic SEO & Security Analysis
- SEO: Meta tags, headings structure, image alt texts
- Security: HTTPS check, mixed content detection, cookie security

### ✅ Email Notifications
- Analysis started notifications
- Completion notifications with results
- Error notifications
- HTML and plain text templates

### ✅ API Endpoints
- `/api/analyze/submit` - Submit analysis requests
- `/api/analyze/process` - Process analysis (internal)
- `/api/analyze/status/[id]` - Check analysis status

### ✅ Frontend Components
- Analysis form with validation
- Real-time status tracking
- Progress visualization
- Results display

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `database/schema.sql`
4. Run the query to create all tables, functions, and policies

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your configuration:

```bash
# Supabase (from your project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend (sign up at resend.com)
RESEND_API_KEY=re_your_api_key

# Google PageSpeed Insights (get from Google Cloud Console)
PAGESPEED_API_KEY=your_google_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

### 5. Test the MVP

Visit `http://localhost:3000/test` to access the testing interface.

## API Usage

### Submit Analysis
```bash
curl -X POST http://localhost:3000/api/analyze/submit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "email": "test@example.com"}'
```

### Check Status
```bash
curl http://localhost:3000/api/analyze/status/[request-id]
```

## Database Queries

### View Analysis Requests
```sql
SELECT * FROM analysis_requests ORDER BY created_at DESC;
```

### View Analysis Results
```sql
SELECT 
  ar.url,
  ar.status,
  ar.created_at,
  am.total_score,
  res.pillar,
  res.score,
  res.analyzed
FROM analysis_requests ar
LEFT JOIN analysis_metadata am ON ar.id = am.request_id
LEFT JOIN analysis_results res ON ar.id = res.request_id
ORDER BY ar.created_at DESC;
```

### View Performance Metrics
```sql
SELECT 
  ar.url,
  res.score as performance_score,
  res.insights,
  res.recommendations
FROM analysis_requests ar
JOIN analysis_results res ON ar.id = res.request_id
WHERE res.pillar = 'performance'
AND res.analyzed = true
ORDER BY res.score DESC;
```

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Database      │
│                 │    │                  │    │                 │
│ AnalysisForm    │───▶│ /submit          │───▶│ analysis_       │
│ AnalysisStatus  │    │ /process         │    │ requests        │
│                 │    │ /status/[id]     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Services       │
                       │                  │
                       │ DataExtraction   │
                       │ PerformanceAnalyzer│
                       │ EmailService     │
                       └──────────────────┘
```

## Next Steps

1. **Enhanced Analysis**: Implement Responsiveness and Design pillars
2. **AI Integration**: Add AI-powered insights using OpenAI/Claude
3. **Compliance Checks**: Implement GDPR and legal compliance analysis
4. **PDF Reports**: Generate downloadable reports
5. **Queue System**: Add Redis-based queue for scalability
6. **Dashboard**: Create admin dashboard for monitoring

## Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**
   - Install Chrome/Chromium dependencies
   - Check system permissions

2. **Database connection errors**
   - Verify Supabase URL and service role key
   - Check RLS policies are correctly set

3. **Email notifications not working**
   - Verify Resend API key
   - Check email templates and sender configuration

4. **PageSpeed API errors**
   - Verify Google API key
   - Check API quotas and limits

### Performance Optimization

- The current setup can handle ~100 analyses per hour
- For higher throughput, implement the Redis queue system
- Consider using Puppeteer clusters for parallel processing
- Monitor Supabase usage and upgrade plan if needed

## Cost Estimates (MVP)

- **Supabase**: Free tier (up to 50MB database)
- **Resend**: Free tier (100 emails/day)
- **Google PageSpeed**: Free (25,000 requests/day)
- **Vercel**: Free tier (hobby projects)

**Total**: $0/month for development and light usage