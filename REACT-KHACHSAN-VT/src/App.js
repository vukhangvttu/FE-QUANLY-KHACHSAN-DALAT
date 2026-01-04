import React, { Suspense, useEffect, useRef } from 'react'
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react-pro'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'
import axiosInstance from './service/axiosConfig'
import { useAuthRedirect } from './hooks/useAuthRedirect'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// Email App
const EmailApp = React.lazy(() => import('./views/apps/email/EmailApp'))

const AppContent = () => {
  const navigate = useNavigate()
  const isRefreshing = useRef(false)
  const refreshSubscribers = useRef([])

  const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.current.push(cb)
  }

  const onRefreshed = (token) => {
    refreshSubscribers.current.forEach((cb) => cb(token))
    refreshSubscribers.current = []
  }

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await axiosInstance.post('/auth/refresh', { token })
      // Kiểm tra response theo format của backend
      if (response.data && response.data.result && response.data.result.token) {
        // Lưu token mới vào localStorage
        localStorage.setItem('token', response.data.result.token)
        return response.data.result.token
      }
      throw new Error('Invalid refresh response')
    } catch (error) {
      console.error('Refresh token error:', error)
      // Xóa token và chuyển về login
      localStorage.removeItem('token')
      navigate('/login')
      throw error
    }
  }

  const checkAndRefreshToken = async () => {
    if (isRefreshing.current) {
      // Nếu đang refresh, đăng ký callback
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => resolve(token))
      })
    }

    isRefreshing.current = true

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Kiểm tra token hiện tại
      const result = await axiosInstance.post(
        '/auth/introspect',
        { token },
        {
          validateStatus: () => true,
        },
      )

      if (result.status === 200) {
        if (!result.data.result.valid) {
          try {
            // Token không hợp lệ, thử refresh
            const newToken = await refreshToken()
            onRefreshed(newToken)
            return newToken
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError)
            // Không throw error ở đây để tránh chuyển hướng login nhiều lần
            return null
          }
        }
        return token
      }
    } catch (error) {
      console.error('Token check error:', error)
      if (error.response?.data?.code === 9999) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    } finally {
      isRefreshing.current = false
    }
  }

  useAuthRedirect()

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <Routes>
        <Route exact path="/login" name="Login Page" element={<Login />} />
        <Route exact path="/register" name="Register Page" element={<Register />} />
        <Route exact path="/404" name="Page 404" element={<Page404 />} />
        <Route exact path="/500" name="Page 500" element={<Page500 />} />
        <Route path="/apps/email/*" name="Email App" element={<EmailApp />} />
        <Route path="*" name="Home" element={<DefaultLayout />} />
      </Routes>
    </Suspense>
  )
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes(
    'coreui-pro-react-admin-template-theme-light',
  )
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
      return
    }

    // Luôn set về theme từ store (mặc định là 'light')
    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

export default App
