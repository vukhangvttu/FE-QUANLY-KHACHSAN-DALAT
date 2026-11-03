import React, { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CModalFooter,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
  CFormLabel,
  CAlert,
  CFormCheck,
} from '@coreui/react-pro'
import { format, parseISO } from 'date-fns'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import {
  updateCheckNhanPhongAll,
  getDanhSachPhongCheckInByMaBooKing,
} from 'src/service/XepPhongBooKingService'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from 'react-currency-input-field'

const CheckInAllPhongModal = ({ visible, onClose, maBooking }) => {
  const [trangthaiload, setTrangthaiload] = useState(false)
  const [checkInStatus, setCheckInStatus] = useState({
    isLate: false,
    isEarly: false,
    message: '',
    alertType: 'info',
  })
  const [danhSachPhong, setDanhSachPhong] = useState([])
  const [checkedPhongs, setCheckedPhongs] = useState([])

  // Kiểm tra thời gian check-in khi modal mở
  useEffect(() => {
    if (visible) {
      if (maBooking) {
        fetchDanhSachPhong()
      }
    } else {
      // Reset state khi modal đóng
      setDanhSachPhong([])
      setCheckedPhongs([])
      setCheckInStatus({
        isLate: false,
        isEarly: false,
        message: '',
        alertType: 'info',
      })
    }
  }, [visible, maBooking])

  const fetchDanhSachPhong = async () => {
    try {
      const data = await getDanhSachPhongCheckInByMaBooKing(maBooking)
      console.log('Dữ liệu API danh sách phòng check-in:', data)
      if (data) {
        setDanhSachPhong(data)
      }
    } catch (error) {
      console.error('Lỗi khi fetch danh sách phòng:', error)
    }
  }

  const onClickDaNhanPhong = async (maBooking) => {
    if (maBooking === null || maBooking === undefined) {
      return addToast(exampleToast('⚠️ Mã booking hiện không hợp lệ'))
    } else {
      try {
        setTrangthaiload(true)

        // Lấy danh sách tất cả các phòng để gửi lên, true nếu đã chọn, false nếu không chọn
        const requestPayload = danhSachPhong.map((p) => ({
          maXepPhongBooking: p.ma_xep_phong_booking,
          maPhong: p.ma_phong,
          check: checkedPhongs.includes(p.ma_phong),
        }))

        // 5. Gọi API mới
        const response = await updateCheckNhanPhongAll(requestPayload)

        console.log('Cập nhật check in all successfully:', response)
        setTrangthaiload(false)

        // 6. Kiểm tra mã phản hồi từ server
        if (response && [400, 403, 500].includes(response.code)) {
          return addToast(exampleToast(`❌ ${response.message}`))
        }

        if (response && response.code === 200) {
          addToast(exampleToast('✔️ Check-In nhận phòng thành công'))
          fetchDanhSachPhong() // Cập nhật lại danh sách sau khi check-in thành công
          // onClose() // Đóng modal nếu cần
        }
      } catch (error) {
        console.error('Error:', error)
        setTrangthaiload(false)
        // 7. Xử lý lỗi khi gọi API
        if (error.response) {
          const { status, data } = error.response

          if (status === 500) {
            addToast(exampleToast('❌ Cập nhật không thành công. Internal Server Error!'))
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
        scrollable
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Thông báo
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h4 className="mb-3">
            Bạn có muốn <span className="text-red-500">check-in</span> nhận phòng BK-ID: {maBooking}
          </h4>

          {/* Hiển thị thông báo về thời gian check-in */}
          {checkInStatus.message && (
            <CAlert color={checkInStatus.alertType} className="mb-3">
              <div className="d-flex align-items-center">
                {checkInStatus.isEarly && <FontAwesomeIcon icon={faClock} className="me-2" />}
                <span>{checkInStatus.message}</span>
              </div>
            </CAlert>
          )}

          {/* Checkbox danh sách phòng 2 cột */}
          {danhSachPhong && danhSachPhong.length > 0 && (
            <div className="mb-4">
              <div className="row">
                <div className="col-12 mb-3 border-bottom pb-2">
                  <CFormCheck
                    id="checkAll"
                    label={
                      <span>
                        <span className="fw-bold">Chọn tất cả</span>({danhSachPhong.length} phòng)
                      </span>
                    }
                    checked={
                      checkedPhongs.length === danhSachPhong.length && danhSachPhong.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCheckedPhongs(danhSachPhong.map((p) => p.ma_phong))
                      } else {
                        setCheckedPhongs([])
                      }
                    }}
                  />
                </div>
                {danhSachPhong.map((phong, idx) => {
                  const isChecked = checkedPhongs.includes(phong.ma_phong)
                  let timeDisplay = ''
                  if (isChecked && phong.thoi_gian_nhan) {
                    try {
                      timeDisplay = format(parseISO(phong.thoi_gian_nhan), 'HH:mm dd/MM/yyyy')
                    } catch (e) {
                      timeDisplay = phong.thoi_gian_nhan
                    }
                  }

                  return (
                    <div className="col-6 mb-3" key={idx}>
                      <CFormCheck
                        id={`check_${phong.ma_phong}`}
                        label={`Phòng: ${phong.ma_phong || phong.ten_phong || ''}`}
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCheckedPhongs((prev) => [...prev, phong.ma_phong])
                          } else {
                            setCheckedPhongs((prev) => prev.filter((id) => id !== phong.ma_phong))
                          }
                        }}
                      />
                      {isChecked && phong.thoi_gian_nhan && (
                        <div className="text-muted ms-4 mt-1" style={{ fontSize: '0.85rem' }}>
                          Thời gian nhận: {timeDisplay}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton
              color="success"
              className="text-white px-3"
              onClick={() => onClickDaNhanPhong(maBooking)}
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

CheckInAllPhongModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  maBooking: PropTypes.string,
}
export default CheckInAllPhongModal
