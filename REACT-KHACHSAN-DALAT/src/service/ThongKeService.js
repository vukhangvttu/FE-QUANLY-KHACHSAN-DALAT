import axiosInstance from './axiosConfig'
import { format } from 'date-fns'

export async function AllThongKeTheoNgay(ngay) {
  try {
    const response = await axiosInstance.get('/thong-ke/theo-ngay', {
      params: {
        ngay: ngay,
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

export async function getThongKeTheoKhoanThoiGian(
  ngayDen,
  ngayDi,
  selectedNhomKhachHang,
  loaiNguonKhach,
  loaiPhong,
  navigate,
) {
  try {
    const response = await axiosInstance.get('/thong-ke/theo-khoan-thoi-gian', {
      params: {
        ngayDen: ngayDen,
        ngayDi: ngayDi,
        maNhomKhachHang: selectedNhomKhachHang,
        maNguonKhach: loaiNguonKhach,
        maLoaiPhong: loaiPhong,
      },
      timeout: 60000,
    })
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getThongKeDoanThuTheoThang() {
  try {
    const response = await axiosInstance.get('/thong-ke/doanh-thu-theo-thang')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export const exportExcel = async (
  ngayDen,
  ngayDi,
  loaiPhong,
  selectedNhomKhachHang,
  tenNhomKhachHang,
) => {
  try {
    const response = await axiosInstance.get('/thong-ke/export/excel', {
      params: {
        ngayDen: format(ngayDen, 'yyyy-MM-dd'),
        ngayDi: format(ngayDi, 'yyyy-MM-dd'),
        maLoaiPhong: loaiPhong,
        maNhomKhachHang: selectedNhomKhachHang,
        tenNhomKhachHang: tenNhomKhachHang,
      },
      timeout: 60000,
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const exportExcelKhachLuuTruKhoanThoiGian = async (ngayDen, ngayDi) => {
  try {
    const response = await axiosInstance.get('/thong-ke/export/excel/thong-tin-luu-tru', {
      params: {
        ngayDen: format(ngayDen, 'yyyy-MM-dd'),
        ngayDi: format(ngayDi, 'yyyy-MM-dd'),
      },
      responseType: 'blob',
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getThongKeAnSang() {
  try {
    const response = await axiosInstance.get('/thong-ke/thong-ke-an-sang')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getDanhSachPhongAnSang() {
  try {
    const response = await axiosInstance.get('/thong-ke/danh-sach-phong-an-sang')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getThongKeKhachLuuTruTheoQuy(navigate) {
  try {
    const response = await axiosInstance.get('/thong-ke/khach-luu-tru-theo-quy')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getThongKeKhachHangTheoNgay(ngayBD, ngayKT, navigate) {
  try {
    const response = await axiosInstance.get('/thong-ke/khach-hang-theo-ngay', {
      params: {
        ngayBD: ngayBD,
        ngayKT: ngayKT,
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

export async function getThongKeBuongPhong(ngayBatDau, ngayKetThuc) {
  try {
    const response = await axiosInstance.get('/thong-ke/buong-phong', {
      params: {
        ngayBatDau: ngayBatDau,
        ngayKetThuc: ngayKetThuc,
      },
    })
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi khi lấy thống kê buồng phòng:', error)
    return null
  }
}

export const exportExcelThongKeBuongPhong = async (ngayBatDau, ngayKetThuc) => {
  try {
    const response = await axiosInstance.get('/thong-ke/export/excel/buong-phong', {
      params: {
        ngayBatDau: ngayBatDau,
        ngayKetThuc: ngayKetThuc,
      },
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.log('Lỗi khi xuất Excel thống kê buồng phòng:', error)
    throw error
  }
}

export const exportExcelThongKePhongDaBanKhoanThoiGian = async (thangBD, namBD, thangKT, namKT) => {
  try {
    const response = await axiosInstance.get('/thong-ke/thong-ke-phong-da-ban-theo-khoan-thoi-gian', {
      params: {
        thangBD: thangBD,
        namBD: namBD,
        thangKT: thangKT,
        namKT: namKT,
      },
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const exportExcelThongKeDoanhSoKPINhanVien = async (ngayDen, ngayDi) => {
  try {
    const response = await axiosInstance.get('/thong-ke/export/excel/bao-cao-doanh-so-kpi-nhan-vien', {
      params: {
        ngayDen: format(ngayDen, 'yyyy-MM-dd'),
        ngayDi: format(ngayDi, 'yyyy-MM-dd'),
      },
      timeout: 60000,
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getThongKeAllKPINhanVienTheoKhoanThoiGian = async (ngayDen, ngayDi) => {
  try {
    const response = await axiosInstance.get('/thong-ke/thong-ke-all-kpi-nhan-vien-theo-khoan-thoi-gian', {
      params: {
        ngayBD: format(ngayDen, 'yyyy-MM-dd'),
        ngayKT: format(ngayDi, 'yyyy-MM-dd'),
      },
      timeout: 60000,
    })
    console.log('[getThongKeAllKPINhanVienTheoKhoanThoiGian] response:', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getThongKeChiTietKPINhanVienTheoKhoanThoiGian = async (ngayDen, ngayDi) => {
  try {
    const response = await axiosInstance.get('/thong-ke/thong-ke-chi-tiet-kpi-nhan-vien-theo-khoan-thoi-gian', {
      params: {
        ngayBD: format(ngayDen, 'yyyy-MM-dd'),
        ngayKT: format(ngayDi, 'yyyy-MM-dd'),
      },
      timeout: 60000,
    })
    console.log('[getThongKeChiTietKPINhanVienTheoKhoanThoiGian] response:', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}