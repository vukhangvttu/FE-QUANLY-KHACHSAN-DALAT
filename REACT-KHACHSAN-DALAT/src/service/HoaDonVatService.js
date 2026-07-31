import axiosInstance from './axiosConfig'
import config from './Config'
import { format } from 'date-fns'

export async function createHoaDonVat(ma_booking, hoaDonData, navigate) {
  try {
    const response = await axiosInstance.post(`/hoa-don-vat/add-hoa-don/${ma_booking}`, hoaDonData)
    console.log('createHoaDon', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getHoaDonVatByMaBooKing(ma_booking, navigate) {
  try {
    const response = await axiosInstance.get(`/hoa-don-vat/get-thong-tin-hoa-don-vat/${ma_booking}`)
    console.log('createHoaDon', response)
    return response.data.result || []
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function updateHoaDonVat(hoaDonData, navigate) {
  try {
    const response = await axiosInstance.put('/hoa-don-vat/edit-hoa-don', hoaDonData)
    console.log('updateHoaDon', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getPrintHoaDonVatNhap(ma_booking, ma_hoadon_vat) {
  try {
    const response = await axiosInstance.get(
      `/hoa-don-vat/print-hoa-don-vat-nhap/${ma_booking}/${ma_hoadon_vat}`,
      {
        responseType: 'blob', // ⚠️ Cần để đọc byte[] từ backend
      },
    )
    return response
  } catch (error) {
    throw error // ném lại nếu cần xử lý ngoài
  }
}

export async function xacNhanHoaDonVatNhap(ma_hoadon_vat, navigate) {
  try {
    const response = await axiosInstance.put(
      `/hoa-don-vat/xac_nhan-hoa-don-vat-nhap/${ma_hoadon_vat}`,
    )
    console.log('updateHoaDon', response)
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getPrintHoaDonVatPhatHanh(ma_hoadon_vat) {
  try {
    const response = await axiosInstance.get(
      `/hoa-don-vat/print-hoa-don-vat-phat-hanh/${ma_hoadon_vat}`,
      {
        responseType: 'blob', // ⚠️ Cần để đọc byte[] từ backend
      },
    )
    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function HuyHoaDonPhatHanhVAT(
  ma_hoadon_vat,
  van_ban_thoa_thuan,
  ngay_thoa_thuan,
  ly_do,
  navigate,
) {
  try {
    const response = await axiosInstance.delete('/hoa-don-vat/huy-hoa-don-vat-phat-hanh', {
      params: {
        ma_hoadon_vat: ma_hoadon_vat,
        van_ban_thoa_thuan: van_ban_thoa_thuan,
        ngay_thoa_thuan: format(ngay_thoa_thuan, 'yyyy-MM-dd'),
        ly_do: ly_do,
      },
    })
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getListCodeVAT(navigate) {
  try {
    const response = await axiosInstance.get('/hoa-don-vat/list-code-vat')
    console.log('createHoaDon', response)
    return response.data.result || []
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getThongTinDichVuVAT(ma_booking, ma_hoadon_vat, navigate) {
  try {
    const response = await axiosInstance.get(
      `/hoa-don-vat/get-list-item-info/${ma_booking}/${ma_hoadon_vat}`,
    )
    console.log('createHoaDon', response)
    return response.data.result || []
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function createDichVuVATTuyChinh(ma_hoadon_vat, dichVuData, navigate) {
  try {
    const response = await axiosInstance.post(`/dich-vu-vat-custome/${ma_hoadon_vat}`, dichVuData)
    console.log('createHoaDon', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getThongTinDichVuVATTuyChinh(ma_hoadon_vat, navigate) {
  try {
    const response = await axiosInstance.get(`/dich-vu-vat-custome/${ma_hoadon_vat}`)
    console.log('get thông tin dich vu vat tuy chinh', response)
    return response.data.result || []
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAllKhangHangBooKing(ma_booking, navigate) {
  try {
    const response = await axiosInstance.get(
      `/hoa-don-vat/thong-tin-khach-hang-booking/${ma_booking}`,
    )
    console.log('service thông tin khách hàng booking', response)
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
