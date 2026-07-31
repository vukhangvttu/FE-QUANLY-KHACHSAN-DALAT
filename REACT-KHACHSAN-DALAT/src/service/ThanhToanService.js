import axiosInstance from './axiosConfig'

export async function AllThongTinThanhToan(ma_booking) {
  try {
    const response = await axiosInstance.get(`/hoa-don/all-thong-tin-thanh-toan/${ma_booking}`)
    console.log('Thông tin thanh toán:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin thanh toán:', error)
    throw error
  }
}

export async function getThongTinXuatPhieuDangKy(ma_booking) {
  try {
    const response = await axiosInstance.get(`/hoa-don/thong-tin-xuat-phieu-dang-ky/${ma_booking}`)
    console.log('Thông tin xuất phiếu đăng ký:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin xuất phiếu đăng ký:', error)
    throw error
  }
}

export async function getThongTinXuatPhieuDangKyOTA_TA(ma_booking) {
  try {
    const response = await axiosInstance.get(`/hoa-don/thong-tin-xuat-phieu-dang-ky-ota-ta/${ma_booking}`)
    console.log('Thông tin xuất phiếu đăng ký:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin xuất phiếu đăng ký:', error)
    throw error
  }
}

export async function AllThongTinKhachHang(ma_booking) {
  try {
    const response = await axiosInstance.get(
      `/hoa-don/thong-tin-khach-hang-thanh-toan/${ma_booking}`,
    )
    console.log('Thông tin khách hàng:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin khách hàng:', error)
    throw error
  }
}

export async function getPhuThuKhiCreateBooking(ma_booking) {
  try {
    const response = await axiosInstance.get(`/chi-tiet-booking/phu-thu/${ma_booking}`)
    console.log('Thông tin phu thu:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin phu thu', error)
    throw error
  }
}
