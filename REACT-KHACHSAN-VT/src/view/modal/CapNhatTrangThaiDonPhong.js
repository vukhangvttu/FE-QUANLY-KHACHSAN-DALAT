import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CModalFooter,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { useNavigate } from 'react-router-dom'
import { updateTrangThaiVeSinh } from 'src/service/PhongService'

const CapNhatTrangThaiDonPhong = ({ visible, onClose, valueDaDo, maPhong, onSubmit }) => {
  const navigate = useNavigate()
  const [trangthaiload, setTrangthaiload] = useState(false)
  const [toast, addToast] = useState()
  const toaster = useRef(null)

  const exampleToast = (message) => (
    <CToast autohide={true} delay={3000}>
      <CToastHeader closeButton>
        <svg
          className="rounded me-2"
          width="20"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
          role="img"
        >
          <rect width="100%" height="100%" fill="#007aff"></rect>
        </svg>
        <div className="fw-bold me-auto">Thông báo</div>
        <small>Thông báo biến mất sau 3 giây</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  const handleSuccess = (message) => {
    addToast(exampleToast(message))
    onSubmit(true)
    // Đợi 1 giây sau khi hiển thị toast mới đóng modal

    onClose()
  }

  const onClickUpdateVeSinhPhong = async (trangthai, maphong) => {
    if (maphong === null || maphong === undefined) {
      return addToast(exampleToast('⚠️ Mã Phòng hiện không hợp lệ'))
    } else if (trangthai === null || trangthai === undefined) {
      return addToast(exampleToast('⚠️ Trạng thái hiện không hợp lệ'))
    }

    try {
      setTrangthaiload(true)
      const response = await updateTrangThaiVeSinh(trangthai, maphong, navigate)

      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }

      if (response.code === 200) {
        if (response.result) {
          handleSuccess('✔️ ' + response.message + ' P.' + maphong)
        } else {
          addToast(exampleToast('❌ Update không thành công'))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 500) {
          addToast(exampleToast('❌ Thêm không thành công. Internal Server Error!'))
        } else if (data?.message) {
          addToast(exampleToast(`❌ ${data.message}`))
        } else {
          addToast(exampleToast('❌ Đã xảy ra lỗi không xác định!'))
        }
      } else {
        addToast(exampleToast('❌ Lỗi kết nối đến server'))
      }
    } finally {
      setTrangthaiload(false)
    }
  }

  return (
    <>
      <div className="fixed top-0 right-0 z-50">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>

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
            Chuyển trạng thái buồng phòng <span className="font-bold">P.{maPhong}</span> thành
            <span className="text-red-500 font-semibold">
              {' '}
              {valueDaDo === false ? 'Làm sạch' : 'Chưa dọn'}
            </span>
            ?
          </h4>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton
              color="success"
              className="text-white px-3"
              onClick={() => onClickUpdateVeSinhPhong(valueDaDo, maPhong)}
            >
              <FontAwesomeIcon icon={faCheck} /> Đồng ý
            </CButton>
          )}
          {trangthaiload && (
            <CButton color="success" disabled>
              <CSpinner as="span" size="sm" aria-hidden="true" />
              Đồng ý...
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

CapNhatTrangThaiDonPhong.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  valueDaDo: PropTypes.bool.isRequired,
  maPhong: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
export default CapNhatTrangThaiDonPhong
