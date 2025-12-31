import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CFormTextarea,
  CModalFooter,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { xacNhanHoaDonVatNhap } from 'src/service/HoaDonVatService'

const XacNhanHoaDonVat = ({ visible, onClose, ma_hoadon_vat, onSubmit }) => {
  const [trangthailoadxacnhan, setTrangThaiLoadXacNhan] = useState(false)
  const [countdown, setCountdown] = useState(6)

  const handleChangeXacNhanHoaDonNhap = async () => {
    if (!ma_hoadon_vat) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần xác nhận'))
      return
    }
    try {
      setTrangThaiLoadXacNhan(true)

      setCountdown(6)

      // Đếm ngược mỗi giây
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const response = await xacNhanHoaDonVatNhap(ma_hoadon_vat)

      setTrangThaiLoadXacNhan(false)

      console.log(response)

      if (response.status === 200) {
        if (response.data.result) {
          addToast(exampleToast('✅ Phát hành hóa đơn VAT thành công'))

          const data = {
            data: {
              trangthai: true,
              ma_hoadon_vat: ma_hoadon_vat,
            },
          }
          onSubmit(data)
          onClose()
        } else {
          addToast(exampleToast('❌ Phát hành hóa đơn VAT không thành công'))
        }
      } else if (response.status === 403) {
        addToast(exampleToast('❌ Bạn không có quyền thực hiện thao tác này'))
      } else if (response.status === 400) {
        const errMsg = '❌ Dữ liệu không hợp lệ'
        addToast(exampleToast(errMsg))
      } else if (response.status === 500) {
        addToast(exampleToast('❌ Internal Server Error!'))
      } else {
        addToast(exampleToast('❌ Lỗi không xác định khi in hóa đơn VAT'))
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangThaiLoadXacNhan(false)
      // addToast(exampleToast('❌ Lỗi kết nối đến server'))
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
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

      <CModal
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold">
            Xác Nhận Phát Hành Hóa Đơn VAT
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <h4>
            Bạn có muốn <span className="text-red-500">Xác Nhận hóa đơn VAT nháp</span> sang hóa đơn
            VAT phát hành không ?
          </h4>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Bỏ qua
          </CButton>
          {trangthailoadxacnhan ? (
            <CButton color="success" disabled>
              <CSpinner as="span" size="sm" aria-hidden="true" className="font-semibold" />
              &nbsp; Chờ xử lý {countdown}s ...
            </CButton>
          ) : (
            <>
              <CButton
                color="success"
                variant="outline"
                className="font-semibold hover:text-white"
                onClick={handleChangeXacNhanHoaDonNhap}
              >
                <FontAwesomeIcon icon={faCircleCheck} /> Đồng ý
              </CButton>
            </>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

XacNhanHoaDonVat.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  ma_hoadon_vat: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
}
export default XacNhanHoaDonVat
