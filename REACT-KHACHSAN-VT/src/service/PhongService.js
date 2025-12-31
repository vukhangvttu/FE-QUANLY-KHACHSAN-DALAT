import axiosInstance from './axiosConfig'
import config from './Config'

export async function getPhongByMaLoaiPhong(maloaiphong, navigate) {
  try {
    const response = await axiosInstance.get('/phong', {
      params: {
        maLoaiPhong: maloaiphong,
      },
    })
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}

export async function getAllPhong(navigate) {
  try {
    const response = await axiosInstance.get('/phong/chat-room')
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}

export async function updateTrangThaiVeSinh(trangthai, maPhong, navigate) {
  try {
    const token = localStorage.getItem('token') // Lấy token từ localStorage
    if (!token) {
      console.error('Không tìm thấy token!')
      navigate('/login') // Chuyển hướng nếu token bị mất
      return
    }

    const response = await axiosInstance.put(
      `/phong/trang-thai-ve-sinh/${maPhong}`,
      null, // Không truyền body vì API dùng query parameters
      {
        params: {
          trangThaiVeSinh: trangthai, // Truyền dữ liệu qua query params
        },
      },
    )

    console.log('Response:', response)

    // if (response.status === 401 || response.status === 400) {
    //   console.warn('Unauthorized, chuyển hướng đến login...')
    //   navigate('/login')
    // }

    return response.data
  } catch (error) {
    console.error('Lỗi khi gọi API:', error)
    throw error
  }
}

export async function getListPhongTrongTheoKhoanThoiGian(maLoaiPhong, ngayDen, ngayDi) {
  try {
    const response = await axiosInstance.get('/phong/kiem-tra-phong-trong', {
      params: {
        maLoaiPhong: maLoaiPhong,
        ngay_den: ngayDen,
        ngay_di: ngayDi,
      },
    })
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}

export async function getListPhongTrongTheoKhoanThoiGianAndBooking(
  maLoaiPhong,
  ngayDen,
  ngayDi,
  ma_booking,
  navigate,
) {
  try {
    const response = await axiosInstance.get(
      `/phong/kiem-tra-phong-trong-add-xep-phong/${ma_booking}`,
      {
        params: {
          maLoaiPhong: maLoaiPhong,
          ngay_den: ngayDen,
          ngay_di: ngayDi,
        },
      },
    )
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}

export async function getPhongTrongTheoKhoanThoiGian(ngayDen, ngayDi, navigate) {
  try {
    const response = await axiosInstance.get('/phong/du-bao-phong-khoan-thoi-gian', {
      params: {
        ngay_bd: ngayDen,
        ngay_kt: ngayDi,
      },
    })
    console.log('du bao', response)
    if (response.status === 200) {
      return response.data.result
    }
    // if (response.status === 401 || response.status === 400) {
    //   navigate('/login')
    // }
  } catch (error) {
    console.log(error)
  }
}
