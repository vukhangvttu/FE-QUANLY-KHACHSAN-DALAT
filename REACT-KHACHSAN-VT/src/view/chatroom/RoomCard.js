import React, { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEllipsisVertical,
  faClock,
  faBed,
  faPeopleArrows,
} from '@fortawesome/free-solid-svg-icons'

import PropTypes from 'prop-types'

import { Link } from 'react-router-dom'
import CapNhatTrangThaiDonPhong from '../modal/CapNhatTrangThaiDonPhong'
import { ROOM_STATUS_STYLES, ROOM_ACTIONS } from './constants'
import RoomStatus from './components/RoomStatus'

import CheckInModal from '../modal/Check_InModal'
import CapNhatNgayDi from '../modal/CapNhatNgayDi'
import ChuyenPhong from '../modal/ChuyenPhong'

import PhuThu from '../modal/PhuThu'
import { CCol, CFormCheck, CRow, CTooltip } from '@coreui/react-pro'
import DichVuMienPhi from '../modal/DichVuMienPhi'
import ThongTinKhachHangTrenLine from '../modal/ThongTinKhachHangTrenLine'
import { Popover } from 'flowbite-react'
import GoCheckIn from '../modal/GoCheckIn'

const RoomCard = ({
  room,
  updateRoomStatus,
  updateRoomCheckIn,
  updateRoomNgayDi,
  updateRoomChuyenPhong,
  updateRoomPhuThuTienGiuong,
}) => {
  const [visibleCheckInBooKing, setVisibleCheckInBooKing] = useState(false)
  const [visibleGoCheckIn, setVisibleGoCheckIn] = useState(false)
  const [visibleTrangThaiVeSinh, setVisibleTrangThaiVeSinh] = useState(false)
  const [activePopover, setActivePopover] = useState(null)
  const popoverRef = useRef(null)

  const [ma_booking, setMa_booking] = useState('')
  const [ma_xepphong_bookking, setMa_xepphong_bookking] = useState('')
  const [tenphong, setTenphong] = useState('')
  const [valueDaDo, setValueDaDo] = useState(false)
  const [maPhong, setMaPhong] = useState('')

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null)
      }
    }

    if (activePopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activePopover])

  const getCardBackground = () => {
    if (room.maLoaiPhong === 'KHO-BUON') {
      return 'bg-purple-500 text-white'
    }
    if (room.maLoaiPhong === 'NOI-BO') {
      return 'bg-purple-500 text-white'
    }
    if (room.dangBaoTri === true) {
      return 'bg-purple-500 text-white'
    }

    return ROOM_STATUS_STYLES[room.trangThaiHienTai] || ROOM_STATUS_STYLES.default
  }

  const handleClickCheckIn = (ma_xepphong_bookking, tenphong) => {
    setVisibleCheckInBooKing(true)
    setMa_xepphong_bookking(ma_xepphong_bookking)
    setTenphong(tenphong)
  }

  const handleClickUpdateVeSinh = (trangthai, maphong) => {
    setValueDaDo(trangthai.trim() === 'SẠCH')
    setMaPhong(maphong)

    setVisibleTrangThaiVeSinh(true)
  }

  const [ngayDi, setNgayDi] = useState('')
  const [ngayDen, setNgayDen] = useState('')
  const [maloaiphong, setMaLoaiPhong] = useState('')
  const [gioDi, setGioDi] = useState(null)
  const handleClickUpdateNgayDi = (
    ma_xepphong,
    maBooking,
    ngayDen,
    ngayDi,
    gioDi,
    maphong,
    maloaiphong,
  ) => {
    setMa_xepphong_bookking(ma_xepphong)
    setMa_booking(maBooking)
    setMaPhong(maphong)
    setNgayDi(ngayDi)
    setGioDi(gioDi)
    setMaLoaiPhong(maloaiphong)
    setNgayDen(ngayDen)
    setVisibleNgayDi(true)
    setActivePopover(null)
  }

  const [visibleChuyenPhong, setVisibleChuyenPhong] = useState(false)
  const [ngayHienTai, setNgayHienTai] = useState('')
  const handleClickChuyenPhong = (
    ma_xepphong,
    ngayDen,
    ngayDi,
    ngayHienTai,
    maphong,
    maloaiphong,
    tenPhong,
  ) => {
    setMa_xepphong_bookking(ma_xepphong)
    setMaPhong(maphong)
    setNgayDen(ngayDen)
    setNgayHienTai(ngayHienTai)
    setNgayDi(ngayDi)
    setMaLoaiPhong(maloaiphong)
    setTenphong(tenPhong)
    setVisibleChuyenPhong(true)
  }

  const [visiblePhuThuTienGiuong, setVisiblePhuThuTienGiuong] = useState(false)
  const [soLuongGiuongMax, setSoLuongGiuongMax] = useState(0)
  const handleClickPhuThuTienGiuong = (ma_xepphong, maphong, maloaiphong, soluonggiuong) => {
    setMa_xepphong_bookking(ma_xepphong)
    setMaPhong(maphong)
    setMaLoaiPhong(maloaiphong)
    setSoLuongGiuongMax(soluonggiuong)
    setVisiblePhuThuTienGiuong(true)
  }

  const handleCheckInComplete = (data) => {
    if (data) {
      setVisibleCheckInBooKing(false)
      updateRoomCheckIn(room.maPhong, true)
    }
  }

  const handleGoCheckInComplete = (data) => {
    if (data) {
      setVisibleGoCheckIn(false)
      // updateRoomCheckIn(room.maPhong, false)
    }
  }

  const handleUpdateVeSinhComplete = (data) => {
    if (data) {
      updateRoomStatus(maPhong, valueDaDo ? 'CHƯA DỌN' : 'SẠCH')
    }
  }

  const handleUpdateNgayDiComplete = (data) => {
    console.log('data', data)
    if (data) {
      updateRoomNgayDi(maPhong, data.ngayDi, data.gioDi)
    }
  }

  const handleChuyenPhongComplete = (data) => {
    console.log('data', data)
    if (data) {
      updateRoomChuyenPhong(maPhong, data.maPhongMoi)
    }
  }

  const handlePhuThuTienGiuongComplete = (data) => {
    console.log(data)
    if (data.trangthai) {
      updateRoomPhuThuTienGiuong(maPhong, data.soluong)
    }
  }

  const [visibleNgayDi, setVisibleNgayDi] = useState(false)

  const [soLuongKhach, setSoLuongKhach] = useState(0)
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

  const customTooltipStyle = {
    '--cui-tooltip-bg': 'var(--cui-primary)',
  }

  const [visibleDichVuMienPhi, setVisibleDichVuMienPhi] = useState(false)
  const [visibleThongTinKhachHangTrenLine, setVisibleThongTinKhachHangTrenLine] = useState(false)

  const handleClickThongTinKhachHangTrenLine = (ma_xepphong) => {
    if (ma_xepphong) {
      setMa_xepphong_bookking(ma_xepphong)
      setVisibleThongTinKhachHangTrenLine(true)
    }
  }

  const handlePopoverToggle = (maPhong) => {
    setActivePopover(activePopover === maPhong ? null : maPhong)
  }

  const handlePopoverClose = () => {
    setActivePopover(null)
  }

  return (
    <div className={`rounded-lg px-2 py-2 shadow-sm h-36 ${getCardBackground()} `}>
      {room.maLoaiPhong !== 'KHO-BUON' && room.maLoaiPhong !== 'NOI-BO' && !room.dangBaoTri && (
        <CRow>
          <CCol xs={7} sm={7} md={7}>
            <RoomStatus status={room.trangThaiVeSinh} trangThaiHienTai={room.trangThaiHienTai} />
          </CCol>
          <CCol xs={5} sm={5} md={5}>
            <CRow>
              <CCol xs={5} sm={5} md={5} className="flex justify-center ">
                {room.trangThaiHienTai === 'SẼ ĐI TRONG HÔM NAY' &&
                room.trangThaiTuongLai === 'SẼ ĐẾN TRONG HÔM NAY' ? (
                  <div className="flex items-center justify-center">
                    <FontAwesomeIcon icon={faPeopleArrows} className="text-xl" />
                  </div>
                ) : null}
                {!room.danhanPhong &&
                  room.maxepphongbooking != null &&
                  room.trangthaibooking !== 3 && (
                    <CTooltip content="Check-in" style={customTooltipStyle}>
                      <CCol className="flex justify-center ">
                        <CFormCheck
                          onClick={() => {
                            handleClickCheckIn(room.maxepphongbooking, room.tenPhong)
                            setActivePopover(null)
                          }}
                        />
                      </CCol>
                    </CTooltip>
                  )}
              </CCol>
              <CCol xs={7} sm={7} md={7}>
                <Popover
                  content={
                    <div className="w-52 ">
                      <div className="text-left cursor-pointer text-black">
                        <div
                          className="px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                          onClick={() => {
                            handleClickUpdateVeSinh(room.trangThaiVeSinh, room.maPhong)
                            handlePopoverClose()
                          }}
                        >
                          {room.trangThaiVeSinh === 'SẠCH'
                            ? ROOM_ACTIONS.UNCLEAN
                            : ROOM_ACTIONS.CLEAN}
                        </div>
                        {
                          room.danhanPhong &&
                          room.daTraPhong === false &&
                          room.maxepphongbooking != null ? (
                            <>
                              <div
                                onClick={() => {
                                  handleClickChuyenPhong(
                                    room.maxepphongbooking,
                                    room.ngayDen,
                                    room.ngayDi,
                                    room.ngayHienTai,
                                    room.maPhong,
                                    room.maLoaiPhong,
                                    room.tenLoaiPhong,
                                  )
                                  handlePopoverClose()
                                }}
                                className="block px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                              >
                                Chuyển phòng
                              </div>
                              {room.tenNhomKhachHang === 'OTA' || room.tenNhomKhachHang === 'TA' ? (
                                <Link
                                  to={`/dashboard/pos/xuat-thong-tin-phieu-dang-ky-ota-ta/${room.maxepphongbooking}`}
                                  onClick={() => handlePopoverClose()}
                                >
                                  <button className="block w-full text-left px-4 py-1 hover:bg-gray-100 hover:text-blue-500">
                                    {ROOM_ACTIONS.PRINT_REGISTRATION_FROM_OTA_TA}
                                  </button>
                                </Link>
                              ) : (
                                <Link
                                  to={`/dashboard/pos/xuat-thong-tin-phieu-dang-ky/${room.maxepphongbooking}`}
                                  onClick={() => handlePopoverClose()}
                                >
                                  <button className="block w-full text-left px-4 py-1 hover:bg-gray-100 hover:text-blue-500">
                                    {ROOM_ACTIONS.PRINT_REGISTRATION_FROM}
                                  </button>
                                </Link>
                              )}

                              <div
                                onClick={() => {
                                  handleClickPhuThuTienGiuong(
                                    room.maxepphongbooking,
                                    room.maPhong,
                                    room.maLoaiPhong,
                                    room.soGiuongThem,
                                  )
                                  handlePopoverClose()
                                }}
                                className="block px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                              >
                                Phụ thu
                              </div>
                              <div
                                onClick={() => {
                                  handleClickDichVuMienPhi(
                                    room.maxepphongbooking,
                                    room.maPhong,
                                    room.maLoaiPhong,
                                    room.soGiuongThem,
                                    room.soLuongKhach,
                                  )
                                  handlePopoverClose()
                                }}
                                className="block px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                              >
                                Dịch vụ miễn phí
                              </div>
                              <Link
                                to={`/dashboard/pos/dich-vu/${room.maPhong}/${room.maBooking}/${room.maxepphongbooking}`}
                                className="block px-4 py-1  hover:bg-gray-100 hover:text-blue-500"
                                onClick={() => handlePopoverClose()}
                              >
                                {ROOM_ACTIONS.SERVICES}
                              </Link>
                              <div
                                onClick={() => {
                                  handleClickUpdateNgayDi(
                                    room.maxepphongbooking,
                                    room.maBooking,
                                    room.ngayDen,
                                    room.ngayDi,
                                    room.gioDi,
                                    room.maPhong,
                                    room.maLoaiPhong,
                                  )
                                  handlePopoverClose()
                                }}
                                className="block px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                              >
                                Cập nhật ngày đi
                              </div>
                              <Link
                                to={`/dashboard/pos/add-guest-to-room/${room.tenPhong}/${room.maxepphongbooking}`}
                                className="block px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                                onClick={() => handlePopoverClose()}
                              >
                                {ROOM_ACTIONS.ADD_GUEST}
                              </Link>

                              <Link
                                to={`/dashboard/pos/thanh-toan/${room.maBooking}/${room.maxepphongbooking}`}
                                className="block px-4 py-1 hover:bg-gray-100 hover:text-blue-500"
                                onClick={() => handlePopoverClose()}
                              >
                                {ROOM_ACTIONS.CHECKOUT}
                              </Link>
                            </>
                          ) : null
                          // <div
                          //   className="px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                          //   onClick={() => {
                          //     handleClickCheckIn(room.maxepphongbooking, room.tenPhong)
                          //     setActivePopover(null)
                          //   }}
                          // >
                          //   {ROOM_ACTIONS.CHECKIN}
                          // </div>
                        }
                      </div>
                    </div>
                  }
                  arrow={true}
                  placement="bottom"
                >
                  <div
                    className="rounded-lg flex justify-center hover:bg-gray-200 hover:text-black text-current opacity-60 hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePopoverToggle(room.maPhong)
                    }}
                  >
                    <button>
                      <FontAwesomeIcon icon={faEllipsisVertical} className="text-xl" />
                    </button>
                  </div>
                </Popover>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      )}

      <CRow>
        <CCol xs={5} sm={5} md={6} lg={5}>
          {/* <CTooltip
            content={
              <div className=" text-white shadow-xl rounded-lg p-4 ">
                <div className="flex items-start space-x-3">
                  <div>
                    <h3 className="font-bold ">{room.tenPhong}</h3>
                    <p className="text-sm ">Số giường Extra: {room.soGiuongThem}</p>
                    <div>{room.ghiChu}</div>
                    <div>{room.tong}m2</div>
                    <div>Số khách tối đa: {room.soLuongKhach}</div>
                   
                  </div>
                </div>
              </div>
            }
            placement="left"
          > */}
            <h3 className="text-xl font-bold flex items-center text-center gap-2 cursor-pointer">
              {room.tenPhong}
            </h3>
          {/* </CTooltip> */}
        </CCol>
        <CCol xs={7} sm={7} md={6} lg={7} className="flex justify-end">
          {room.soGiuongThem > 0 ? (
            <>
              <span className="me-1">
                {room.soGiuongDaSuDung}/{room.soGiuongThem}{' '}
              </span>
              <span>
                <FontAwesomeIcon icon={faBed} />
              </span>
            </>
          ) : (
            ''
          )}
        </CCol>
      </CRow>

      {room.tenkhachhang && !room.daTraPhong && room.trangThaiHienTai !== 'CHECK-OUT TRỄ' ? (
        <>
          <div
            className=" cursor-pointer"
            onClick={() => handleClickThongTinKhachHangTrenLine(room.maxepphongbooking)}
          >
            <span className="font-medium text-sm hover:text-gray-300">{room.tenkhachhang}</span>
          </div>

          {/* <span className="text-sm">{room.phone}</span> */}
          {/* <div className="text-current text-xs">{room.tenLoaiPhong}</div> */}
        </>
      ) : (
        <>
          {/* <h4 className="text-sm font-medium">{room.dienGiai}</h4> */}
          {/* <div className="flex ">
            <div className="text-current opacity-60 text-xs">{room.tenLoaiPhong}</div>
          </div> */}
        </>
      )}
      <div className="flex ">
        <div className="text-current opacity-60 text-xs">{room.tenLoaiPhong}</div>
      </div>
      {/* {room.maxepphongbooking != null && (
        <div
          className="flex cursor-pointer hover:opacity-60"
          onClick={() => handleClickThongTinKhachHangTrenLine(room.maxepphongbooking)}
        >
          
        </div>
      )} */}

      {room.trangThaiHienTai === 'overdue' && (
        <div>
          <span className="inline-flex gap-1 mt-2 items-center px-2 py-1 rounded-full text-xs bg-white/20">
            <FontAwesomeIcon icon={faClock} /> Quá giờ nhận
          </span>
        </div>
      )}

      <CheckInModal
        visible={visibleCheckInBooKing}
        onClose={() => setVisibleCheckInBooKing(false)}
        onSubmit={handleCheckInComplete}
        ma_xepphong_bookking={ma_xepphong_bookking}
        tenphong={tenphong}
      />

      <GoCheckIn
        visible={visibleGoCheckIn}
        onClose={() => setVisibleGoCheckIn(false)}
        ma_xepphong_bookking={ma_xepphong_bookking}
        tenphong={tenphong}
        onSubmit={handleGoCheckInComplete}
      />

      <CapNhatTrangThaiDonPhong
        visible={visibleTrangThaiVeSinh}
        onClose={() => setVisibleTrangThaiVeSinh(false)}
        onSubmit={handleUpdateVeSinhComplete}
        maPhong={maPhong}
        valueDaDo={valueDaDo}
      />

      <CapNhatNgayDi
        visible={visibleNgayDi}
        onClose={() => setVisibleNgayDi(false)}
        maBooking={ma_booking}
        maXepPhong={ma_xepphong_bookking}
        ngayDen={ngayDen}
        ngayDi={ngayDi}
        gioDi={gioDi}
        maPhong={maPhong}
        maLoaiPhong={maloaiphong}
        onSubmit={handleUpdateNgayDiComplete}
      />

      <ChuyenPhong
        visible={visibleChuyenPhong}
        onClose={() => setVisibleChuyenPhong(false)}
        maXepPhong={ma_xepphong_bookking}
        ngayDen={ngayDen}
        ngayDi={ngayDi}
        ngayHienTai={ngayHienTai}
        maPhong={maPhong}
        maLoaiPhong={maloaiphong}
        tenPhong={tenphong}
        onSubmit={handleChuyenPhongComplete}
      />

      <PhuThu
        visible={visiblePhuThuTienGiuong}
        onClose={() => setVisiblePhuThuTienGiuong(false)}
        maPhong={maPhong}
        maLoaiPhong={maloaiphong}
        ma_xepphong={ma_xepphong_bookking}
        soGiuongMax={soLuongGiuongMax}
        onSubmit={handlePhuThuTienGiuongComplete}
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

      <ThongTinKhachHangTrenLine
        visible={visibleThongTinKhachHangTrenLine}
        onClose={() => {
          setVisibleThongTinKhachHangTrenLine(false)
        }}
        ma_xepphong={ma_xepphong_bookking}
      />

      {/* <GhiChuModal visible={visible} onClose={() => setVisible(false)} /> */}
    </div>
  )
}

RoomCard.propTypes = {
  room: PropTypes.shape({
    maPhong: PropTypes.string.isRequired,
    tenPhong: PropTypes.string.isRequired,
    soGiuongThem: PropTypes.number.isRequired,
    trangThaiVeSinh: PropTypes.string.isRequired,
    trangThaiHienTai: PropTypes.string.isRequired,
    trangThaiTuongLai: PropTypes.string,
    tenkhachhang: PropTypes.string,
    dienGiai: PropTypes.string,
    soGiuongDaSuDung: PropTypes.number,
    maLoaiPhong: PropTypes.string,
    tenLoaiPhong: PropTypes.string,
    danhanPhong: PropTypes.bool,
    ngayDen: PropTypes.string,
    ngayDi: PropTypes.string,
    ngayHienTai: PropTypes.string,
    gioDi: PropTypes.string,
    daTraPhong: PropTypes.bool,
    maBooking: PropTypes.string,
    maxepphongbooking: PropTypes.string,
    ghiChu: PropTypes.string,
    soLuongKhach: PropTypes.number,
    tong: PropTypes.number,
    trangthaibooking: PropTypes.number,
    tenNhomKhachHang: PropTypes.string,
    dangBaoTri: PropTypes.bool,
  }).isRequired,
  updateRoomStatus: PropTypes.func.isRequired,
  updateRoomCheckIn: PropTypes.func.isRequired,
  updateRoomNgayDi: PropTypes.func.isRequired,
  updateRoomChuyenPhong: PropTypes.func.isRequired,
  updateRoomPhuThuTienGiuong: PropTypes.func.isRequired,
}

export default RoomCard
