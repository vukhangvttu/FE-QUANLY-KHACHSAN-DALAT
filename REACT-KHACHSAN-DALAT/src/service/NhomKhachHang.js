import axiosInstance from './axiosConfig'
import config from './Config'

export async function getAllNhomKhachHang(navigate) {
  try {
    const response = await axiosInstance.get('/nhom-khach-hang')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    if (response.status === 401 || response.status === 400) {
      navigate('/login')
    }
  } catch (error) {
    console.log(error)
  }
}
