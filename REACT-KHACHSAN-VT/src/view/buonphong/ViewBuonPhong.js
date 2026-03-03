import React, { useState } from 'react'

import PropTypes from 'prop-types'

import CapNhatTrangThaiDonPhong from '../modal/CapNhatTrangThaiDonPhong'
import { ROOM_STATUS_STYLES } from './../chatroom/constants'


import RoomStatusBuonPhong from '../chatroom/components/RoomStatusBuonPhong'
import DichVuMienPhi from '../modal/DichVuMienPhi'

const ViewBuonPhong = ({ room, updateRoomStatus, updateRoomCheckIn }) => {
  const [visibleTrangThaiVeSinh, setVisibleTrangThaiVeSinh] = useState(false)

  const [ma_xepphong_bookking, setMa_xepphong_bookking] = useState('')
  const [valueDaDo, setValueDaDo] = useState(false)
  const [maPhong, setMaPhong] = useState('')
  const [visibleDichVuMienPhi, setVisibleDichVuMienPhi] = useState(false)
  const [maloaiphong, setMaLoaiPhong] = useState('')
  const [soLuongGiuongMax, setSoLuongGiuongMax] = useState(0)
  const [soLuongKhach, setSoLuongKhach] = useState(0)

  const getCardBackground = () => {
    if (room.dangBaoTri === true) {
      return 'bg-red-500 text-white'
    }

    return ROOM_STATUS_STYLES[room.trangThaiHienTai] || ROOM_STATUS_STYLES.default
  }

  const handleClickUpdateVeSinh = (trangthai, maphong) => {
    setValueDaDo(trangthai.trim() === 'SẠCH')
    setMaPhong(maphong)
    setVisibleTrangThaiVeSinh(true)
  }



  const handleUpdateVeSinhComplete = (data) => {
    if (data) {
      updateRoomStatus(maPhong, valueDaDo ? 'CHƯA DỌN' : 'SẠCH')
    }
  }
  const handleClickDichVuMienPhi = (
    ma_xepphong,
    maphong,
    maloaiphong,
    soluonggiuong,
    soLuongKhach,
  ) => {
    setMa_xepphong_bookking(ma_xepphong)
    setMaPhong(maphong)
    setMaLoaiPhong(maloaiphong)
    setSoLuongGiuongMax(soluonggiuong)
    setSoLuongKhach(soLuongKhach)
    setVisibleDichVuMienPhi(true)
  }

  const handleCardClick = () => {
    // Chỉ mở Dịch vụ miễn phí nếu phòng không trống và có mã xếp phòng
    if (room.trangThaiHienTai !== 'TRỐNG' && room.maxepphongbooking) {
      handleClickDichVuMienPhi(
        room.maxepphongbooking,
        room.maPhong,
        room.maLoaiPhong,
        room.soGiuongThem,
        room.soLuongKhach,
      )
    }
  }
  return (
    <div
      className={`rounded-lg px-3 py-2 shadow-sm h-36 ${getCardBackground()}`}
    >
      <div className="flex justify-between items-start ">
        <div 
          className="flex flex-col min-h-[90px] cursor-pointer relative z-10"
          onClick={handleCardClick}
        >
          <h3 className="text-xl font-bold flex items-center gap-2">{room.tenPhong}</h3>
         
             
                <div className="text-current opacity-60 text-xs">{room.tenLoaiPhong}</div>
              
        </div>
      </div>
      <div className="relative h-full">
        <div 
          className="absolute left-0 right-0 flex justify-center cursor-pointer"
          onClick={(e) => {
            handleClickUpdateVeSinh(room.trangThaiVeSinh, room.maPhong)
          }}
        >
          <RoomStatusBuonPhong
            status={room.trangThaiVeSinh}
            trangThaiHienTai={room.trangThaiHienTai}
          />
          
        </div>
      </div>


    
        <CapNhatTrangThaiDonPhong
          visible={visibleTrangThaiVeSinh}
          onClose={() => setVisibleTrangThaiVeSinh(false)}
          onSubmit={handleUpdateVeSinhComplete}
          maPhong={maPhong}
          valueDaDo={valueDaDo}
        />
     
        <DichVuMienPhi
          visible={visibleDichVuMienPhi}
          onClose={() => setVisibleDichVuMienPhi(false)}
          maPhong={maPhong}
          maLoaiPhong={maloaiphong}
          ma_xepphong={ma_xepphong_bookking}
          soLuongKhach={soLuongKhach}
          soGiuongMax={soLuongGiuongMax}
        />
   

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
    soGiuongThem: PropTypes.number,
    soLuongKhach: PropTypes.number,
  }).isRequired,
  updateRoomStatus: PropTypes.func.isRequired,
  updateRoomCheckIn: PropTypes.func.isRequired,
}

export default ViewBuonPhong
