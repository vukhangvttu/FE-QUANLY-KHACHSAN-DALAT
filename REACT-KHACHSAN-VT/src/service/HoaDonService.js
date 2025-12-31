import axios from 'axios'
import config from './Config'
import axiosInstance from './axiosConfig'

export async function createHoaDon(ma_booking, ma_xepphong_booking, hoaDonData, navigate) {
  try {
    const response = await axiosInstance.post(
      `/hoa-don/add-hoa-don/${ma_booking}/${ma_xepphong_booking}`,
      hoaDonData,
    )
    console.log('createHoaDon', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createAllThongTinThanhToan(ma_booking, hoaDonData, navigate) {
  try {
    const response = await axiosInstance.post(
      `/hoa-don/add-all-thong-tin-thanh-toan/${ma_booking}`,
      hoaDonData,
    )
    console.log('createHoaDon', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getDanhSachHoaDon(ma_booking, navigate) {
  try {
    const response = await axiosInstance.get(`/hoa-don/xem-thong-tin-thanh-toan/${ma_booking}`)
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}
