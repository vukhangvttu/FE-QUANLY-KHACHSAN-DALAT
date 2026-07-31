import React from 'react'
import PropTypes from 'prop-types'
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import XuatPhieuChiTietDatPhong from '../pdf/XuatPhieuChiTietDatPhong'

const XuatPhieuChiTietDatPhongModal = ({ visible, onClose, maBooking }) => {
  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      aria-labelledby="XuatPhieuChiTietDatPhongModal"
    >
      <CModalHeader>
        <CModalTitle id="XuatPhieuChiTietDatPhongModal" className="font-bold text-blue-600">
          Chi tiết đặt phòng - {maBooking}
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <XuatPhieuChiTietDatPhong maBookingProp={maBooking} />
      </CModalBody>
    </CModal>
  )
}

XuatPhieuChiTietDatPhongModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maBooking: PropTypes.string.isRequired,
}

export default XuatPhieuChiTietDatPhongModal
