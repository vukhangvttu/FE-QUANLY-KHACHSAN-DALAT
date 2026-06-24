import { CCol, CDatePicker, CFormLabel, CRow, CSpinner } from '@coreui/react-pro'

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { getXemDuBaoPhongTrong } from 'src/service/LoaiPhongService'
import { format } from 'date-fns'
const EXCLUDED_ROOM_TYPES = ['HOI-TRUONG', 'HOI-THAO', 'GA-LA', 'PHONG-HOP']

const DuBaoLoaiPhong = ({ isActive }) => {
  const [roomData, setRoomData] = useState([])
  const [loading, setLoading] = useState(false)

  // Generate dates for the week 
  const generateDates = (checkin, checkout) => {
    if (!checkin || !checkout) return []

    // Hàm format ngày không bị ảnh hưởng bởi múi giờ
    const formatDate = (date) => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}` // YYYY-MM-DD
    }

    // Tạo ngày không bị ảnh hưởng múi giờ
    const start = new Date(checkin)
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())

    const end = new Date(checkout)
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())

    const days = []
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      days.push({
        date: formatDate(currentDate), // Sử dụng format YYYY-MM-DD
        day: currentDate.getDate(),
        name: dayNames[currentDate.getDay()],
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log('Generated days:', days) // Debug
    return days
  }
  const [days, setDays] = useState([])

  const getTomorrowAtNoon = (date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 6)
    newDate.setHours(12, 0, 0, 0)
    return newDate
  }

  const date = new Date()
  const [valueNgayDen, setValueNgayDen] = useState(new Date())
  const [valueNgayDi, setValueNgayDi] = useState(getTomorrowAtNoon(date))

  const handleDateChangeNgayDen = (date) => {
    setValueNgayDen(date)
    setValueNgayDi(getTomorrowAtNoon(date))
    // Gọi API khi ngày thay đổi
    if (isActive) {
      setDays(generateDates(date, getTomorrowAtNoon(date)))
      fetchRoomData(date, valueNgayDi)
    }
  }

  const handleDateChangeNgayDi = (date) => {
    setValueNgayDi(date)
    // Gọi API khi ngày thay đổi
    if (isActive) {
      setDays(generateDates(valueNgayDen, date))
      fetchRoomData(valueNgayDen, date)
    }
  }

  console.log(isActive)

  useEffect(() => {
    if (isActive) {
      // Chỉ gọi API lần đầu khi component được kích hoạt

      setDays(generateDates(valueNgayDen, valueNgayDi))
      fetchRoomData(valueNgayDen, valueNgayDi)
    }
  }, [isActive, valueNgayDen, valueNgayDi])

  // const navigate = useNavigate()

  const fetchRoomData = async (ngayDen, ngayDi) => {
    try {
      setLoading(true)
      // Sử dụng toISOString() để có format nhất quán
      const ngayDenFormat = format(ngayDen, 'yyyy-MM-dd')
      const ngayDiFormat = format(ngayDi, 'yyyy-MM-dd')

      console.log('ngayDen', ngayDenFormat)
      console.log('ngayDi', ngayDiFormat)

      const response = await getXemDuBaoPhongTrong(ngayDenFormat, ngayDiFormat)

      if (response) {
        console.log('API Response:', response)
        // Chuẩn hóa format ngày trong response (nếu cần)
        const normalizedData = response.map((item) => ({
          ...item,
          ngay: new Date(item.ngay).toISOString().split('T')[0],
        }))
        setRoomData(normalizedData)
      }
    } catch (error) {
      console.error('Error fetching room data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Lấy danh sách loại phòng duy nhất
  const getRoomTypes = () => {
    const types = new Map()
    roomData.forEach((item) => {
      if (!types.has(item.maLoaiPhong)) {
        types.set(item.maLoaiPhong, {
          maLoaiPhong: item.maLoaiPhong,
          tenLoaiPhong: item.tenLoaiPhong,
        })
      }
    })
    return Array.from(types.values())
  }

  // Lấy thông tin phòng cho một ngày và loại phòng cụ thể
  const getRoomInfo = (date, maLoaiPhong) => {
    // Chuẩn hóa cả 2 về cùng định dạng trước khi so sánh
    const normalizedDate = new Date(date).toISOString().split('T')[0]

    const room = roomData.find(
      (item) =>
        new Date(item.ngay).toISOString().split('T')[0] === normalizedDate &&
        item.maLoaiPhong === maLoaiPhong,
    )

    return room || { soPhongTrong: 0, tongSoPhong: 0 }
  }

  const isCountableRoom = (maLoaiPhong) => {
    return maLoaiPhong !== 'EXTRA-BED' && !EXCLUDED_ROOM_TYPES.includes(maLoaiPhong)
  }

  // Tính tổng số phòng trống cho một ngày
  const getTotalAvailableRooms = (date) => {
    return roomData
      .filter((item) => item.ngay === date && isCountableRoom(item.maLoaiPhong))
      .reduce((sum, item) => sum + item.soPhongTrong, 0)
  }

  // Tính tổng số phòng cho một ngày
  const getTotalRooms = (date) => {
    return roomData
      .filter((item) => item.ngay === date && isCountableRoom(item.maLoaiPhong))
      .reduce((sum, item) => sum + item.tongSoPhong, 0)
  }

  // Tính tổng số phòng đã đặt cho một ngày
  const getTotalBookedRooms = (date) => {
    return roomData
      .filter((item) => item.ngay === date && isCountableRoom(item.maLoaiPhong))
      .reduce((sum, item) => sum + (item.tongSoPhong - item.soPhongTrong), 0)
  }

  // Tính phần trăm phòng đã đặt
  const getBookedPercentage = (date) => {
    const totalRooms = getTotalRooms(date)
    const bookedRooms = getTotalBookedRooms(date)
    return totalRooms > 0 ? ((bookedRooms / totalRooms) * 100).toFixed(0) : 0
  }

  // Tính phần trăm phòng chưa đặt
  const getAvailablePercentage = (date) => {
    const totalRooms = getTotalRooms(date)
    const availableRooms = getTotalAvailableRooms(date)
    return totalRooms > 0 ? ((availableRooms / totalRooms) * 100).toFixed(0) : 0
  }

  // Kiểm tra xem ngày có phải là trong quá khứ không
  const isPastDate = (date) => {
    const today = new Date()
    const checkDate = new Date(date)

    // Đặt thời gian về 00:00:00 để so sánh chỉ ngày
    today.setHours(0, 0, 0, 0)
    checkDate.setHours(0, 0, 0, 0)

    return checkDate < today
  }

  return (
    <CRow className="bg-white  shadow  border-2 border-blue-500 rounded-md p-3">
      {/* Phần chọn ngày */}

      <div className=" mb-4">
        <CRow>
          <CCol sm={12} md={3}>
            <CRow>
              <CFormLabel htmlFor="inputPassword" className="col-sm-4 col-form-label labelcustome">
                Ngày đến
              </CFormLabel>
              <CCol sm={6}>
                <CDatePicker
                  locale="en-GB"
                  date={valueNgayDen}
                  onDateChange={handleDateChangeNgayDen}
                  // minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                />
              </CCol>
            </CRow>
          </CCol>
          <CCol sm={12} md={3}>
            <CRow>
              <CFormLabel htmlFor="inputPassword" className="col-sm-4 col-form-label labelcustome">
                Ngày đi
              </CFormLabel>
              <CCol sm={6}>
                <CDatePicker
                  locale="en-GB"
                  date={valueNgayDi}
                  onDateChange={handleDateChangeNgayDi}
                />
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </div>

      {/* Bảng dự báo */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CSpinner aria-hidden="true" />
          <span role="status">Loading...</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Đặt chiều rộng tối thiểu cho bảng */}
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-[200px] border-r text-center py-2 sticky left-0 bg-gray-50 z-10">
                    <div className="font-bold">Loại phòng</div>
                  </th>
                  {days.map((day) => (
                    <th
                      key={day.date}
                      className={`w-[150px] border-r text-center py-2 ${
                        isPastDate(day.date) ? 'bg-yellow-100' : ''
                      }`}
                    >
                      <div className="font-bold">{day.day}</div>
                      <div className="text-blue-600 text-sm">{day.name}</div>
                      <div className="text-sm text-green-600">
                        Tổng: {getTotalAvailableRooms(day.date)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getRoomTypes().map((roomType) => (
                  <tr key={roomType.maLoaiPhong} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-3 border-r sticky left-0 bg-white z-10">
                      <div className="flex flex-col">
                        <div className="font-medium">{roomType.tenLoaiPhong}</div>
                        {/* <div className="text-sm text-gray-500">({roomType.maLoaiPhong})</div> */}
                      </div>
                    </td>
                    {days.map((day) => {
                      const roomInfo = getRoomInfo(day.date, roomType.maLoaiPhong)
                      return (
                        <td
                          key={`${roomType.maLoaiPhong}-${day.date}`}
                          className={`border-r p-0 relative ${
                            isPastDate(day.date) ? 'bg-yellow-50' : ''
                          }`}
                        >
                          <div className=" inset-x-0 mx-1 rounded flex flex-col items-center justify-center">
                            <span
                              className={`text-sm ${
                                roomInfo.soPhongTrong > 0
                                  ? 'text-green-600 font-bold text-xl'
                                  : 'text-red-600'
                              }`}
                            >
                              {roomInfo.soPhongTrong}/{roomInfo.tongSoPhong}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="border-r py-2 sticky left-0 bg-gray-100">
                    <div className="font-bold text-blue-600 px-2">Số Phòng Đã Đặt</div>
                  </th>
                  {days.map((day) => {
                    const totalRooms = getTotalRooms(day.date)
                    const bookedRooms = getTotalBookedRooms(day.date)
                    const percentage = getBookedPercentage(day.date)

                    return (
                      <th
                        key={`booked-${day.date}`}
                        className={`border-r text-center py-2 ${
                          isPastDate(day.date) ? 'bg-yellow-100' : ''
                        }`}
                      >
                        <div className="font-bold text-blue-600">
                          {bookedRooms}/{totalRooms} ({percentage}%)
                        </div>
                      </th>
                    )
                  })}
                </tr>
                <tr className="bg-gray-100">
                  <th className="border-r py-2 sticky left-0 bg-gray-100">
                    <div className="font-bold px-2">Số Phòng Chưa Đặt</div>
                  </th>
                  {days.map((day) => {
                    const totalRooms = getTotalRooms(day.date)
                    const availableRooms = getTotalAvailableRooms(day.date)
                    const percentage = getAvailablePercentage(day.date)

                    return (
                      <th
                        key={`available-${day.date}`}
                        className={`border-r text-center py-2 ${
                          isPastDate(day.date) ? 'bg-yellow-100' : ''
                        }`}
                      >
                        <div className="font-bold">
                          {availableRooms}/{totalRooms} ({percentage}%)
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CRow>
  )
}

DuBaoLoaiPhong.propTypes = {
  isActive: PropTypes.bool.isRequired,
}

export default DuBaoLoaiPhong
