import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faClock } from '@fortawesome/free-solid-svg-icons'

import PropTypes from 'prop-types'

import CapNhatTrangThaiDonPhong from '../modal/CapNhatTrangThaiDonPhong'
import { ROOM_ACTIONS, ROOM_STATUS_STYLES } from './../chatroom/constants'

import CheckInModal from '../modal/Check_InModal'
import RoomStatusBuonPhong from '../chatroom/components/RoomStatusBuonPhong'

const ViewBuonPhong = ({ room, updateRoomStatus, updateRoomCheckIn }) => {
  const [visibleCheckInBooKing, setVisibleCheckInBooKing] = useState(false)
  const [visibleTrangThaiVeSinh, setVisibleTrangThaiVeSinh] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const popoverRef = useRef(null)

  const [ma_xepphong_bookking, setMa_xepphong_bookking] = useState('')
  const [tenphong, setTenphong] = useState('')
  const [valueDaDo, setValueDaDo] = useState(false)
  const [maPhong, setMaPhong] = useState('')

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPopoverOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getCardBackground = () => {
    if (room.dangBaoTri === true) {
      return 'bg-red-500 text-white'
    }

    return ROOM_STATUS_STYLES[room.trangThaiHienTai] || ROOM_STATUS_STYLES.default
  }

  const handleClickUpdateVeSinh = (trangthai, maphong) => {
    setValueDaDo(trangthai.trim() === 'SẠCH')
    setMaPhong(maphong)
    setIsPopoverOpen(false)
    setVisibleTrangThaiVeSinh(true)
  }

  const handleCheckInComplete = (data) => {
    if (data) {
      setVisibleCheckInBooKing(false)
      updateRoomCheckIn(room.maPhong, true)
    }
  }

  const handleUpdateVeSinhComplete = (data) => {
    if (data) {
      updateRoomStatus(maPhong, valueDaDo ? 'CHƯA DỌN' : 'SẠCH')
    }
  }

  return (
    <div className={`rounded-lg px-3 py-2 shadow-sm h-36 ${getCardBackground()}`}>
      <div className="flex justify-between items-start ">
        <div className="flex flex-col min-h-[90px]">
          <h3 className="text-xl font-bold flex items-center gap-2">{room.tenPhong}</h3>
          {room.ten_khachhang && !room.daTraPhong ? (
            <>
              <span className="font-medium">{room.ten_khachhang}</span>
              <span className="text-sm">{room.phone}</span>
            </>
          ) : (
            <>
              {/* <h4 className="text-sm font-medium">{room.dienGiai}</h4> */}
              <div className="flex ">
                <div className="text-current opacity-60 text-sm">{room.tenLoaiPhong}</div>
              </div>
            </>
          )}
        </div>

        <div ref={popoverRef} className="relative">
          <div
            className="p-2 rounded-lg hover:bg-gray-200 text-current opacity-60 hover:opacity-100 cursor-pointer"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            <button>
              <FontAwesomeIcon icon={faEllipsisVertical} className="text-xl" />
            </button>
          </div>

          {isPopoverOpen && (
            <div className="absolute right-0  mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-[9999]">
              <div className="text-left cursor-pointer text-black">
                <div
                  className="px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                  onClick={() => handleClickUpdateVeSinh(room.trangThaiVeSinh, room.maPhong)}
                >
                  {room.trangThaiVeSinh === 'SẠCH' ? ROOM_ACTIONS.UNCLEAN : ROOM_ACTIONS.CLEAN}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="relative h-full">
        <div className="absolute  left-0 right-0 flex justify-center">
          <RoomStatusBuonPhong
            status={room.trangThaiVeSinh}
            trangThaiHienTai={room.trangThaiHienTai}
          />
        </div>
      </div>

      {room.trangThaiHienTai === 'overdue' && (
        <div>
          <span className="inline-flex gap-1 mt-2 items-center px-2 py-1 rounded-full text-xs bg-white/20">
            <FontAwesomeIcon icon={faClock} /> Quá giờ nhận
          </span>
        </div>
      )}

      {visibleCheckInBooKing && (
        <CheckInModal
          visible={visibleCheckInBooKing}
          onClose={() => setVisibleCheckInBooKing(false)}
          onSubmit={handleCheckInComplete}
          ma_xepphong_bookking={ma_xepphong_bookking}
          tenphong={tenphong}
        />
      )}

      {visibleTrangThaiVeSinh && (
        <CapNhatTrangThaiDonPhong
          visible={visibleTrangThaiVeSinh}
          onClose={() => setVisibleTrangThaiVeSinh(false)}
          onSubmit={handleUpdateVeSinhComplete}
          maPhong={maPhong}
          valueDaDo={valueDaDo}
        />
      )}

      {/* <GhiChuModal visible={visible} onClose={() => setVisible(false)} /> */}
    </div>
  )
}

ViewBuonPhong.propTypes = {
  room: PropTypes.shape({
    maPhong: PropTypes.string.isRequired,
    tenPhong: PropTypes.string.isRequired,
    trangThaiVeSinh: PropTypes.string.isRequired,
    trangThaiHienTai: PropTypes.string.isRequired,
    hasGuest: PropTypes.bool,
    ten_khachhang: PropTypes.string,
    phone: PropTypes.string,
    dienGiai: PropTypes.string,
    maLoaiPhong: PropTypes.string,
    tenLoaiPhong: PropTypes.string,
    danhanPhong: PropTypes.bool,
    daTraPhong: PropTypes.bool,
    maBooking: PropTypes.string,
    maxepphongbooking: PropTypes.string,
    timeInfo: PropTypes.string,
    dangBaoTri: PropTypes.bool,
  }).isRequired,
  updateRoomStatus: PropTypes.func.isRequired,
  updateRoomCheckIn: PropTypes.func.isRequired,
}

export default ViewBuonPhong
