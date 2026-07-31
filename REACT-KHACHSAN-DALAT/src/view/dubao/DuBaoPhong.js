import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faBed } from '@fortawesome/free-solid-svg-icons'

import PropTypes from 'prop-types'

import { CCol, CRow, CTooltip, CSpinner } from '@coreui/react-pro'
import { ROOM_STATUS_STYLES } from '../chatroom/constants'

const DuBaoPhong = ({ room, isActive, loading }) => {
  const getCardBackground = () => {
    if (room.maLoaiPhong === 'KHO-BUON') {
      return 'bg-purple-500 text-white'
    }
    if (room.maLoaiPhong === 'NOI-BO') {
      return 'bg-purple-500 text-white'
    }

    return ROOM_STATUS_STYLES[room.trangThaiHienTai] || ROOM_STATUS_STYLES.default
  }

  return (
    <div className={`rounded-lg px-3 py-2 shadow-sm h-24 ${getCardBackground()} `}>
      <CRow>
        <CCol xs={5} sm={5} md={6} lg={5}>
          <CTooltip
            content={
              <div className=" text-white shadow-xl rounded-lg p-4 ">
                <div className="flex items-start space-x-3">
                  <div>
                    <h3 className="font-bold ">{room.tenPhong}</h3>
                    <p className="text-sm ">Số giường Extra: {room.soGiuongThem}</p>
                    <div>{room.ghiChu}</div>
                    <div>{room.tong}m2</div>
                    <div>Số khách tối đa: {room.soLuongKhach}</div>
                    {/* <div className="mt-2 flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {room.maLoaiPhong}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            }
            placement="left"
          >
            <h3 className="text-xl font-bold flex items-center text-center gap-2 cursor-pointer">
              {room.tenPhong}
            </h3>
          </CTooltip>
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

      <div className="flex ">
        <div className="text-current opacity-60 text-xs">{room.tenLoaiPhong}</div>
      </div>

      {room.trangThaiHienTai === 'overdue' && (
        <div>
          <span className="inline-flex gap-1 mt-2 items-center px-2 py-1 rounded-full text-xs bg-white/20">
            <FontAwesomeIcon icon={faClock} /> Quá giờ nhận
          </span>
        </div>
      )}
    </div>
  )
}

DuBaoPhong.propTypes = {
  room: PropTypes.shape({
    maPhong: PropTypes.string.isRequired,
    tenPhong: PropTypes.string.isRequired,
    soGiuongThem: PropTypes.number.isRequired,
    trangThaiVeSinh: PropTypes.string.isRequired,
    trangThaiHienTai: PropTypes.string.isRequired,
    tenkhachhang: PropTypes.string,
    dienGiai: PropTypes.string,
    soGiuongDaSuDung: PropTypes.number,
    maLoaiPhong: PropTypes.string,
    tenLoaiPhong: PropTypes.string,
    danhanPhong: PropTypes.bool,
    ngayDi: PropTypes.string,
    gioDi: PropTypes.string,
    daTraPhong: PropTypes.bool,
    maBooking: PropTypes.string,
    maxepphongbooking: PropTypes.string,
    ghiChu: PropTypes.string,
    soLuongKhach: PropTypes.number,
    tong: PropTypes.number,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
}

export default DuBaoPhong
