import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faCircle,
  faGripLines,
  faListUl,
  faPlus,
  faTableCells,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons'

import RoomCard from './RoomCard'
import { CButton, CSpinner, CTab, CTabContent, CTabList, CTabPanel, CTabs } from '@coreui/react-pro'

import { Link, useNavigate } from 'react-router-dom'

import { useDuBaoRooms, useRooms } from './hooks'
import ViewBuonPhong from '../buonphong/ViewBuonPhong'
import ViewNhaHang from '../NhaHang/ViewNhaHang'
import DuBaoLoaiPhong from '../dubao/DuBaoLoaiPhong'
import LineDuBaoPhong from '../dubao/LineDuBaoPhong'
import DuBaoSoLuongKhach from '../dubao/DuBaoSoLuongKhach'
import { usePermissions } from '../../hooks/usePermissions'

const StatusButton = ({ icon, color, label, count, active, onClick }) => (
  <button
    className={`px-3 py-1 rounded-full border flex items-center gap-2 ${
      active ? 'bg-blue-100 border-blue-300' : 'bg-white'
    }`}
    onClick={onClick}
  >
    {label === 'Đang trống' ? (
      <>
        <FontAwesomeIcon icon={icon} className={`text-white border border-gray-500 rounded-full`} />
        {label} ({count})
      </>
    ) : label === 'Sắp trả' ? (
      <>
        <FontAwesomeIcon icon={icon} className="text-yellow-500" />
        {label} ({count})
      </>
    ) : label === 'Sắp nhận' ? (
      <>
        <FontAwesomeIcon icon={icon} className="text-pink-500" />
        {label} ({count})
      </>
    ) : (
      <>
        <FontAwesomeIcon icon={icon} className={`text-${color}-500`} />
        {label} ({count})
      </>
    )}
  </button>
)

StatusButton.propTypes = {
  icon: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

const StatusButtonBuonPhong = ({ icon, color, label, count, active, onClick }) => (
  <button
    className={`px-3 py-1 rounded-full border flex items-center gap-2 ${
      active ? 'bg-blue-100 border-blue-300' : 'bg-white'
    }`}
    onClick={onClick}
  >
    {label === 'Sạch' ? (
      <>
        <FontAwesomeIcon icon={icon} className={`text-white border border-gray-500 rounded-full`} />
        {label} ({count})
      </>
    ) : (
      <>
        <FontAwesomeIcon icon={icon} className={`text-${color}-500`} />
        {label} ({count})
      </>
    )}
  </button>
)

StatusButtonBuonPhong.propTypes = {
  icon: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

const HotelManagement = () => {
  const [statusFilter, setStatusFilter] = useState(null)
  const navigate = useNavigate()
  const { rooms, loading, fetchRooms, setRooms } = useRooms(navigate)

  // Sử dụng hook permissions
  const {
    allowedTabs,
    isLoading: permissionsLoading,
    isTokenValid,
    canAccessTab,
    canAccessButton,
    getDefaultActiveTab,
  } = usePermissions()

  const [activeTab, setActiveTab] = useState(() => {
    // Đọc tab đã lưu từ sessionStorage
    const savedTab = sessionStorage.getItem('activeTab')
    if (savedTab) {
      return parseInt(savedTab)
    }
    return getDefaultActiveTab()
  })

  // Lưu tab vào sessionStorage mỗi khi thay đổi
  const handleTabChange = useCallback((key) => {
    setActiveTab(key)
    sessionStorage.setItem('activeTab', key.toString())
  }, [])

  const handleStatusClick = (status) => {
    console.log('status', status)
    setStatusFilter((prevFilter) => (prevFilter === status ? null : status))
  }

  const filteredRooms = useMemo(() => {
    if (!statusFilter) return rooms
    
    // Nếu lọc 'SẼ ĐẾN TRONG HÔM NAY' thì bao gồm cả 'CHECK-IN TRỄ'
    if (statusFilter === 'SẼ ĐẾN TRONG HÔM NAY') {
      return rooms.filter(
        (room) => 
          room.trangThaiHienTai === 'SẼ ĐẾN TRONG HÔM NAY' || 
          room.trangThaiTuongLai === 'SẼ ĐẾN TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-IN TRỄ'
      )
    }
    
    // Nếu lọc 'SẼ ĐI TRONG HÔM NAY' thì bao gồm cả 'CHECK-OUT TRỄ'
    if (statusFilter === 'SẼ ĐI TRONG HÔM NAY') {
      return rooms.filter(
        (room) => 
          room.trangThaiHienTai === 'SẼ ĐI TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-OUT TRỄ'
      )
    }
    
    return rooms.filter(
      (room) => room.trangThaiHienTai === statusFilter || room.trangThaiTuongLai === statusFilter,
    )
  }, [rooms, statusFilter])

  const [statusFilterBuonPhong, setStatusFilterBuonPhong] = useState(null)

  const handleStatusBuonPhongClick = (status) => {
    console.log('status', status)
    setStatusFilterBuonPhong((prevFilter) => (prevFilter === status ? null : status))
  }
  const isVeSinhFilter = statusFilterBuonPhong === 'DƠ' || statusFilterBuonPhong === 'SẠCH'

  const filteredRoomsBuonPhong = useMemo(() => {
    if (!statusFilterBuonPhong) return rooms
    
    // Nếu lọc theo vệ sinh
    if (isVeSinhFilter) {
      return rooms.filter((room) => room.trangThaiVeSinh === statusFilterBuonPhong)
    }
    
    // Nếu lọc 'SẼ ĐẾN TRONG HÔM NAY' thì bao gồm cả 'CHECK-IN TRỄ'
    if (statusFilterBuonPhong === 'SẼ ĐẾN TRONG HÔM NAY') {
      return rooms.filter(
        (room) => 
          room.trangThaiHienTai === 'SẼ ĐẾN TRONG HÔM NAY' || 
          room.trangThaiTuongLai === 'SẼ ĐẾN TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-IN TRỄ'
      )
    }
    
    // Nếu lọc 'SẼ ĐI TRONG HÔM NAY' thì bao gồm cả 'CHECK-OUT TRỄ'
    if (statusFilterBuonPhong === 'SẼ ĐI TRONG HÔM NAY') {
      return rooms.filter(
        (room) => 
          room.trangThaiHienTai === 'SẼ ĐI TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-OUT TRỄ'
      )
    }
    
    return rooms.filter(
      (room) =>
        room.trangThaiHienTai === statusFilterBuonPhong ||
        room.trangThaiTuongLai === statusFilterBuonPhong,
    )
  }, [rooms, statusFilterBuonPhong, isVeSinhFilter])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // Hàm cập nhật trạng thái phòng
  const updateRoomStatus = (maPhong, trangThaiVeSinh) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => (room.maPhong === maPhong ? { ...room, trangThaiVeSinh } : room)),
    )
  }
  const updateRoomCheckIn = (maPhong, danhanPhong) => {
    console.log(maPhong)
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.maPhong === maPhong ? { ...room, danhanPhong, trangThaiHienTai: 'ĐANG Ở' } : room,
      ),
    )
  }
  const [roomsUpdated, setRoomsUpdated] = useState(0)

  const updateRoomNgayDi = (maPhong, ngayDi, gioDi) => {
    console.log(maPhong)

    try {
      // Tạo đối tượng Date cho múi giờ Việt Nam
      const vietnamTime = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      )

      // Lấy giờ hiện tại theo múi giờ Việt Nam
      const currentHour = vietnamTime.getHours()

      // Format ngày hiện tại theo định dạng YYYY-MM-DD
      const currentDate =
        vietnamTime.getFullYear() +
        '-' +
        String(vietnamTime.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(vietnamTime.getDate()).padStart(2, '0')

      // Kiểm tra và chuẩn hóa giờ đi
      let gioDiNumber = 0
      if (gioDi) {
        const [hours] = gioDi.split(':')
        gioDiNumber = parseInt(hours)
        if (isNaN(gioDiNumber) || gioDiNumber < 0 || gioDiNumber > 23) {
          throw new Error('Giờ không hợp lệ')
        }
      }

      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.maPhong === maPhong) {
            // Nếu ngày đi bằng hoặc nhỏ hơn ngày hiện tại
            if (ngayDi <= currentDate) {
              return { ...room, ngayDi, gioDi, trangThaiHienTai: 'SẼ ĐI TRONG HÔM NAY' }
            }
            // Nếu ngày đi lớn hơn ngày hiện tại
            else if (ngayDi > currentDate) {
              return { ...room, ngayDi, gioDi, trangThaiHienTai: 'ĐANG Ở' }
            }
            // Mặc định
            return { ...room, ngayDi, gioDi }
          }
          return room
        }),
      )
      setRoomsUpdated((prev) => prev + 1)
    } catch (error) {
      console.error('Lỗi khi cập nhật ngày đi:', error)
    }
  }

  const updateRoomChuyenPhong = (maPhong, maPhongMoi) => {
    setRooms((prevRooms) => {
      const room1 = prevRooms.find((room) => room.maPhong === maPhong)
      const room2 = prevRooms.find((room) => room.maPhong === maPhongMoi)

      if (!room1 || !room2) return prevRooms // Nếu không tìm thấy phòng, giữ nguyên danh sách

      return prevRooms.map((room) => {
        if (room.maPhong === maPhong) {
          return {
            ...room,
            trangThaiHienTai: 'TRỐNG',
            trangThaiVeSinh: 'DƠ',
            ngayDen: null,
            ngayDi: null,
            gioDen: null,
            gioDi: null,
            soGiuongDaSuDung: 0,
            maPhong: maPhong,
            tenkhachhang: '',
            maxepphongbooking: null,
            daTraPhong: false,
            danhanPhong: false,
            // ...reset các trường khác nếu cần
          } // Gán thông tin phòng 2 cho phòng 1
        }
        if (room.maPhong === maPhongMoi) {
          return {
            ...room1,
            maPhong: maPhongMoi,
            tenPhong: 'P.' + maPhongMoi,
            trangThaiVeSinh: room2.trangThaiVeSinh,
          } // Gán thông tin phòng 1 cho phòng 2
        }
        return room
      })
    })
  }

  const updateRoomPhuThuTienGiuong = (maPhong, soGiuongDaSuDung) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.maPhong === maPhong ? { ...room, soGiuongDaSuDung: soGiuongDaSuDung } : room,
      ),
    )
  }

  const getRoomCounts = () => {
    return {
      empty: rooms.filter((room) => room.trangThaiHienTai === 'TRỐNG').length,
      upcoming: rooms.filter(
        (room) =>
          room.trangThaiHienTai === 'SẼ ĐẾN TRONG HÔM NAY' ||
          room.trangThaiTuongLai === 'SẼ ĐẾN TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-IN TRỄ',
      ).length,
      occupied: rooms.filter((room) => room.trangThaiHienTai === 'ĐANG Ở').length,
      leaving: rooms.filter(
        (room) => 
          room.trangThaiHienTai === 'SẼ ĐI TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-OUT TRỄ'
      ).length,
    }
  }

  const getRoomCountsBuonPhong = () => {
    return {
      dirty: rooms.filter((room) => room.trangThaiVeSinh === 'DƠ').length,
      clean: rooms.filter((room) => room.trangThaiVeSinh === 'SẠCH').length,
      upcoming: rooms.filter(
        (room) =>
          room.trangThaiHienTai === 'SẼ ĐẾN TRONG HÔM NAY' ||
          room.trangThaiTuongLai === 'SẼ ĐẾN TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-IN TRỄ',
      ).length,
      leaving: rooms.filter(
        (room) => 
          room.trangThaiHienTai === 'SẼ ĐI TRONG HÔM NAY' ||
          room.trangThaiHienTai === 'CHECK-OUT TRỄ'
      ).length,
    }
  }

  // Dự báo phòng
  const getTomorrowAtNoon = (date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 2)
    newDate.setHours(12, 0, 0, 0)
    return newDate
  }

  const date = new Date()
  const [valueNgayDen] = useState(() => {
    const savedDate = localStorage.getItem('selectedNgayDen')
    return savedDate ? new Date(savedDate) : new Date()
  })
  const [valueNgayDi] = useState(() => {
    const savedDate = localStorage.getItem('selectedNgayDi')
    return savedDate ? new Date(savedDate) : getTomorrowAtNoon(date)
  })

  const { loadingDuBao, fetchDuBaoRooms } = useDuBaoRooms(valueNgayDen, valueNgayDi, navigate)

  useEffect(() => {
    if (activeTab === 5) {
      fetchDuBaoRooms()
    }
  }, [activeTab, fetchDuBaoRooms])

  // Tự động chuyển đến tab đầu tiên có quyền nếu tab hiện tại không có quyền
  useEffect(() => {
    if (!permissionsLoading && !canAccessTab(activeTab) && allowedTabs.length > 0) {
      const firstAllowedTab = allowedTabs[0].key
      handleTabChange(firstAllowedTab)
    }
  }, [permissionsLoading, activeTab, canAccessTab, allowedTabs, handleTabChange])

  if (loading || permissionsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CSpinner />
      </div>
    )
  }

  if (loadingDuBao) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CSpinner />
      </div>
    )
  }

  // Không hiển thị gì cả - để axios interceptor xử lý refresh token
  // Màn hình lỗi chỉ hiển thị khi redirectToLogin() được gọi (tự động redirect)
  console.log('key', activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto ">
        <CTabs activeItemKey={activeTab} onActiveTabChange={handleTabChange}>
          <CTabList variant="underline-border" className="flex flex-wrap gap-2">
            {/* Tab Dự báo loại phòng */}
            {canAccessTab(1) && (
              <CTab
                aria-controls="home-tab-pane"
                className="flex items-center text-sm sm:text-base"
                itemKey={1}
                onClick={() => handleTabChange(1)}
              >
                <svg
                  className="w-4 h-4 mt-1 me-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M3 3h18v18H3z"></path>
                  <path d="M21 9H3"></path>
                  <path d="M21 15H3"></path>
                </svg>
                <span className="hidden sm:inline">Dự báo loại phòng</span>
              </CTab>
            )}

            {/* Tab Line phòng */}
            {canAccessTab(6) && (
              <CTab
                aria-controls="profile-tab-pane"
                itemKey={6}
                onClick={() => handleTabChange(6)}
                className="flex items-center text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faGripLines} className="me-1" />
                <span className="hidden sm:inline">Line phòng</span>
              </CTab>
            )}

            {/* Tab Dự báo khách */}
            {canAccessTab(7) && (
              <CTab
                aria-controls="profile-tab-pane"
                itemKey={7}
                onClick={() => handleTabChange(7)}
                className="flex items-center text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faTableCells} className="me-1" />
                <span className="hidden sm:inline">Dự báo khách</span>
              </CTab>
            )}

            {/* Tab Sơ đồ phòng */}
            {canAccessTab(2) && (
              <CTab
                aria-controls="profile-tab-pane"
                itemKey={2}
                onClick={() => handleTabChange(2)}
                className="flex items-center text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faTableCells} className="me-1" />
                <span className="hidden sm:inline">Sơ đồ phòng</span>
              </CTab>
            )}

            {/* Tab Buồng phòng */}
            {canAccessTab(3) && (
              <CTab
                aria-controls="profile-tab-pane"
                itemKey={3}
                onClick={() => handleTabChange(3)}
                className="flex items-center text-sm sm:text-base"
              >
                <i className="fa-solid fa-bed-front mt-1 me-1"></i>
                <span className="hidden sm:inline">Buồng phòng</span>
              </CTab>
            )}

            {/* Tab Nhà hàng */}
            {canAccessTab(4) && (
              <CTab
                aria-controls="profile-tab-pane"
                itemKey={4}
                onClick={() => handleTabChange(4)}
                className="flex items-center text-sm sm:text-base"
              >
                <FontAwesomeIcon icon={faUtensils} className="me-1" />
                <span className="hidden sm:inline">Nhà hàng</span>
              </CTab>
            )}

            <div className="flex flex-wrap gap-2 ml-auto">
              {/* Button Đặt phòng */}
              {canAccessButton('DATPHONG') && (
                <Link to="/dashboard/pos/danh-sach-booking/add-booking">
                  <CButton
                    color="success"
                    className="px-2 sm:px-4 text-white py-1 text-sm sm:text-base"
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-1" />
                    <span className="hidden sm:inline font-semibold">Đặt phòng</span>
                  </CButton>
                </Link>
              )}

              {/* Button Danh sách đặt phòng */}
              {canAccessButton('DANHSACHDATPHONG') && (
                <Link to="/dashboard/pos/danh-sach-booking">
                  <CButton
                    color="info"
                    className="px-2 sm:px-4 text-white py-1 text-sm sm:text-base"
                  >
                    <FontAwesomeIcon icon={faListUl} className="me-1" />
                    <span className="hidden sm:inline font-semibold">Danh sách đặt phòng</span>
                  </CButton>
                </Link>
              )}

              {/* Button Thống kê */}
              {canAccessButton('THONGKEDOANHTHU') && (
                <Link to={`/dashboard/pos/thong-ke`}>
                  <CButton
                    color="primary"
                    className="px-2 sm:px-4 text-white py-1 text-sm sm:text-base"
                  >
                    <FontAwesomeIcon icon={faChartLine} className="me-1" />
                    <span className="hidden sm:inline font-semibold">Thống kê</span>
                  </CButton>
                </Link>
              )}

              {canAccessButton('THONGKEBUONPHONG') && (
                <Link to={`/dashboard/pos/thong-ke-buon-phong`}>
                  <CButton
                    color="primary"
                    className="px-2 sm:px-4 text-white py-1 text-sm sm:text-base"
                  >
                    <FontAwesomeIcon icon={faChartLine} className="me-1" />
                    <span className="hidden sm:inline font-semibold">Thống kê</span>
                  </CButton>
                </Link>
              )}
            </div>
          </CTabList>

          <CTabContent>
            {/* Tab Dự báo loại phòng */}
            {canAccessTab(1) && (
              <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={1}>
                <div>
                  <DuBaoLoaiPhong isActive={activeTab === 1} />
                </div>
              </CTabPanel>
            )}

            {/* Tab Sơ đồ phòng */}
            {canAccessTab(2) && (
              <CTabPanel className="mt-3" aria-labelledby="profile-tab-pane" itemKey={2}>
                <div className="flex flex-col gap-4 ">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <StatusButton
                        icon={faCircle}
                        color="white"
                        label="Đang trống"
                        count={getRoomCounts().empty}
                        active={statusFilter === 'TRỐNG'}
                        onClick={() => handleStatusClick('TRỐNG')}
                      />
                      <StatusButton
                        icon={faCircle}
                        color="pink"
                        label="Sắp nhận"
                        count={getRoomCounts().upcoming}
                        active={statusFilter === 'SẼ ĐẾN TRONG HÔM NAY'}
                        onClick={() => handleStatusClick('SẼ ĐẾN TRONG HÔM NAY')}
                      />
                      <StatusButton
                        icon={faCircle}
                        color="green"
                        label="Đang sử dụng"
                        count={getRoomCounts().occupied}
                        active={statusFilter === 'ĐANG Ở'}
                        onClick={() => handleStatusClick('ĐANG Ở')}
                      />
                      <StatusButton
                        icon={faCircle}
                        color="yellow"
                        label="Sắp trả"
                        count={getRoomCounts().leaving}
                        active={statusFilter === 'SẼ ĐI TRONG HÔM NAY'}
                        onClick={() => handleStatusClick('SẼ ĐI TRONG HÔM NAY')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-1">
                    {filteredRooms.map((room) => (
                      <div key={room.maPhong} className="w-full">
                        <RoomCard
                          room={room}
                          updateRoomStatus={updateRoomStatus}
                          updateRoomCheckIn={updateRoomCheckIn}
                          updateRoomNgayDi={updateRoomNgayDi}
                          updateRoomChuyenPhong={updateRoomChuyenPhong}
                          updateRoomPhuThuTienGiuong={updateRoomPhuThuTienGiuong}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CTabPanel>
            )}

            {/* Tab Buồng phòng */}
            {canAccessTab(3) && (
              <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={3}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <StatusButtonBuonPhong
                        icon={faCircle}
                        color="red"
                        label="Dơ"
                        count={getRoomCountsBuonPhong().dirty}
                        active={statusFilterBuonPhong === 'DƠ'}
                        onClick={() => handleStatusBuonPhongClick('DƠ')}
                      />
                      <StatusButtonBuonPhong
                        icon={faCircle}
                        color="white"
                        label="Sạch"
                        count={getRoomCountsBuonPhong().clean}
                        active={statusFilterBuonPhong === 'SẠCH'}
                        onClick={() => handleStatusBuonPhongClick('SẠCH')}
                      />
                      <StatusButtonBuonPhong
                        icon={faCircle}
                        color="pink"
                        label="Sắp nhận"
                        count={getRoomCounts().upcoming}
                        active={statusFilterBuonPhong === 'SẼ ĐẾN TRONG HÔM NAY'}
                        onClick={() => handleStatusBuonPhongClick('SẼ ĐẾN TRONG HÔM NAY')}
                      />
                      <StatusButton
                        icon={faCircle}
                        color="green"
                        label="Đang sử dụng"
                        count={getRoomCounts().occupied}
                        active={statusFilter === 'ĐANG Ở'}
                        onClick={() => handleStatusBuonPhongClick('ĐANG Ở')}
                      />
                      <StatusButtonBuonPhong
                        icon={faCircle}
                        color="yellow"
                        label="Sắp trả"
                        count={getRoomCounts().leaving}
                        active={statusFilterBuonPhong === 'SẼ ĐI TRONG HÔM NAY'}
                        onClick={() => handleStatusBuonPhongClick('SẼ ĐI TRONG HÔM NAY')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9 gap-1">
                    {filteredRoomsBuonPhong.map((room) => (
                      <div key={room.maPhong} className="w-full">
                        <ViewBuonPhong
                          room={room}
                          updateRoomStatus={updateRoomStatus}
                          updateRoomCheckIn={updateRoomCheckIn}
                          isActive={activeTab === 3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CTabPanel>
            )}

            {/* Tab Nhà hàng */}
            {canAccessTab(4) && (
              <CTabPanel itemKey={4}>
                <div>
                  <ViewNhaHang isActive={activeTab === 4} refreshTrigger={roomsUpdated} />
                </div>
              </CTabPanel>
            )}

            {/* Tab Line phòng */}
            {canAccessTab(6) && (
              <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={6}>
                <div>
                  <LineDuBaoPhong isActive={activeTab === 6} />
                </div>
              </CTabPanel>
            )}

            {/* Tab Dự báo khách */}
            {canAccessTab(7) && (
              <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={7}>
                <div>
                  <DuBaoSoLuongKhach isActive={activeTab === 7} />
                </div>
              </CTabPanel>
            )}
          </CTabContent>
        </CTabs>
      </div>
    </div>
  )
}

export default HotelManagement
