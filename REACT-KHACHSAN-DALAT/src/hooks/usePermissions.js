import { useState, useEffect, useCallback } from 'react'
import {
  decodeToken,
  getScopes,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserInfo,
  isTokenExpired,
  getAllowedTabs,
} from '../utils/tokenUtils'

/**
 * Custom hook để quản lý permissions dựa trên JWT token
 * @returns {Object} Object chứa các functions và state liên quan đến permissions
 */
export const usePermissions = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [allowedTabs, setAllowedTabs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)

  // Function để refresh permissions từ token
  const refreshPermissions = useCallback(() => {
    try {
      setIsLoading(true)

      // Chỉ kiểm tra có token không, không kiểm tra hết hạn
      // để axios interceptor có cơ hội refresh token tự động
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Không tìm thấy token')
        setIsTokenValid(false)
        setUserInfo(null)
        setAllowedTabs([])
        return
      }

      // Có token thì cho phép truy cập
      setIsTokenValid(true)

      // Lấy thông tin user và permissions (có thể null nếu token hết hạn)
      const user = getUserInfo()
      const tabs = getAllowedTabs()

      setUserInfo(user)
      setAllowedTabs(tabs)

      console.log('User permissions loaded:', {
        user: user?.sub,
        scopes: user?.scopes,
        allowedTabs: tabs.map((t) => t.name),
      })
    } catch (error) {
      console.error('Lỗi khi load permissions:', error)
      setUserInfo(null)
      setAllowedTabs([])
      setIsTokenValid(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load permissions khi component mount
  useEffect(() => {
    refreshPermissions()
  }, [refreshPermissions])

  // Listen for token changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        refreshPermissions()
      }
    }

    // Listen for tokenRefreshed event from axiosConfig
    const handleTokenRefreshed = () => {
      console.log('Token refreshed event received, updating permissions...')
      refreshPermissions()
    }

    // Listen for authFailed event (khi refresh token thất bại)
    const handleAuthFailed = () => {
      console.log('Auth failed event received, clearing permissions...')
      setIsTokenValid(false)
      setUserInfo(null)
      setAllowedTabs([])
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('tokenRefreshed', handleTokenRefreshed)
    window.addEventListener('authFailed', handleAuthFailed)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed)
      window.removeEventListener('authFailed', handleAuthFailed)
    }
  }, [refreshPermissions])

  // Helper functions
  const checkPermission = useCallback(
    (scope) => {
      if (!isTokenValid) return false
      return hasPermission(scope)
    },
    [isTokenValid],
  )

  const checkAnyPermission = useCallback(
    (scopes) => {
      if (!isTokenValid) return false
      return hasAnyPermission(scopes)
    },
    [isTokenValid],
  )

  const checkAllPermissions = useCallback(
    (scopes) => {
      if (!isTokenValid) return false
      return hasAllPermissions(scopes)
    },
    [isTokenValid],
  )

  const canAccessTab = useCallback(
    (tabKey) => {
      if (!isTokenValid) return false
      return allowedTabs.some((tab) => tab.key === tabKey)
    },
    [isTokenValid, allowedTabs],
  )

  const canAccessButton = useCallback(
    (buttonScope) => {
      if (!isTokenValid) return false
      return hasPermission(buttonScope)
    },
    [isTokenValid],
  )

  // Get default active tab (tab đầu tiên có quyền)
  const getDefaultActiveTab = useCallback(() => {
    if (allowedTabs.length === 0) return 2 // Default fallback
    return allowedTabs[0].key
  }, [allowedTabs])

  return {
    // State
    userInfo,
    allowedTabs,
    isLoading,
    isTokenValid,

    // Functions
    refreshPermissions,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    canAccessTab,
    canAccessButton,
    getDefaultActiveTab,

    // Convenience getters
    scopes: userInfo?.scopes || [],
    manhanvien: userInfo?.manhanvien || null,
    username: userInfo?.sub || null,
  }
}
