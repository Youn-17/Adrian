import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase.js'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' })
    }

    // 验证Supabase JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(403).json({ success: false, error: 'Invalid token' })
    }

    // 从数据库获取用户详细信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return res.status(403).json({ success: false, error: 'User not found' })
    }

    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(403).json({ success: false, error: 'Invalid token' })
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' })
    }

    next()
  }
}

// 检查是否为高级研究员或管理员
export const requireSeniorRole = requireRole(['senior_researcher', 'admin'])

// 检查是否为管理员
export const requireAdminRole = requireRole(['admin'])