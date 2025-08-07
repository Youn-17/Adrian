import express from 'express'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import csv from 'csv-parser'
import { Readable } from 'stream'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 配置multer用于文件上传
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持CSV和Excel文件格式'))
    }
  }
})

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
    const project_id = req.body.project_id || req.params.projectId
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

    req.project_id = project_id
    next()
  } catch (error) {
    console.error('验证项目所有权错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
}

// 解析CSV文件
const parseCSV = (buffer: Buffer): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    const stream = Readable.from(buffer.toString())
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

// 解析Excel文件
const parseExcel = (buffer: Buffer): any[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(worksheet)
}

// 上传数据集文件
router.post('/dataset/:projectId', authenticateToken, verifyProjectOwnership, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' })
    }

    const { name, description, data_type = 'effect_sizes' } = req.body
    const project_id = req.project_id

    if (!name) {
      return res.status(400).json({ error: '数据集名称为必填项' })
    }

    let parsedData: any[]
    try {
      if (req.file.mimetype === 'text/csv') {
        parsedData = await parseCSV(req.file.buffer)
      } else {
        parsedData = parseExcel(req.file.buffer)
      }
    } catch (parseError) {
      console.error('文件解析失败:', parseError)
      return res.status(400).json({ error: '文件格式错误或内容无法解析' })
    }

    if (parsedData.length === 0) {
      return res.status(400).json({ error: '文件内容为空' })
    }

    // 创建数据集记录
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .insert({
        project_id,
        name,
        description,
        file_name: req.file.originalname,
        file_size: req.file.size,
        data_type,
        columns: Object.keys(parsedData[0]),
        row_count: parsedData.length
      })
      .select()
      .single()

    if (datasetError) {
      console.error('创建数据集失败:', datasetError)
      return res.status(500).json({ error: '创建数据集失败' })
    }

    // 批量插入数据
    const dataToInsert = parsedData.map((row, index) => ({
      dataset_id: dataset.id,
      row_index: index,
      data: row
    }))

    const { error: dataError } = await supabase
      .from('dataset_data')
      .insert(dataToInsert)

    if (dataError) {
      console.error('插入数据失败:', dataError)
      // 如果数据插入失败，删除已创建的数据集记录
      await supabase.from('datasets').delete().eq('id', dataset.id)
      return res.status(500).json({ error: '数据插入失败' })
    }

    res.status(201).json({
      dataset,
      preview: parsedData.slice(0, 5), // 返回前5行作为预览
      total_rows: parsedData.length
    })
  } catch (error) {
    console.error('上传数据集错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取项目的所有数据集
router.get('/datasets/:projectId', authenticateToken, verifyProjectOwnership, async (req: any, res) => {
  try {
    const project_id = req.project_id

    const { data: datasets, error } = await supabase
      .from('datasets')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取数据集列表失败:', error)
      return res.status(500).json({ error: '获取数据集列表失败' })
    }

    res.json({ datasets })
  } catch (error) {
    console.error('获取数据集列表错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取数据集详情和数据
router.get('/dataset/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 50 } = req.query

    // 获取数据集信息并验证所有权
    const { data: dataset, error: datasetError } = await supabase
      .from('datasets')
      .select(`
        *,
        project:projects!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .eq('project.user_id', req.user.userId)
      .single()

    if (datasetError || !dataset) {
      return res.status(404).json({ error: '数据集不存在或无权访问' })
    }

    // 获取数据
    const offset = (Number(page) - 1) * Number(limit)
    const { data: dataRows, error: dataError } = await supabase
      .from('dataset_data')
      .select('*')
      .eq('dataset_id', id)
      .order('row_index')
      .range(offset, offset + Number(limit) - 1)

    if (dataError) {
      console.error('获取数据失败:', dataError)
      return res.status(500).json({ error: '获取数据失败' })
    }

    res.json({
      dataset,
      data: dataRows.map(row => row.data),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: dataset.row_count
      }
    })
  } catch (error) {
    console.error('获取数据集详情错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 删除数据集
router.delete('/dataset/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params

    // 验证数据集所有权
    const { data: dataset } = await supabase
      .from('datasets')
      .select(`
        id,
        project:projects!inner(
          id,
          user_id
        )
      `)
      .eq('id', id)
      .eq('project.user_id', req.user.userId)
      .single()

    if (!dataset) {
      return res.status(404).json({ error: '数据集不存在或无权访问' })
    }

    // 删除数据集（级联删除相关数据）
    const { error } = await supabase
      .from('datasets')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除数据集失败:', error)
      return res.status(500).json({ error: '删除数据集失败' })
    }

    res.json({ message: '数据集删除成功' })
  } catch (error) {
    console.error('删除数据集错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router