/**
 * Utility functions để xử lý JWT token và phân quyền
 */

/**
 * Decode JWT token từ localStorage
 * @returns {Object|null} Decoded token payload hoặc null nếu không có token
 */
export const decodeToken = () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('Không tìm thấy token trong localStorage')
      return null
    }

    // JWT token có format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Token không đúng định dạng JWT')
      return null
    }

    // Decode payload (phần thứ 2)
    const payload = parts[1]
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))

    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Lỗi khi decode token:', error)
    return null
  }
}

/**
 * Lấy danh sách scope từ token
 * @returns {Array} Mảng các scope hoặc mảng rỗng
 */
export const getScopes = () => {
  const tokenPayload = decodeToken()
  if (!tokenPayload || !tokenPayload.scope) {
    return []
  }

  // Scope được lưu dưới dạng string, cần split thành array
  return tokenPayload.scope.split(' ').filter((scope) => scope.trim() !== '')
}

/**
 * Kiểm tra xem user có quyền truy cập scope cụ thể không
 * @param {string} requiredScope - Scope cần kiểm tra
 * @returns {boolean} True nếu có quyền, false nếu không
 */
export const hasPermission = (requiredScope) => {
  const scopes = getScopes()
  return scopes.includes(requiredScope)
}

/**
 * Kiểm tra xem user có bất kỳ quyền nào trong danh sách không
 * @param {Array<string>} requiredScopes - Mảng các scope cần kiểm tra
 * @returns {boolean} True nếu có ít nhất một quyền, false nếu không có quyền nào
 */
export const hasAnyPermission = (requiredScopes) => {
  const scopes = getScopes()
  return requiredScopes.some((scope) => scopes.includes(scope))
}

/**
 * Kiểm tra xem user có tất cả quyền trong danh sách không
 * @param {Array<string>} requiredScopes - Mảng các scope cần kiểm tra
 * @returns {boolean} True nếu có tất cả quyền, false nếu thiếu quyền
 */
export const hasAllPermissions = (requiredScopes) => {
  const scopes = getScopes()
  return requiredScopes.every((scope) => scopes.includes(scope))
}

/**
 * Lấy thông tin user từ token
 * @returns {Object|null} Thông tin user hoặc null
 */
export const getUserInfo = () => {
  const tokenPayload = decodeToken()
  if (!tokenPayload) {
    return null
  }

  return {
    manhanvien: tokenPayload.manhanvien,
    sub: tokenPayload.sub,
    scopes: getScopes(),
    exp: tokenPayload.exp,
    iat: tokenPayload.iat,
  }
}

/**
 * Kiểm tra xem token có hết hạn không
 * @returns {boolean} True nếu token đã hết hạn, false nếu còn hiệu lực
 */
export const isTokenExpired = () => {
  const tokenPayload = decodeToken()
  if (!tokenPayload || !tokenPayload.exp) {
    return true
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return tokenPayload.exp < currentTime
}

/**
 * Mapping các scope với tên tab/component
 */
export const SCOPE_MAPPING = {
  SODOPHONG: 'Sơ đồ phòng',
  BUONGPHONG: 'Buồng phòng',
  LINEPHONG: 'Line phòng',
  DUBAOLOAIPHONG: 'Dự báo loại phòng',
  DUBAOKHACH: 'Dự báo khách',
  NHAHANG: 'Nhà hàng',
  THONGKE: 'Thống kê',
  DANHSACHDATPHONG: 'Danh sách đặt phòng',
  DATPHONG: 'Đặt phòng',
  THONGKETILEFULLPHONG: 'Thống kê tỉ lệ FULL phòng',
  THONGKEDOANHSOKPINHANVIEN: 'Thống kê doanh số KPI nhân viên',
  THONGKEDOANHTHU: 'Thống kê doanh thu',
}

/**
 * Lấy danh sách các tab được phép hiển thị dựa trên scope
 * @returns {Array} Mảng các tab được phép hiển thị
 */
export const getAllowedTabs = () => {
  const scopes = getScopes()
  const allowedTabs = []

  // Mapping scope với tab key
  const scopeToTabMapping = {
    THONGKEDOANHTHU: 1,
    DUBAOLOAIPHONG: 1,
    SODOPHONG: 2,
    THONGKETILEFULLPHONG: 3,
    BUONGPHONG: 3,
    THONGKEDOANHSOKPINHANVIEN: 4,
    NHAHANG: 4,
    LINEPHONG: 6,
    DUBAOKHACH: 7,
  }

  scopes.forEach((scope) => {
    if (scopeToTabMapping[scope]) {
      allowedTabs.push({
        key: scopeToTabMapping[scope],
        scope: scope,
        name: SCOPE_MAPPING[scope],
      })
    }
  })

  return allowedTabs.sort((a, b) => a.key - b.key)
}
