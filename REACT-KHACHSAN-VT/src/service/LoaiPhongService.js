import axiosInstance from './axiosConfig'
import config from './Config'

export async function getAllLoaiPhongBooKing(navigate) {
  try {
    const response = await axiosInstance.get('/loai-phong')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getAllLoaiPhongTrongTrongKhoanThoiGian(ngayDen, ngayDi) {
  try {
    const response = await axiosInstance.get('/loai-phong/kiem-tra-loai-phong-trong', {
      params: {
        ngayDen: ngayDen,
        ngayDi: ngayDi,
      },
    })
    console.log('trả ra loại phòng', response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getXemDuBaoPhongTrong(ngayDen, ngayDi) {
  try {
    const response = await axiosInstance.get('/loai-phong/xem-du-bao-phong', {
      params: {
        ngayDen: ngayDen,
        ngayDi: ngayDi,
      },
    })
    console.log('trả ra', response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}
