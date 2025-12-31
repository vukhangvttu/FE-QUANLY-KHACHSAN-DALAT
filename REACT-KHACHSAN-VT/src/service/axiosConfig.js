import axios from 'axios'
import config from './Config'
import { redirectToLogin } from '../hooks/useAuthRedirect'

// Tạo instance axios
const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
})

// Biến để kiểm tra xem đang trong quá trình refresh token hay không
let isRefreshing = false
// Mảng chứa các request đang chờ refresh token
let failedQueue = []

// Hàm xử lý các request trong hàng đợi
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Hàm refresh token
const refreshToken = async () => {
  try {
    console.log('Bắt đầu refresh token...')
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('Không tìm thấy token')
      redirectToLogin()
      throw new Error('No token available')
    }

    // Sử dụng axios thông thường để tránh vòng lặp
    const response = await axios.post(`${config.apiBaseUrl}/auth/refresh`, {
      token: token,
    })

    console.log('Response refresh token:', response.data)

    if (response.data && response.data.result && response.data.result.token) {
      const newToken = response.data.result.token
      localStorage.setItem('token', newToken)
      console.log('Refresh token thành công')
      return newToken
    }
    // Nếu refresh token thất bại, xóa token và chuyển về login
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    redirectToLogin()
    throw new Error('Failed to refresh token')
  } catch (error) {
    console.error('Lỗi refresh token:', error)
    // Nếu là lỗi 401 hoặc lỗi khác, xóa token và chuyển về login
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    redirectToLogin()
    throw error
  }
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (!token) {
      redirectToLogin()
      return Promise.reject('No token available')
    }
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi là 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Gặp lỗi 401, chuẩn bị refresh token...')

      if (isRefreshing) {
        console.log('Đang trong quá trình refresh token, thêm request vào hàng đợi')
        // Nếu đang trong quá trình refresh token, thêm request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            console.log('Nhận token mới từ hàng đợi, thực hiện lại request')
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            console.error('Lỗi khi thực hiện lại request từ hàng đợi:', err)
            redirectToLogin()
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log('Bắt đầu refresh token cho request:', originalRequest.url)
        const newToken = await refreshToken()
        isRefreshing = false
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        console.log('Thực hiện lại request với token mới:', originalRequest.url)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        console.error('Lỗi khi refresh token:', refreshError)
        processQueue(refreshError, null)
        isRefreshing = false
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }

    // Nếu là lỗi 401 và đã retry hoặc lỗi khác, chuyển hướng về login
    if (error.response?.status === 401) {
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
