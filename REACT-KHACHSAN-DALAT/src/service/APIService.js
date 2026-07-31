import axiosInstance from './axiosConfig'

// source booking
export async function getAllNguonKhach(navigate) {
  try {
    const response = await axiosInstance.get(`/nguon-khach`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllNguonKhach:', error)
    return null
  }
}

export async function getAllKhuVuc(navigate) {
  try {
    const response = await axiosInstance.get(`/khu-vuc`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllKhuVuc:', error)
    return null
  }
}

export async function getAllThiTruong(navigate) {
  try {
    const response = await axiosInstance.get(`/thi-truong`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllThiTruong:', error)
    return null
  }
}

export async function getAllHinhThucThanhToan(navigate) {
  try {
    const response = await axiosInstance.get(`/hinh-thuc-thanh-toan`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllHinhThucThanhToan:', error)
    return null
  }
}

export async function getAllMucDichDen(navigate) {
  try {
    const response = await axiosInstance.get(`/muc-dich-den`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllMucDichDen:', error)
    return null
  }
}

export async function getAllGiamGia(navigate) {
  try {
    const response = await axiosInstance.get(`/giam-gia`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllGiamGia:', error)
    return null
  }
}

export async function getAllTrangThaiBooKing() {
  try {
    const response = await axiosInstance.get(`/trang-thai-booking`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllTrangThaiBooKing:', error)
    return null
  }
}

export async function getAllLoaiThe(navigate) {
  try {
    const response = await axiosInstance.get(`/loai-the`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllLoaiThe:', error)
    return null
  }
}

export async function getAllYeuCau(navigate) {
  try {
    const response = await axiosInstance.get(`/yeu-cau`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllYeuCau:', error)
    return null
  }
}

export async function getAllLoaiGia(navigate) {
  try {
    const response = await axiosInstance.get(`/loai-gia`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllLoaiGia:', error)
    return null
  }
}

export async function getAllDanhXung(navigate) {
  try {
    const response = await axiosInstance.get(`/danh-xung`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllDanhXung:', error)
    return null
  }
}

export async function getAllTinhThanh(navigate) {
  try {
    const response = await axiosInstance.get(`/tinh-thanh`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllTinhThanh:', error)
    return null
  }
}

export async function getHuyenByMaTinh(maTinh, navigate) {
  try {
    const response = await axiosInstance.get(`/huyen/${maTinh}`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getHuyenByMaTinh:', error)
    return null
  }
}

export async function getlPhuongXaByMaHuyen(maHuyen) {
  try {
    const response = await axiosInstance.get(`/phuong-xa/${maHuyen}`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getlPhuongXaByMaHuyen:', error)
    return null
  }
}

export async function getlPhuongXaByMaTinh(maTinh) {
  try {
    const response = await axiosInstance.get(`/phuong-xa/${maTinh}`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getlPhuongXaByMaTinh:', error)
    return null
  }
}

export async function getAllQuocGia() {
  try {
    const response = await axiosInstance.get(`/quoc-gia`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllQuocGia:', error)
    return null
  }
}

export async function getAllLoaiGiayTo(navigate) {
  try {
    const response = await axiosInstance.get(`/loai-giay-to`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllLoaiGiayTo:', error)
    return null
  }
}

export async function getAllLoaiTreEm(navigate) {
  try {
    const response = await axiosInstance.get(`/loai-tre-em`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllLoaiTreEm:', error)
    return null
  }
}

export async function deleteChiTietBooKing(ma_chitiet, ma_booking, navigate) {
  try {
    const response = await axiosInstance.delete(`/chi-tiet-booking/${ma_chitiet}/${ma_booking}`)
    
    if (response.status === 200) {
      return response.data
    }
    return null
  } catch (error) {
    console.log('Lỗi deleteChiTietBooKing:', error)
    return null
  }
}

// hội nghị
export async function deletePhongHoiNghi(ma_booking, ma_phong_hoi_nghi, navigate) {
  try {
    const response = await axiosInstance.delete(
      `/phong-hoi-nghi/${ma_booking}/${ma_phong_hoi_nghi}`,
    )
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi deletePhongHoiNghi:', error)
    return null
  }
}

// kiểm tra phòng hội nghị

export async function getKiemTraPhongHoiNghi(ngayBD, ngayKT, navigate) {
  try {
    const response = await axiosInstance.get(`/phong-hoi-nghi/kiem-tra-phong-hoi-nghi`, {
      params: {
        ngayBD: ngayBD,
        ngayKT: ngayKT,
      },
    })
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getKiemTraPhongHoiNghi:', error)
    return null
  }
}

// lấy thông tin khách hàng hiển thị trên line phòng

export async function getThongTinKhachHangBooKing(ma_xepphong, navigate) {
  try {
    const response = await axiosInstance.get(`/phong/thong-tin-khach-hang-booking/${ma_xepphong}`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getThongTinKhachHangBooKing:', error)
    return null
  }
}

export async function createThemPhuongXa(DataPhuongXa, navigate) {
  try {
    const response = await axiosInstance.post(`/phuong-xa`, DataPhuongXa)
    console.log('create phường xã', response)
    return response.data
  } catch (error) {
    console.log('Lỗi createThemPhuongXa:', error)
    throw error
  }
}

export async function getPhuongXaUserTuThem() {
  try {
    const response = await axiosInstance.get(`/phuong-xa/phuong-xa-user-tu-them`)
    console.log('phường xã tự thêm', response)
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getPhuongXaUserTuThem:', error)
    throw error
  }
}

export async function getAllHinhThucThanhToanByMa() {
  try {
    const response = await axiosInstance.get(`/hinh-thuc-thanh-toan/theo-danh-sach`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllHinhThucThanhToanByMa:', error)
    return null
  }
}

export async function getGiaPhongTheoMaLoaiPhong(maLoaiPhong) {
  try {
    const response = await axiosInstance.get(`/gia-phong/theo-loai-phong/${maLoaiPhong}`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getGiaPhongTheoMaLoaiPhong:', error)
    return null
  }
}

export async function getListGiaPhongTheoNgay(maXepPhong, navigate) {
  try {
    const response = await axiosInstance.get(`/gia-phong/theo-xep-phong/${maXepPhong}`)
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getListGiaPhongTheoNgay:', error)
    return null
  }
}

export async function getThongTinXuatPhieuChiTietBooking(ma_booking) {
  try {
    const response = await axiosInstance.get(
      `/chi-tiet-booking/xuat-phieu-chi-tiet-dat-phong/${ma_booking}`,
    )
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getThongTinXuatPhieuChiTietBooking:', error)
    return null
  }
}

export async function updateTrangThaiBooking(maBooking, maTrangThai) {
  try {
    const response = await axiosInstance.put(`/booking/update-trang-thai/${maBooking}/${maTrangThai}`)
    
    if (response.status === 200) {
      return response.data
    }
    return null
  } catch (error) {
    console.log('Lỗi updateTrangThaiBooking:', error)
    throw error
  }
}

export async function getThongTinXuatPhieuChiTietPhuThuBooking(ma_booking) {
  try {
    const response = await axiosInstance.get(
      `/chi-tiet-booking/xuat-phieu-chi-tiet-dat-phong-phu-thu/${ma_booking}`,
    )
    
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getThongTinXuatPhieuChiTietBooking:', error)
    return null
  }
}
