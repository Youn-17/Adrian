import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vpskwctsseqdjdfoftwi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDgxODcsImV4cCI6MjA3MDEyNDE4N30.YddY3Im4BqNHgX1KVuKCw8Pn1KpPFuvjAXd3tAJpX_4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface User {
  id: string
  email: string
  name: string
  role: 'researcher' | 'senior_researcher' | 'admin'
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description?: string
  research_question?: string
  inclusion_criteria?: any
  exclusion_criteria?: any
  status: 'draft' | 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface Paper {
  id: string
  project_id: string
  title: string
  abstract?: string
  authors?: string
  journal?: string
  year?: number
  doi?: string
  keywords?: string
  status: 'pending' | 'included' | 'excluded' | 'reviewing'
  relevance_score: number
  created_at: string
}

export interface Dataset {
  id: string
  project_id: string
  filename: string
  file_path: string
  metadata?: any
  row_count: number
  status: 'uploaded' | 'validated' | 'processed' | 'error'
  uploaded_at: string
}

export interface Analysis {
  id: string
  project_id: string
  analysis_type: string
  config: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  error_message?: string
  started_at?: string
  completed_at?: string
}

export interface Result {
  id: string
  analysis_id: string
  result_type: string
  data?: any
  file_path?: string
  created_at: string
}

export interface PaperClassification {
  id: string
  paper_id: string
  category: string
  confidence: number
  method: string
  classified_at: string
}