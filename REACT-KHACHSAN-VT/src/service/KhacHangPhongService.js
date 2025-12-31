import axiosInstance from './axiosConfig'
import config from './Config'
import { format } from 'date-fns'

export async function createKhachHangPhong(ma_xepphong_booking, khachHangPhonggData, navigate) {
  try {
    const response = await axiosInstance.post(
      `/khach-hang-phong/${ma_xepphong_booking}`,
      khachHangPhonggData,
    )
    console.log('createBooking', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getKhachHangPhongByMaXepPhong(maXepPhong, navigate) {
  try {
    const response = await axiosInstance.get(`/khach-hang-phong/xep-phong-booking/${maXepPhong}`)
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getKhachHangPhongById(maKhachHangPhong, navigate) {
  try {
    const response = await axiosInstance.get(`/khach-hang-phong/${maKhachHangPhong}`)
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function updateKhachHangPhong(ma_xepphong_booking, khachHangPhonggData, navigate) {
  try {
    const response = await axiosInstance.put(
      `/khach-hang-phong/${ma_xepphong_booking}`,
      khachHangPhonggData,
    )
    console.log('createBooking', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteKhachHangPhong(ma_khachhang_phong, navigate) {
  try {
    const response = await axiosInstance.delete(`/khach-hang-phong/${ma_khachhang_phong}`)
    console.log('createBooking', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getKhachLuuTruTrongKhoanThoiGian(ngayDen, ngayDi, navigate) {
  try {
    const response = await axiosInstance.get('/khach-hang-phong', {
      params: {
        ngayDen: format(ngayDen, 'yyyy-MM-dd'),
        ngayDi: format(ngayDi, 'yyyy-MM-dd'),
      },
    })
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}
