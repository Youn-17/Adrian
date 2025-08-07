import express from 'express'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 认证中间件
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' })
  }
}

// 获取用户的所有项目
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        papers:papers(count),
        datasets:datasets(count),
        analyses:analyses(count)
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取项目列表失败:', error)
      return res.status(500).json({ error: '获取项目列表失败' })
    }

    res.json({ projects })
  } catch (error) {
    console.error('获取项目列表错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 创建新项目
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { title, description, research_question, inclusion_criteria, exclusion_criteria } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: '项目标题和描述为必填项' })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        research_question,
        inclusion_criteria,
        exclusion_criteria,
        user_id: req.user.userId,
        status: 'planning'
      })
      .select()
      .single()

    if (error) {
      console.error('创建项目失败:', error)
      return res.status(500).json({ error: '创建项目失败' })
    }

    res.status(201).json({ project })
  } catch (error) {
    console.error('创建项目错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取单个项目详情
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        papers:papers(*),
        datasets:datasets(*),
        analyses:analyses(*)
      `)
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single()

    if (error || !project) {
      return res.status(404).json({ error: '项目不存在或无权访问' })
    }

    res.json({ project })
  } catch (error) {
    console.error('获取项目详情错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新项目
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { title, description, research_question, inclusion_criteria, exclusion_criteria, status } = req.body

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        research_question,
        inclusion_criteria,
        exclusion_criteria,
        status
      })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single()

    if (error) {
      console.error('更新项目失败:', error)
      return res.status(500).json({ error: '更新项目失败' })
    }

    if (!project) {
      return res.status(404).json({ error: '项目不存在或无权访问' })
    }

    res.json({ project })
  } catch (error) {
    console.error('更新项目错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除项目
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.userId)

    if (error) {
      console.error('删除项目失败:', error)
      return res.status(500).json({ error: '删除项目失败' })
    }

    res.json({ message: '项目删除成功' })
  } catch (error) {
    console.error('删除项目错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取项目统计信息
router.get('/:id/stats', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    // 验证项目所有权
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .single()

    if (!project) {
      return res.status(404).json({ error: '项目不存在或无权访问' })
    }

    // 获取统计信息
    const [papersResult, datasetsResult, analysesResult] = await Promise.all([
      supabase.from('papers').select('id', { count: 'exact' }).eq('project_id', id),
      supabase.from('datasets').select('id', { count: 'exact' }).eq('project_id', id),
      supabase.from('analyses').select('id', { count: 'exact' }).eq('project_id', id)
    ])

    const stats = {
      papers_count: papersResult.count || 0,
      datasets_count: datasetsResult.count || 0,
      analyses_count: analysesResult.count || 0
    }

    res.json({ stats })
  } catch (error) {
    console.error('获取项目统计信息错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router