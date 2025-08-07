import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string;
  email: string;
  name: string;
  role: 'researcher' | 'senior_researcher' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string, role?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查本地存储的认证状态
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // 模拟登录验证
      if (email && password) {
        const mockUser: User = {
          id: '1',
          email,
          name: '研究员',
          role: 'researcher',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // 存储认证信息
        localStorage.setItem('token', 'mock-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        setUser(mockUser)
        return { success: true }
      } else {
        return { success: false, error: '请输入邮箱和密码' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: '登录失败' }
    }
  }

  const register = async (email: string, password: string, name: string, role: string = 'researcher') => {
    try {
      // 模拟注册
      if (email && password && name) {
        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role: role as 'researcher' | 'senior_researcher' | 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // 存储认证信息
        localStorage.setItem('token', 'mock-token')
        localStorage.setItem('user', JSON.stringify(mockUser))
        setUser(mockUser)
        return { success: true }
      } else {
        return { success: false, error: '请填写所有必需字段' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: '注册失败' }
    }
  }

  const logout = async () => {
    try {
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) {
        return { success: false, error: '未登录' }
      }

      const updatedUser = {
        ...user,
        ...data,
        updated_at: new Date().toISOString()
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: '更新失败' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider