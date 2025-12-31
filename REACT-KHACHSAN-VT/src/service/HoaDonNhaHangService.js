import axiosInstance from './axiosConfig'
import config from './Config'

export async function createHoaDonNhaHang(hoaDonData, navigate) {
  try {
    const response = await axiosInstance.post('/hoa-don-nha-hang/add-hoa-don-ban-le', hoaDonData)
    console.log('Tạo hóa đơn nhà hàng:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi tạo hóa đơn nhà hàng:', error)
    throw error
  }
}

export async function getLichSuThanhToanNhaHang(ma_booking, navigate) {
  try {
    const response = await axiosInstance.get(`/hoa-don-nha-hang/lich-su-thanh-toan/${ma_booking}`)
    console.log('Lịch sử thanh toán nhà hàng:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy lịch sử thanh toán nhà hàng:', error)
    throw error
  }
}
