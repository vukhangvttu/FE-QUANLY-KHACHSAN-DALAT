import axiosInstance from './axiosConfig'
import config from './Config'

export async function getGiaPhongExtraBed(maLoaiPhong, navigate) {
  try {
    const response = await axiosInstance.get(`/gia-phong/extra-beb/${maLoaiPhong}`)
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}

export async function getAllGiaPhongTheoThoiGian(navigate) {
  try {
    const response = await axiosInstance.get('/gia-phong/theo-thoi-gian')
    console.log('giá phòng', response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}
