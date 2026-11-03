import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
  CToast,
  CToastBody,
  CToastHeader,
  CToaster,
} from '@coreui/react-pro'
import { updateChuyenThongTinKhachHang } from 'src/service/XepPhongBooKingService'

const ChuyenThongTinKhachHangModal = ({
  visible,
  onClose,
  maXepPhongCu,
  phongOptions,
  onSubmit,
}) => {
  const [maXepPhongMoi, setMaXepPhongMoi] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const toaster = useRef(null)
  const roomOptions = phongOptions.map((phong) => ({
    value: phong.maxepphongbooking,
    label: `${phong.tenPhong} - ${phong.tenkhachhang || 'Chưa có tên khách'}`,
  }))

  const showToast = (message) => {
    setToast(
      <CToast autohide delay={5000}>
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
            <rect width="100%" height="100%" fill="#007aff" />
          </svg>
          <div className="fw-bold me-auto">Thông báo</div>
          <small>Thông báo biến mất sau 5 giây</small>
        </CToastHeader>
        <CToastBody>{message}</CToastBody>
      </CToast>,
    )
  }

  useEffect(() => {
    if (visible) {
      setMaXepPhongMoi('')
    }
  }, [visible])

  const handleSubmit = async () => {
    if (!maXepPhongCu || !maXepPhongMoi) {
      showToast('⚠️ Vui lòng chọn phòng nhận thông tin khách hàng.')
      return
    }

    setLoading(true)
    try {
      const response = await updateChuyenThongTinKhachHang(maXepPhongCu, maXepPhongMoi)
      if (response?.code !== 200 || response.result !== true) {
        showToast(`❌ ${response?.message || 'Chuyển thông tin khách hàng không thành công.'}`)
        return
      }

      showToast(`✔️ ${response.message || 'Chuyển thông tin khách hàng thành công.'}`)
      onClose()
      onSubmit(maXepPhongMoi)
    } catch (error) {
      showToast(
        `❌ ${
          error.response?.data?.message ||
          'Không thể chuyển thông tin khách hàng. Vui lòng thử lại.'
        }`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed top-0 right-0 z-50">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>
      <CModal alignment="center" visible={visible} onClose={onClose}>
        <CModalHeader>
          <CModalTitle className="fw-bold text-blue-500">Chuyển thông tin khách hàng</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <label className="form-label" htmlFor="room-transfer-destination">
            Chọn phòng đang ở nhận thông tin
          </label>
          <Select
            inputId="room-transfer-destination"
            options={roomOptions}
            value={roomOptions.find((option) => option.value === maXepPhongMoi) || null}
            onChange={(option) => setMaXepPhongMoi(option?.value || '')}
            placeholder="-- Chọn phòng --"
            noOptionsMessage={() => 'Không tìm thấy phòng phù hợp'}
            isSearchable
            isDisabled={loading}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
          />
          {phongOptions.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">Không có phòng đang check-in phù hợp.</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </CButton>
          <CButton
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !maXepPhongMoi || phongOptions.length === 0}
          >
            {loading && <CSpinner size="sm" className="me-2" />}
            {loading ? 'Đang chuyển...' : 'Xác nhận'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

ChuyenThongTinKhachHangModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maXepPhongCu: PropTypes.string,
  phongOptions: PropTypes.arrayOf(
    PropTypes.shape({
      maxepphongbooking: PropTypes.string.isRequired,
      tenPhong: PropTypes.string.isRequired,
      tenkhachhang: PropTypes.string,
    }),
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default ChuyenThongTinKhachHangModal
