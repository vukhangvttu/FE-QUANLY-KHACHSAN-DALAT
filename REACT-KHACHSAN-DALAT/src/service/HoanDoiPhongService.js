import axiosInstance from './axiosConfig'

export async function saveHoanDoiPhong(
  ma_xepphong_1,
  ma_phong_1,
  ma_xepphong_2,
  ma_phong_2,
  danh_sach_gia_phong,
) {
  try {
    const response = await axiosInstance.post('/hoan-doi-phong', danh_sach_gia_phong, {
      params: {
        ma_xepphong_1: ma_xepphong_1,
        ma_phong_1: ma_phong_1,
        ma_xepphong_2: ma_xepphong_2,
        ma_phong_2: ma_phong_2,
      },
    })

    console.log('Response Hoán đổi phòng:', response)
    return response.data
  } catch (error) {
    console.error('Lỗi khi gọi API Hoán đổi phòng:', error)
    throw error
  }
}
