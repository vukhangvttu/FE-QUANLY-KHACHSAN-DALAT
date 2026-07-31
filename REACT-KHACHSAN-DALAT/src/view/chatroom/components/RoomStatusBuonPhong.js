import React from 'react'
import PropTypes from 'prop-types'
import { ROOM_STATUS_LABELS } from '../constants'

const RoomStatusBuonPhong = ({ status, trangThaiHienTai }) => {
  const label = ROOM_STATUS_LABELS[status] || ROOM_STATUS_LABELS['CHƯA DỌN']

  return (
    <div
      className={`flex items-center ${
        status === 'DƠ'
          ? trangThaiHienTai !== 'TRỐNG'
            ? 'text-white font-bold' // Khi status === 'DƠ' và trangThaiHienTai !== 'TRỐNG'
            : 'text-red-500 font-bold' // Khi status === 'DƠ' và trangThaiHienTai === 'TRỐNG'
          : trangThaiHienTai !== 'TRỐNG'
            ? 'text-white font-bold' // Khi status !== 'DƠ' và trangThaiHienTai !== 'TRỐNG'
            : 'text-black font-bold' // Khi status !== 'DƠ' và trangThaiHienTai === 'TRỐNG'
      } gap-1 ${label.className} mb-1`}
    >
      <span
        className={`text-base border ${
          trangThaiHienTai !== 'TRỐNG' 
            ? status === 'DƠ' 
              ? 'bg-white text-red-500' 
              : 'bg-white text-black'
            : ''
        } bg-white  rounded-full px-3 py-1`}
      >
        {status === 'DƠ' && <i className="fa-solid fa-broom-wide hidden sm:inline mr-1"></i>}
        {status === 'SẠCH' && <i className="fa-solid fa-sparkles hidden sm:inline mr-1"></i>}
        {label.text}
      </span>
    </div>
  )
}

RoomStatusBuonPhong.propTypes = {
  status: PropTypes.string.isRequired,
  trangThaiHienTai: PropTypes.string.isRequired,
}

export default RoomStatusBuonPhong
