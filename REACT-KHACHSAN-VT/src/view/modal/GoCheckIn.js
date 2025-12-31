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
import { updateNhanPhongBooking } from 'src/service/XepPhongBooKingService'
import { useNavigate } from 'react-router-dom'

const GoCheckIn = ({ visible, onClose, ma_xepphong_bookking, tenphong, onSubmit }) => {
  const navigate = useNavigate()

  const [trangthaiload, setTrangthaiload] = useState(false)

  const onClickDaNhanPhong = async (ma_xepphong_bookking) => {
    if (ma_xepphong_bookking === null || ma_xepphong_bookking === undefined) {
      return addToast(exampleToast('⚠️ Mã booking hiện không hợp lệ'))
    } else {
      try {
        setTrangthaiload(true)
        // 5. Gọi API nếu dữ liệu hợp lệ
        const response = await updateNhanPhongBooking(ma_xepphong_bookking, true, navigate)

        console.log('createXepPhongBooking successfully:', response)
        setTrangthaiload(false)
        // 6. Kiểm tra mã phản hồi từ server
        if ([400, 500].includes(response.code)) {
          return addToast(exampleToast(response.message))
        }

        if (response.code === 200) {
          if (response.result) {
            addToast(exampleToast('✅ Check-In nhận phòng thành công ' + tenphong))
            onSubmit(true)
          } else {
            addToast(exampleToast('❌ Check-In nhận phòng lỗi'))
          }
        }
      } catch (error) {
        console.error('Error:', error)
        setTrangthaiload(false)
        // 7. Xử lý lỗi khi gọi API
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
      }
    }
  }

  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const exampleToast = (message) => (
    <CToast>
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
        <small>Thông báo biến mất sau 5 giây</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  return (
    <>
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>

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
            Bạn có muốn <span className="text-red-500">gỡ check-in</span> phòng {tenphong} không ?
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
              onClick={() => onClickDaNhanPhong(ma_xepphong_bookking)}
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

GoCheckIn.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  ma_xepphong_bookking: PropTypes.string,
  tenphong: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
export default GoCheckIn
