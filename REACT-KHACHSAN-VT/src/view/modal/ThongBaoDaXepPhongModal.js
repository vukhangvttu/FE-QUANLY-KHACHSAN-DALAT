import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CFormTextarea, CModalFooter } from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

const ThongBaoDaXepPhongModal = ({ visible, onClose }) => {
  return (
    <>
      <CModal
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Thông báo
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h4>
            Hiện tại <span className="text-red-500">thông tin booking </span> đã được xếp phòng
            không thể cập nhật, những thông tin khác cập nhật bình thường, nếu muốn cập nhật thông
            tin booking hãy <span className="text-red-500">xóa xếp phòng</span> và quay trở lại
          </h4>
        </CModalBody>
        <CModalFooter>
          {/* <CButton color="secondary" onClick={onClose} variant="outline">
            Đóng
          </CButton> */}
        </CModalFooter>
      </CModal>
    </>
  )
}

ThongBaoDaXepPhongModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
}
export default ThongBaoDaXepPhongModal
