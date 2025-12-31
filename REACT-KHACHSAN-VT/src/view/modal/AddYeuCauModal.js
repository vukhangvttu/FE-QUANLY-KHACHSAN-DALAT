import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CFormTextarea, CModalFooter } from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'

const AddYeuCauModal = ({ visible, onClose }) => {
  return (
    <>
      <CModal
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold">
            Ghi chú
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormTextarea
            id="exampleFormControlTextarea1"
            rows={3}
            placeholder="Nhập ghi chú"
          ></CFormTextarea>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Bỏ qua
          </CButton>
          <CButton color="success" className="text-white px-4">
            Lưu
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

AddYeuCauModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
}
export default AddYeuCauModal
