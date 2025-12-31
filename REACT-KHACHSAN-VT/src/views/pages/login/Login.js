import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CFormFeedback,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import config from 'src/service/Config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import logo from 'src/assets/images/logo-vttu.png'

const Login = () => {
  const [login, setLogin] = useState({
    username: '',
    password: '',
  })

  const [validated, setValidated] = useState(false)
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  })

  const { username, password } = login

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: '',
    }
    let isValid = true

    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập'
      isValid = false
    }

    if (!password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const onInputChange = (e) => {
    const { name, value } = e.target
    setLogin({ ...login, [name]: value })
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  let navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const onSubmit = async (e) => {
    e.preventDefault()
    setValidated(true)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${config.apiBaseUrl}/auth/log-in`, login)
      console.log(response.data)
      const data = response.data
      setLoading(false)

      if (data.code === 1000) {
        if (data.result.locked === true) {
          return addToast(exampleToast('Tài khoản đã bị khóa'))
        }

        if (data.result.authenticated === true) {
          console.log('data.result.token', data.result.token)
          // Lưu token trước khi chuyển hướng
          localStorage.setItem('token', data.result.token)
          if (data.result.refreshToken) {
            localStorage.setItem('refreshToken', data.result.refreshToken)
          }

          // Đợi một chút để đảm bảo token đã được lưu
          await new Promise((resolve) => setTimeout(resolve, 100))

          // Chuyển hướng sau khi đã lưu token
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (error) {
      setLoading(false)
      console.error('Error:', error)
      addToast(exampleToast('Username hoặc mật khẩu không đúng'))
    }
  }

  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const exampleToast = (message) => (
    <CToast>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <div className="fw-bold me-auto">Thông báo</div>
        <small>Thông báo tự biến mất sau 5 giây</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-blue-600 mb-1">Đăng Nhập</h2>
          <p className="text-gray-500 text-sm">Chào mừng bạn quay lại!</p>
        </div>
        <form onSubmit={onSubmit} autoComplete="off" className="space-y-5">
          <div className="flex flex-col items-center gap-2">
            <CInputGroup>
              <CInputGroupText>
                <CIcon icon={cilUser} />
              </CInputGroupText>
              <CFormInput
                placeholder="Tên tài khoản"
                autoComplete="username"
                name="username"
                value={username}
                onChange={onInputChange}
                required
                invalid={!!errors.username}
              />
              <CFormFeedback invalid>{errors.username}</CFormFeedback>
            </CInputGroup>
            <CInputGroup className="mb-4">
              <CInputGroupText>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                type="password"
                placeholder="Mật khẩu"
                autoComplete="current-password"
                name="password"
                value={password}
                onChange={onInputChange}
                required
                invalid={!!errors.password}
              />
              <CFormFeedback invalid>{errors.password}</CFormFeedback>
            </CInputGroup>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-cyan-500 transition"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Đăng nhập...
              </span>
            ) : (
              <>
                <FontAwesomeIcon icon={faRightToBracket} className="mr-2" />
                Đăng nhập
              </>
            )}
          </button>
        </form>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>
    </div>
  )
}

export default Login
