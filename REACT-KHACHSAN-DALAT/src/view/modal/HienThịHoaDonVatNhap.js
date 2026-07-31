import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CFormTextarea, CModalFooter } from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const HienThịHoaDonVatNhap = ({ visible, onClose, pdfUrl }) => {
  return (
    <>
      <CModal
        fullscreen
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold">
            PDF Hóa Đơn VAT Nháp
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="modal-body" style={{ height: '85vh' }}>
            <iframe
              src={pdfUrl}
              title="Hóa đơn VAT"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} /> Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

HienThịHoaDonVatNhap.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pdfUrl: PropTypes.string,
}
export default HienThịHoaDonVatNhap
