import axiosInstance from './axiosConfig'

export async function getAllBooKing() {
  try {
    const response = await axiosInstance.get(`/booking`)
    console.log(response)
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getAllBooKing:', error)
    return null
  }
}

export async function getBooKingByMaBooKing(ma_booking) {
  try {
    const response = await axiosInstance.get(`/booking/${ma_booking}`)
    console.log('booking data', response)
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log('Lỗi getBooKingByMaBooKing:', error)
    return null
  }
}

export async function getChiTietBooKingByMaBooKing(ma_booking) {
  try {
    const response = await axiosInstance.get(`/chi-tiet-booking/${ma_booking}`, {
      validateStatus: () => {
        return true
      },
    })
    console.log('chi tiet booking', response)
    if (response.status === 200) {
      return response.data.result
    }
    return null
  } catch (error) {
    console.log(error)
  }
}

export async function createBooking(bookingData) {
  try {
    const response = await axiosInstance.post(`/booking`, bookingData)
    console.log('createBooking', response)
    return response.data
  } catch (error) {
    console.log('Lỗi createBooking:', error)
    throw error
  }
}

export async function updateBooking(ma_booking, bookingData) {
  try {
    const response = await axiosInstance.put(`/booking/${ma_booking}`, bookingData)

    console.log('createBooking', response)
    if (response.status === 200) {
      return response.data
    }
    return null
  } catch (error) {
    console.log(error)
    throw error
  }
}
