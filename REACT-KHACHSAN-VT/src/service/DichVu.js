import axiosInstance from './axiosConfig'
import config from './Config'

export async function getAllNhomDichVu(navigate) {
  try {
    const response = await axiosInstance.get('/nhom-dich-vu')
    console.log(response)
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

export async function getAllDichVu(navigate) {
  try {
    const response = await axiosInstance.get('/dich-vu')
    console.log(response)
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

export async function createPhieuDichVu(maPhong, ma_booking, phieuDichVuData, navigate) {
  try {
    const response = await axiosInstance.post(
      `/phieu-dich-vu/${maPhong}/${ma_booking}`,
      phieuDichVuData,
    )
    console.log('createBooking', response)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAllPhieuDichVuByMaBooKing(ma_xep_phong_booking, navigate) {
  try {
    const response = await axiosInstance.get(`/phieu-dich-vu/${ma_xep_phong_booking}`)
    console.log(response)
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

export async function updatePhieuDichVu(
  ma_booking,
  ma_phong,
  ma_xepphong_booking,
  phieuDichVuData,
  navigate,
) {
  try {
    const response = await axiosInstance.put(
      `/phieu-dich-vu/${ma_booking}/${ma_phong}/${ma_xepphong_booking}`,
      phieuDichVuData,
    )

    console.log('createBooking', response)

    if (response.status === 401 || response.status === 400) {
      navigate('/login')
    }

    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteDichVuTrongPhieu(ma_booking, ma_phieudichvu, navigate) {
  try {
    const response = await axiosInstance.delete(`/phieu-dich-vu/${ma_booking}/${ma_phieudichvu}`)

    console.log('createBooking', response)

    if (response.status === 401 || response.status === 400) {
      navigate('/login')
    }

    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}
