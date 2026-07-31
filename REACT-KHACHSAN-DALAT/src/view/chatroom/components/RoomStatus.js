import React from 'react'
import PropTypes from 'prop-types'
import { ROOM_STATUS_LABELS } from '../constants'

const RoomStatus = ({ status, trangThaiHienTai }) => {
  const label = ROOM_STATUS_LABELS[status] || ROOM_STATUS_LABELS['CHƯA DỌN']

  return (
    <div
      className={`flex items-center font-medium text-xs ${
        trangThaiHienTai !== 'TRỐNG'  ? 'text-white' : ''
      }  gap-1 ${label.className} mb-1`}
    >
      <span className="text-sm border  rounded-full px-2">
        {' '}
        {label.text === 'Sạch' ? (
          <i className="fa-solid fa-sparkles hidden sm:inline"></i>
        ) : (
          <i className="fa-solid fa-broom-wide hidden sm:inline"></i>
        )}{' '}
        {label.text}
      </span>
    </div>
  )
}

RoomStatus.propTypes = {
  status: PropTypes.string.isRequired,
  trangThaiHienTai: PropTypes.string.isRequired,
}

export default RoomStatus
