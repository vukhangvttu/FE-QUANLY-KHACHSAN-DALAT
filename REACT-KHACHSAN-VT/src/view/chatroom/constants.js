export const ROOM_STATUS_STYLES = {
  'TRỐNG': 'bg-white text-gray-800 border border-gray-300',
  'ĐÃ ĐẶT': 'bg-blue-600 text-white',
  'ĐANG Ở': 'bg-green-500 text-white',
  'SẼ ĐẾN TRONG HÔM NAY': 'bg-blue-600 text-white border border-blue-300',
  'SẼ ĐI TRONG HÔM NAY': 'bg-amber-600 text-white',
  'CHECK-IN TRỄ': 'bg-blue-600 text-white border border-blue-300',
  'CHECK-OUT TRỄ': 'bg-white text-gray-800 border border-gray-300',
  default: 'bg-white text-gray-800 border border-gray-300',
}
export const ROOM_STATUS_BUON_PHONG_STYLES = {
  DƠ: 'bg-red-500 text-white',
  SẠCH: 'bg-white text-gray-800 border border-gray-300',
  'SẼ ĐẾN TRONG HÔM NAY': 'bg-blue-100 text-blue-800 border border-blue-300',
  'ĐANG Ở': 'bg-green-500 text-white',
  'SẼ ĐI TRONG HÔM NAY': 'bg-amber-600 text-white',
  'CHECK-IN TRỄ': 'bg-blue-100 text-blue-800 border border-blue-300',
  'CHECK-OUT TRỄ': 'bg-amber-600 text-white',
  default: 'bg-white text-gray-800 border border-gray-300',
}

export const ROOM_STATUS_LABELS = {
  SẠCH: {
    text: 'Sạch',
    className: 'text-gray-600 ',
  },
  'CHƯA DỌN': {
    text: 'Dơ',
    className: 'text-red-500 ',
  },
}

export const ROOM_ACTIONS = {
  CLEAN: 'Làm sạch',
  UNCLEAN: 'Chưa dọn',
  CHECKOUT: 'Check-out',
  SERVICES: 'Dịch vụ',
  ADD_GUEST: 'Add guest to room',
  PAYMENT: 'Thanh toán',
  CHECKIN: 'Check-in',
  PRINT_REGISTRATION_FROM: 'In phiếu đăng ký',
  PRINT_REGISTRATION_FROM_OTA_TA: 'In phiếu ĐK OTA/TA',
  PRINT_REGISTRATION_FROM_CHI_TIET_DAT_PHONG: 'In chi tiết đặt phòng',
}
