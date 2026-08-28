import axiosInstance from './axiosConfig'

export async function createTenNguon(tenNguonRequest) {
  try {
    const response = await axiosInstance.post('/ten-nguon', tenNguonRequest)
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data
    }
    console.error('Lỗi createTenNguon:', error)
    return { code: 500, message: 'Lỗi hệ thống!' }
  }
}

export async function getAllTenNguon() {
  try {
    const response = await axiosInstance.get('/ten-nguon')
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data
    }
    console.error('Lỗi getAllTenNguon:', error)
    return { code: 500, message: 'Lỗi hệ thống!' }
  }
}

export async function updateTenNguon(tenNguonRequest) {
  try {
    const response = await axiosInstance.put('/ten-nguon', tenNguonRequest)
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data
    }
    console.error('Lỗi updateTenNguon:', error)
    return { code: 500, message: 'Lỗi hệ thống!' }
  }
}

export async function getTenNguonById(maNguonKhach) {
  try {
    const response = await axiosInstance.get(`/ten-nguon/${maNguonKhach}`)
    return response.data
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data
    }
    console.error('Lỗi getTenNguonById:', error)
    return { code: 500, message: 'Lỗi hệ thống!' }
  }
}
