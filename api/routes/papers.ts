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

// 项目所有权验证中间件
const verifyProjectOwnership = async (req: any, res: any, next: any) => {
  try {
    const { project_id } = req.body
    if (!project_id) {
      return res.status(400).json({ error: '缺少项目ID' })
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', req.user.userId)
      .single()

    if (!project) {
      return res.status(403).json({ error: '无权访问该项目' })
    }

    next()
  } catch (error) {
    console.error('验证项目所有权错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}

// 获取项目的所有论文
router.get('/project/:projectId', authenticateToken, async (req: any, res) => {
  try {
    const { projectId } = req.params

    // 验证项目所有权
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', req.user.userId)
      .single()

    if (!project) {
      return res.status(403).json({ error: '无权访问该项目' })
    }

    const { data: papers, error } = await supabase
      .from('papers')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取论文列表失败:', error)
      return res.status(500).json({ error: '获取论文列表失败' })
    }

    res.json({ papers })
  } catch (error) {
    console.error('获取论文列表错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 添加论文到项目
router.post('/', authenticateToken, verifyProjectOwnership, async (req: any, res) => {
  try {
    const {
      project_id,
      title,
      authors,
      journal,
      year,
      doi,
      abstract,
      keywords,
      full_text_url,
      pdf_url
    } = req.body

    if (!title || !authors) {
      return res.status(400).json({ error: '论文标题和作者为必填项' })
    }

    const { data: paper, error } = await supabase
      .from('papers')
      .insert({
        project_id,
        title,
        authors,
        journal,
        year,
        doi,
        abstract,
        keywords,
        full_text_url,
        pdf_url,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('添加论文失败:', error)
      return res.status(500).json({ error: '添加论文失败' })
    }

    res.status(201).json({ paper })
  } catch (error) {
    console.error('添加论文错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 搜索论文（模拟外部数据库搜索）
router.post('/search', authenticateToken, async (req: any, res) => {
  try {
    const { query, database = 'pubmed', limit = 20 } = req.body

    if (!query) {
      return res.status(400).json({ error: '搜索关键词为必填项' })
    }

    // 模拟搜索结果
    const mockResults = [
      {
        title: `Meta-analysis of ${query} in educational research`,
        authors: ['Smith, J.', 'Johnson, A.', 'Brown, K.'],
        journal: 'Educational Psychology Review',
        year: 2023,
        doi: '10.1007/s10648-023-09123-4',
        abstract: `This meta-analysis examines the effects of ${query} on student learning outcomes...`,
        keywords: [query, 'education', 'meta-analysis', 'learning outcomes'],
        database: database
      },
      {
        title: `The impact of ${query} on academic achievement`,
        authors: ['Davis, M.', 'Wilson, R.'],
        journal: 'Journal of Educational Research',
        year: 2022,
        doi: '10.1080/00220671.2022.2089456',
        abstract: `This study investigates how ${query} influences academic performance...`,
        keywords: [query, 'academic achievement', 'education'],
        database: database
      }
    ]

    res.json({ results: mockResults.slice(0, limit) })
  } catch (error) {
    console.error('搜索论文错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 批量导入论文
router.post('/import', authenticateToken, verifyProjectOwnership, async (req: any, res) => {
  try {
    const { project_id, papers } = req.body

    if (!Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: '论文列表不能为空' })
    }

    const papersToInsert = papers.map(paper => ({
      ...paper,
      project_id,
      status: 'pending'
    }))

    const { data: insertedPapers, error } = await supabase
      .from('papers')
      .insert(papersToInsert)
      .select()

    if (error) {
      console.error('批量导入论文失败:', error)
      return res.status(500).json({ error: '批量导入论文失败' })
    }

    res.status(201).json({ papers: insertedPapers, count: insertedPapers.length })
  } catch (error) {
    console.error('批量导入论文错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 更新论文状态
router.put('/:id/status', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { status, exclusion_reason } = req.body

    if (!['pending', 'included', 'excluded'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' })
    }

    // 验证论文所有权
    const { data: paper } = await supabase
      .from('papers')
      .select('project_id')
      .eq('id', id)
      .single()

    if (!paper) {
      return res.status(404).json({ error: '论文不存在' })
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', paper.project_id)
      .eq('user_id', req.user.userId)
      .single()

    if (!project) {
      return res.status(403).json({ error: '无权访问该论文' })
    }

    const { data: updatedPaper, error } = await supabase
      .from('papers')
      .update({ status, exclusion_reason })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新论文状态失败:', error)
      return res.status(500).json({ error: '更新论文状态失败' })
    }

    res.json({ paper: updatedPaper })
  } catch (error) {
    console.error('更新论文状态错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除论文
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    // 验证论文所有权
    const { data: paper } = await supabase
      .from('papers')
      .select('project_id')
      .eq('id', id)
      .single()

    if (!paper) {
      return res.status(404).json({ error: '论文不存在' })
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', paper.project_id)
      .eq('user_id', req.user.userId)
      .single()

    if (!project) {
      return res.status(403).json({ error: '无权访问该论文' })
    }

    const { error } = await supabase
      .from('papers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除论文失败:', error)
      return res.status(500).json({ error: '删除论文失败' })
    }

    res.json({ message: '论文删除成功' })
  } catch (error) {
    console.error('删除论文错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router