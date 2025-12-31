import axiosInstance from './axiosConfig'

export async function saveChuyenPhong(
  ma_xepphong,
  ma_phong_cu,
  ma_phong_moi,
  ma_loai_phong,
  danh_sach_gia_phong,
) {
  try {
    const response = await axiosInstance.post('/chuyen-phong', danh_sach_gia_phong, {
      params: {
        ma_xepphong: ma_xepphong,
        ma_phong_cu: ma_phong_cu,
        ma_phong_moi: ma_phong_moi,
        ma_loai_phong: ma_loai_phong,
      },
    })

    console.log('Response:', response)
    return response.data
  } catch (error) {
    console.error('Lỗi khi gọi API:', error)
    throw error
  }
}
