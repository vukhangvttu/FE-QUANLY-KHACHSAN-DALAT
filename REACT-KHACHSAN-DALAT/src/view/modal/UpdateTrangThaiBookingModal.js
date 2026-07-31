import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormLabel,
  CFormSelect,
  CModalFooter,
  CRow,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'


import { getAllTrangThaiBooKing, updateTrangThaiBooking } from 'src/service/APIService'

const UpdateTrangThaiBookingModal = ({ visible, onClose, maBooking, trangThai, onSubmit }) => {

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

  const [loading, setLoading] = useState(false)

  const [trangThaiBooKing, setTrangThaiBooKing] = useState([])

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await getAllTrangThaiBooKing()
      console.log(response)
      if (response) {
        console.log('response', response)
        setTrangThaiBooKing(response)
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const [trangThaiSelect, setTrangThaiSelect] = useState(trangThai)

  useEffect(() => {
    if (visible) {
      setTrangThaiSelect(trangThai)
    }
  }, [visible, trangThai])

  const onChangeTrangThai = (e) => {
    setTrangThaiSelect(e.target.value)
  }

  const handleSubmit = async () => {
    try {
      setTrangthaiload(true)
      const response = await updateTrangThaiBooking(maBooking, trangThaiSelect)
      if (response) {
        addToast(exampleToast('Cập nhật trạng thái thành công!'))
        onSubmit()
        onClose()
      } else {
        addToast(exampleToast('Cập nhật trạng thái thất bại. Vui lòng thử lại!'))
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái booking:', error)
      addToast(exampleToast('Đã xảy ra lỗi. Vui lòng thử lại!'))
    } finally {
      setTrangthaiload(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchData()
    }
  }, [visible])

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
          Cập nhật trạng thái BooKing: {maBooking}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="d-flex justify-content-center">
              <CSpinner />
            </div>
          ) : (
            <div>
              <CFormSelect
                name="trangThaiBooKing.maTrangThaiBooKing"
                value={trangThaiSelect}
                onChange={onChangeTrangThai}
                >
                {trangThaiBooKing
                    .filter(item => item.maTrangThaiBooKing !== 5)
                    .map(item => (
                    <option
                        key={item.maTrangThaiBooKing}
                        value={item.maTrangThaiBooKing}
                    >
                        {item.tenTrangThaiBooKing}
                    </option>
                    ))}
                </CFormSelect>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton color="success" className="text-white px-3" onClick={handleSubmit}>
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

UpdateTrangThaiBookingModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  maBooking: PropTypes.string.isRequired,
  trangThai: PropTypes.number.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
export default UpdateTrangThaiBookingModal
