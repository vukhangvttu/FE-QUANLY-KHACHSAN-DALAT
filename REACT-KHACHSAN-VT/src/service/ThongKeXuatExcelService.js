import axiosInstance from './axiosConfig'

export const exportExcelChiTietDatPhong = async (ma_booking) => {
  try {
    const response = await axiosInstance.get(`/xuat-excel/chi-tiet-dat-phong`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      params: {
        ma_booking: ma_booking,
      },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const exportExcelHoaDon = async (ma_booking) => {
  try {
    const response = await axiosInstance.get(`/xuat-excel/chi-tiet-hoa-don`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      params: {
        ma_booking: ma_booking,
      },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export async function exportExcelThongKeTheoNgay(ngay, navigate) {
  try {
    const response = await axiosInstance.get('/thong-ke/export-excel-theo-ngay', {
      params: {
        ngay: ngay,
      },
      responseType: 'blob',
    })
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function exportExcelThongKeTheoKhoanThoiGian(ngayDen, ngayDi, navigate) {
  try {
    const response = await axiosInstance.get('/thong-ke/export-excel-theo-khoan-thoi-gian', {
      params: {
        ngayDen: ngayDen,
        ngayDi: ngayDi,
      },
      responseType: 'blob',
    })
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}
