import React from 'react'
import PropTypes from 'prop-types'
import { CModalFooter } from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'

const PDFHoaDonPhatHanh = ({ visible, onClose, pdfUrl }) => {
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
            PDF Hóa Đơn VAT Phát Hành
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="modal-body" style={{ height: '80vh' }}>
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
            Bỏ qua
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

PDFHoaDonPhatHanh.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pdfUrl: PropTypes.string,
}
export default PDFHoaDonPhatHanh
