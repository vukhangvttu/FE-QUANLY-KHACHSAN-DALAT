import { CCol, CDatePicker, CFormLabel, CRow, CSpinner, CFormSelect } from '@coreui/react-pro'

import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
import { getPhongTrongTheoKhoanThoiGian } from 'src/service/PhongService'
import { getAllLoaiPhongBooKing } from 'src/service/LoaiPhongService'
import { ROOM_STATUS_STYLES } from '../chatroom/constants'
import ThongTinKhachHangTrenLine from '../modal/ThongTinKhachHangTrenLine'

const LineDuBaoPhong = ({ isActive }) => {
  const [roomData, setRoomData] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [loaiPhongList, setLoaiPhongList] = useState([])
  const [selectedLoaiPhong, setSelectedLoaiPhong] = useState('')
  const [selectedTang, setSelectedTang] = useState('')

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
    newDate.setDate(newDate.getDate() + 13)
    newDate.setHours(12, 0, 0, 0)
    return newDate
  }

  const date = new Date()
  const [valueNgayDen, setValueNgayDen] = useState(new Date())
  const [valueNgayDi, setValueNgayDi] = useState(getTomorrowAtNoon(date))

  const handleDateChangeNgayDen = (date) => {
    const newNgayDi = getTomorrowAtNoon(date)
    setValueNgayDen(date)
    setValueNgayDi(newNgayDi)
    // Gọi API khi ngày thay đổi với giá trị mới
    if (isActive) {
      setDays(generateDates(date, newNgayDi))
      fetchRoomDataWithDates(date, newNgayDi)
    }
  }

  const handleDateChangeNgayDi = (date) => {
    setValueNgayDi(date)
    // Gọi API khi ngày thay đổi với giá trị mới
    if (isActive) {
      setDays(generateDates(valueNgayDen, date))
      fetchRoomDataWithDates(valueNgayDen, date)
    }
  }

  useEffect(() => {
    if (isActive && !hasFetched) {
      fetchRoomData()
      fetchLoaiPhong()
      setHasFetched(true)
    }
    if (!isActive) {
      setHasFetched(false) // reset để lần sau vào lại tab sẽ fetch lại
    }
  }, [isActive])

  // Fetch danh sách loại phòng
  const fetchLoaiPhong = async () => {
    try {
      const data = await getAllLoaiPhongBooKing(navigate)
      if (data) {
        setLoaiPhongList(data)
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại phòng:', error)
    }
  }

  // Xử lý khi thay đổi loại phòng
  const handleLoaiPhongChange = (e) => {
    setSelectedLoaiPhong(e.target.value)
  }

  // Xử lý khi thay đổi tầng
  const handleTangChange = (e) => {
    setSelectedTang(e.target.value)
  }

  const navigate = useNavigate()

  const fetchRoomData = useCallback(async () => {
    try {
      setLoading(true)
      const ngayDen = format(valueNgayDen, 'yyyy-MM-dd')
      const ngayDi = format(valueNgayDi, 'yyyy-MM-dd')
      const data = await getPhongTrongTheoKhoanThoiGian(ngayDen, ngayDi, navigate)
      if (data) {
        setRoomData(data)
        setDays(generateDates(valueNgayDen, valueNgayDi))
      }
      return data
    } catch (error) {
      console.error('Error fetching dự báo rooms:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [valueNgayDen, valueNgayDi, navigate])

  const fetchRoomDataWithDates = useCallback(
    async (ngayDen, ngayDi) => {
      try {
        setLoading(true)
        const ngayDenFormatted = format(ngayDen, 'yyyy-MM-dd')
        const ngayDiFormatted = format(ngayDi, 'yyyy-MM-dd')
        const data = await getPhongTrongTheoKhoanThoiGian(
          ngayDenFormatted,
          ngayDiFormatted,
          navigate,
        )
        if (data) {
          setRoomData(data)
          setDays(generateDates(ngayDen, ngayDi))
        }
        return data
      } catch (error) {
        console.error('Error fetching dự báo rooms:', error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [navigate],
  )

  // Lọc dữ liệu phòng theo loại phòng và tầng
  const filterRoomData = (data) => {
    if (!selectedLoaiPhong && !selectedTang) return data
    
    return data.filter(room => {
      const matchLoaiPhong = !selectedLoaiPhong || room.maLoaiPhong === selectedLoaiPhong
      const matchTang = !selectedTang || room.maTang === selectedTang
      
      return matchLoaiPhong && matchTang
    })
  }

  // Gom các phòng trùng mã phòng lại thành 1 dòng duy nhất, mỗi dòng là 1 maPhong, chứa mảng các booking
  const groupRoomsByMaPhong = (roomData) => {
    const map = new Map()
    roomData.forEach((room) => {
      if (!map.has(room.maPhong)) {
        map.set(room.maPhong, [])
      }
      map.get(room.maPhong).push(room)
    })

    // Danh sách loại phòng đặc biệt cần đẩy xuống cuối
    const specialRoomTypes = ['GALA', 'HOI-THAO', 'HOI-TRUONG', 'TEA-BREAK', 'KHO-BUON']

    // Sắp xếp theo thứ tự từng tầng: 201, 301, 401, 202, 302, 402, ...
    const sortedEntries = Array.from(map.entries()).sort(([maPhongA, bookingsA], [maPhongB, bookingsB]) => {
      // Lấy loại phòng từ booking đầu tiên
      const loaiPhongA = bookingsA[0]?.maLoaiPhong || ''
      const loaiPhongB = bookingsB[0]?.maLoaiPhong || ''

      // Kiểm tra xem có phải loại phòng đặc biệt không
      const isSpecialA = specialRoomTypes.includes(loaiPhongA)
      const isSpecialB = specialRoomTypes.includes(loaiPhongB)

      // Nếu một trong hai là loại phòng đặc biệt, đẩy nó xuống cuối
      if (isSpecialA && !isSpecialB) return 1  // A xuống sau B
      if (!isSpecialA && isSpecialB) return -1 // B xuống sau A

      // Lấy số phòng từ mã phòng (ví dụ: 201 -> 01, 301 -> 01)
      const roomNumberA = maPhongA.slice(-2) // Lấy 2 ký tự cuối
      const roomNumberB = maPhongB.slice(-2)

      // Lấy số tầng từ mã phòng (ví dụ: 201 -> 2, 301 -> 3)
      const floorA = parseInt(maPhongA.slice(0, -2)) || 0
      const floorB = parseInt(maPhongB.slice(0, -2)) || 0

      // Sắp xếp theo số phòng trước, sau đó theo số tầng
      if (roomNumberA !== roomNumberB) {
        return roomNumberA.localeCompare(roomNumberB)
      }
      return floorA - floorB
    })

    return sortedEntries.map(([maPhong, bookings]) => ({ maPhong, bookings }))
  }

  // Thứ tự ưu tiên trạng thái
  const STATUS_PRIORITY = [
    'ĐANG Ở',
    'SẼ ĐI TRONG HÔM NAY',
    'SẼ ĐẾN TRONG HÔM NAY',
    'ĐÃ ĐẶT',
    'TRỐNG',
  ]

  // Lấy trạng thái ưu tiên nhất trong ngày cho 1 phòng
  const getBookingForDate = (bookings, date) => {
    // Lọc các booking có ngày hợp lệ và nằm trong ngày đó
    const validBookings = bookings.filter((room) => {
      if (!room.ngayDen || !room.ngayDi) return false
      const start = new Date(room.ngayDen)
      const end = new Date(room.ngayDi)
      const current = new Date(date)
      return current >= start && current < end
    })
    if (validBookings.length === 0) return null
    // Ưu tiên trạng thái
    validBookings.sort((a, b) => {
      return (
        STATUS_PRIORITY.indexOf(a.trangThaiHienTai) - STATUS_PRIORITY.indexOf(b.trangThaiHienTai)
      )
    })
    return validBookings[0]
  }

  // Kiểm tra xem ngày có phải là ngày trong quá khứ không
  const isPastDate = (date) => {
    const today = new Date()
    const currentDate = new Date(date)

    // Reset thời gian về 00:00:00 để so sánh chỉ ngày
    today.setHours(0, 0, 0, 0)
    currentDate.setHours(0, 0, 0, 0)

    return currentDate < today
  }

  // Lấy style cho ô dựa trên trạng thái và ngày
  const getCellStyle = (booking, date) => {
    // Nếu là ngày trong quá khứ
    if (isPastDate(date)) {
      // Nếu phòng trống và đã trả phòng thì hiển thị màu đỏ
      if (booking && booking.trangThaiHienTai === 'TRỐNG' && booking.daTraPhong === true) {
        return 'bg-purple-700 text-white'
      }
      // Ngược lại hiển thị màu trắng cho các ngày trong quá khứ
      return ROOM_STATUS_STYLES[booking?.trangThaiHienTai] || ROOM_STATUS_STYLES.default
    }

    // Nếu không phải ngày trong quá khứ, sử dụng logic cũ
    return ROOM_STATUS_STYLES[booking?.trangThaiHienTai] || ROOM_STATUS_STYLES.default
  }

  // Kiểm tra nếu ngày hiện tại là ngày đầu tiên của booking
  const isFirstDayOfBooking = (bookings, date) => {
    const booking = getBookingForDate(bookings, date)
    if (!booking || !booking.ngayDen) return false

    const bookingStartDate = new Date(booking.ngayDen)
    const currentDate = new Date(date)

    // So sánh năm, tháng, ngày
    return (
      bookingStartDate.getFullYear() === currentDate.getFullYear() &&
      bookingStartDate.getMonth() === currentDate.getMonth() &&
      bookingStartDate.getDate() === currentDate.getDate()
    )
  }

  const [visible, setVisible] = useState(false)

  const [ma_xepphong, setMa_xepphong] = useState('')

  const handleClick = (ma_xepphong) => {
    console.log('ma_xepphong', ma_xepphong)
    setMa_xepphong(ma_xepphong)
    setVisible(true)
  }

  return (
    <CRow className="bg-white shadow border-2 border-blue-500 rounded-md p-3">
      {/* Phần chọn ngày */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <CCol sm={12} md={3}>
          <CFormLabel htmlFor="inputPassword" className="labelcustome mb-2">
            Ngày đến
          </CFormLabel>
          <CDatePicker
            locale="en-GB"
            date={valueNgayDen}
            onDateChange={handleDateChangeNgayDen}
            // minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
          />
        </CCol>
        <CCol sm={12} md={3}>
          <CFormLabel htmlFor="inputPassword" className="labelcustome mb-2">
            Ngày đi
          </CFormLabel>
          <CDatePicker
            locale="en-GB"
            date={valueNgayDi}
            onDateChange={handleDateChangeNgayDi}
          />
        </CCol>
        <CCol sm={12} md={3}>
          <CFormLabel htmlFor="loaiPhongSelect" className="labelcustome mb-2">
            Hạng phòng
          </CFormLabel>
          <CFormSelect
            id="loaiPhongSelect"
            value={selectedLoaiPhong}
            onChange={handleLoaiPhongChange}
            className="border-2 border-blue-400 focus:border-blue-600"
          >
            <option value="">-- Chọn --</option>
            {loaiPhongList.map((loaiPhong) => (
              <option key={loaiPhong.maLoaiPhong} value={loaiPhong.maLoaiPhong}>
                {loaiPhong.tenLoaiPhong}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol sm={12} md={2}>
          <CFormLabel htmlFor="tangSelect" className="labelcustome mb-2">
            Lọc tầng
          </CFormLabel>
          <CFormSelect
            id="tangSelect"
            value={selectedTang}
            onChange={handleTangChange}
            className="border-2 border-green-400 focus:border-green-600"
          >
            <option value="">-- Tất cả --</option>
            {[ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((tang) => (
              <option key={tang} value={tang}>
                Tầng {tang}
              </option>
            ))}
          </CFormSelect>
        </CCol>
      </div>

      {/* Bảng dự báo */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CSpinner aria-hidden="true" />
          <span role="status">Loading...</span>
        </div>
      ) : (
        <>
          {!loading && (roomData.length === 0 || days.length === 0) && (
            <div className="text-center text-gray-500 py-8">Không có dữ liệu</div>
          )}
          <div
            className="w-full overflow-x-auto"
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              scrollbarWidth: 'thin', // Firefox
              scrollbarColor: '#cbd5e1 #f1f5f9', // Firefox
            }}
          >
            <style>{`
              .w-full::-webkit-scrollbar, .min-w-\[800px\]::-webkit-scrollbar {
                height: 8px;
                background: #f1f5f9;
              }
              .w-full::-webkit-scrollbar-thumb, .min-w-\[800px\]::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
              }
              .w-full::-webkit-scrollbar-thumb:hover, .min-w-\[800px\]::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
            <div className="min-w-[800px]">
              <table className="w-full table-fixed border-collapse">
                <thead className="sticky top-0 z-20 bg-gray-50">
                  <tr className="bg-gray-50 border-b">
                    <th className="w-[120px] border-r text-center py-2 sticky left-0 top-0 bg-gray-50 z-30">
                      <div className="font-bold">Loại phòng</div>
                    </th>
                    <th className="w-[120px] border-r text-center py-2 sticky left-0 top-0 bg-gray-50 z-30">
                      <div className="font-bold">Phòng</div>
                    </th>

                    {days.map((day) => (
                      <th
                        key={day.date}
                        className="w-[120px] border-r text-center py-2 sticky top-0 bg-gray-50 z-20"
                      >
                        <div className="font-bold">{day.day}</div>
                        <div className="text-blue-600 text-sm">{day.name}</div>
                        {/* <div className="text-sm text-green-600">{day.date}</div> */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupRoomsByMaPhong(filterRoomData(roomData)).map(({ maPhong, bookings }) => {
                    const roomInfo = bookings[0]
                    // Gom các đoạn liên tiếp cùng booking (tenkhachhang + trạng thái)
                    const cells = []
                    let i = 0
                    while (i < days.length) {
                      const booking = getBookingForDate(bookings, days[i].date)
                      // Nếu không có booking hoặc maxepphongbooking === null thì render ô trống
                      if ( !booking ||
                        booking.maxepphongbooking === null ||
                        booking.daTraPhong === true) {
                        const emptyCellClass = isPastDate(days[i].date) ? 'bg-white' : 'bg-white'
                        cells.push(
                          <td
                            key={`${maPhong}-${days[i].date}`}
                            className={`p-0 relative ${emptyCellClass}`}
                          >
                            <div className="flex flex-col items-center justify-center py-2">
                              <span className="text-xs font-semibold">&nbsp;</span>
                            </div>
                          </td>,
                        )
                        i++
                        continue
                      }
                      // Tìm đoạn liên tiếp cùng booking (so sánh tenkhachhang + trạng thái)
                      let j = i + 1
                      while (j < days.length) {
                        const nextBooking = getBookingForDate(bookings, days[j].date)
                        if (
                          nextBooking &&
                          nextBooking.maxepphongbooking === booking.maxepphongbooking &&
                          nextBooking.trangThaiHienTai === booking.trangThaiHienTai
                        ) {
                          j++
                        } else {
                          break
                        }
                      }
                      // Tô màu theo trạng thái và ngày
                      const cellClass = getCellStyle(booking, days[i].date)

                      // Render 1 ô colSpan cho đoạn này không có border
                      cells.push(
                        <td
                          key={`${maPhong}-${days[i].date}`}
                          colSpan={j - i}
                          className={`p-0 relative ${cellClass} cursor-pointer border-0`}
                          onClick={() => {
                            handleClick(booking.maxepphongbooking)
                          }}
                          style={{
                            borderWidth: 0,
                            clipPath:
                              j < days.length
                                ? 'polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)'
                                : 'none',
                          }}
                        >
                          <div className="flex flex-col items-center justify-center py-2 w-full h-full">
                            <span
                              className={`text-xs font-semibold ${
                                isPastDate(days[i].date) &&
                                booking.trangThaiHienTai === 'TRỐNG' &&
                                booking.daTraPhong === true
                                  ? 'text-white'
                                  : 'text-white'
                              }`}
                            >
                              {booking.tenkhachhang}
                            </span>
                            {/* <span className="text-xs text-white">
                              {new Date(booking.ngayDen).getDate()}/
                              {new Date(booking.ngayDen).getMonth() + 1} -{' '}
                              {new Date(booking.ngayDi).getDate()}/
                              {new Date(booking.ngayDi).getMonth() + 1}
                            </span> */}
                          </div>
                        </td>,
                      )
                      i = j
                    }
                    return (
                      <tr key={maPhong} className="border-b hover:bg-gray-50">
                        <td className="px-2 border-r sticky left-0 bg-white z-10">
                          <div className="flex flex-col">
                            <div className="font-medium">{roomInfo.maLoaiPhong}</div>
                          </div>
                        </td>
                        <td className="px-2 border-r sticky left-0 bg-white z-10">
                          <div className="flex flex-col">
                            <div className="font-medium">{roomInfo.tenPhong}</div>
                          </div>
                        </td>

                        {cells}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ThongTinKhachHangTrenLine
        visible={visible}
        onClose={() => {
          setVisible(false)
        }}
        ma_xepphong={ma_xepphong}
      />
    </CRow>
  )
}

LineDuBaoPhong.propTypes = {
  isActive: PropTypes.bool.isRequired,
}

export default LineDuBaoPhong
