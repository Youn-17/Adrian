import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// 服务端使用service role key，拥有完整权限
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 客户端使用的anon key
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

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