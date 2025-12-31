import axiosInstance from './axiosConfig'
import config from './Config'

export async function createXepPhongBooking(ma_booking, xepPhongData, navigate) {
  try {
    const response = await axiosInstance.post(`/xep-phong-booking/${ma_booking}`, xepPhongData)
    console.log('Tạo xếp phòng booking:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi tạo xếp phòng booking:', error)
    throw error
  }
}

export async function getChiTietXepPhongByMaBooKing(ma_booking, navigate) {
  try {
    const response = await axiosInstance.get(`/xep-phong-booking/${ma_booking}`)
    console.log('Chi tiết xếp phòng booking:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy chi tiết xếp phòng booking:', error)
    throw error
  }
}

export async function updateXepPhongBooking(ma_booking, xepPhongData, navigate) {
  try {
    const response = await axiosInstance.put(`/xep-phong-booking/${ma_booking}`, xepPhongData)
    console.log('Cập nhật xếp phòng booking:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi cập nhật xếp phòng booking:', error)
    throw error
  }
}

export async function deleteXepPhongBooking(ma_booking, navigate) {
  try {
    const response = await axiosInstance.delete(`/xep-phong-booking/${ma_booking}`)
    console.log('Xóa xếp phòng booking:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi xóa xếp phòng booking:', error)
    throw error
  }
}

export async function updateNhanPhongBooking(
  ma_xepphong_bookking,
  nhanphong,
  phuThuCheckInSom,
  navigate,
) {
  try {
    const response = await axiosInstance.put(
      `/xep-phong-booking/check-in/${ma_xepphong_bookking}`,
      null,
      {
        params: {
          danhanphong: nhanphong,
          phuThuCheckInSom: phuThuCheckInSom,
        },
      },
    )
    console.log('Cập nhật nhận phòng:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi cập nhật nhận phòng:', error)
    throw error
  }
}

export async function getXepPhongByMaXepPhong(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(`/xep-phong-booking/chi-tiet-xep-phong/${ma_xepphong}`)
    console.log('Chi tiết xếp phòng:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy chi tiết xếp phòng:', error)
    throw error
  }
}

export async function getThongTinKhachHang(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(
      `/xep-phong-booking/thong-tin-khach-hang-thanh-toan/${ma_xepphong}`,
    )
    console.log('Thông tin khách hàng:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin khách hàng:', error)
    throw error
  }
}

export async function getThongTinXuatPhieuDangKy(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(
      `/xep-phong-booking/thong-tin-xuat-phieu-dang-ky/${ma_xepphong}`,
    )
    console.log('Thông tin xuất phiếu đăng ký:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin xuất phiếu đăng ký:', error)
    throw error
  }
}

export async function updateNgayDi(
  ma_booking,
  ma_xepphong,
  ngay_di_moi,
  gio_di_moi,
  ngay_di_cu,
  ma_loaiphong,
  danhSachGiaMoi,
  navigate,
) {
  try {
    const response = await axiosInstance.put(
      `/xep-phong-booking/cap-nhat-ngay-di/${ma_booking}`,
      danhSachGiaMoi,
      {
        params: {
          ma_xepphong: ma_xepphong,
          ngay_di_moi: ngay_di_moi,
          gio_di_moi: gio_di_moi,
          ngay_di_cu: ngay_di_cu,
          ma_loaiphong: ma_loaiphong,
        },
      },
    )
    console.log('Cập nhật ngày đi:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi cập nhật ngày đi:', error)
    throw error
  }
}

export async function updatePhuThuXepPhong(
  phu_thu_giuong,
  so_giuong,
  phu_thu_nguoi_lon,
  so_nguoi_lon,
  phu_thu_tre,
  so_tre,
  ma_xepphong,
  navigate,
) {
  try {
    const response = await axiosInstance.put(`/xep-phong-booking/phu-thu-xep-phong`, null, {
      params: {
        phu_thu_giuong: phu_thu_giuong,
        so_giuong: so_giuong,
        phu_thu_nguoi_lon: phu_thu_nguoi_lon,
        so_nguoi_lon: so_nguoi_lon,
        phu_thu_tre: phu_thu_tre,
        so_tre: so_tre,
        ma_xepphong: ma_xepphong,
      },
    })
    console.log('Cập nhật phụ thu xếp phòng:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi cập nhật phụ thu xếp phòng:', error)
    throw error
  }
}

export async function getPhuThuXepPhong(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(`/xep-phong-booking/phu-thu-xep-phong/${ma_xepphong}`)
    console.log('Thông tin phụ thu xếp phòng:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy thông tin phụ thu xếp phòng:', error)
    throw error
  }
}

export async function deleteXepPhongBooking_Phong(ma_chitiet, ma_phong, navigate) {
  try {
    const response = await axiosInstance.delete(`/xep-phong-booking/xoa_xep_phong/${ma_chitiet}`, {
      params: {
        ma_phong: ma_phong,
      },
    })
    console.log('Xóa xếp phòng:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi xóa xếp phòng:', error)
    throw error
  }
}

export async function createDichVuMienPhi(bookingData, ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.post(
      `/chi-tiet-booking-dich-vu-mien-phi/${ma_xepphong}`,
      bookingData,
    )
    console.log('Tạo dịch vụ miễn phí:', response)
    return response.data
  } catch (error) {
    console.log('Lỗi tạo dịch vụ miễn phí:', error)
    throw error
  }
}

export async function getListDichVuMienPhi(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(`/chi-tiet-booking-dich-vu-mien-phi/${ma_xepphong}`)
    console.log('Danh sách dịch vụ miễn phí:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy danh sách dịch vụ miễn phí:', error)
    throw error
  }
}

export async function getListGiaPhongTheoNgay(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(`/chi-tiet-booking/gia-phong-theo-ngay/${ma_xepphong}`)
    console.log('Danh sách giá phòng theo ngày:', response)
    return response.data.result
  } catch (error) {
    console.log('Lỗi lấy danh sách giá phòng theo ngày:', error)
    throw error
  }
}
