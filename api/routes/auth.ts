import express from 'express'
import bcrypt from 'bcryptjs'
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

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'researcher', institution } = req.body

    // 验证必填字段
    if (!name || !email || !password) {
      return res.status(400).json({ error: '姓名、邮箱和密码为必填项' })
    }

    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: hashedPassword,
        role,
        institution
      })
      .select()
      .single()

    if (error) {
      console.error('创建用户失败:', error)
      return res.status(500).json({ error: '创建用户失败' })
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user
    res.status(201).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码为必填项' })
    }

    // 查找用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user
    res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, institution, created_at, updated_at')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json({ user })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(401).json({ error: '无效的认证令牌' })
  }
})

// 更新用户资料
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const { name, institution } = req.body

    const { data: user, error } = await supabase
      .from('users')
      .update({ name, institution })
      .eq('id', decoded.userId)
      .select('id, name, email, role, institution, created_at, updated_at')
      .single()

    if (error) {
      console.error('更新用户资料失败:', error)
      return res.status(500).json({ error: '更新用户资料失败' })
    }

    res.json({ user })
  } catch (error) {
    console.error('更新用户资料错误:', error)
    res.status(401).json({ error: '无效的认证令牌' })
  }
})

export default router