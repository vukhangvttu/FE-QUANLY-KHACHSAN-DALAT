import React, { useEffect, useRef, useState } from 'react'
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
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { exportExcelHoaDon } from 'src/service/ThongKeXuatExcelService'

const XuatExcelHoaDon = ({ visible, onClose, ma_booking }) => {
  const [loadexcel, setLoadExcel] = useState(false)
  const handleExportExcel = async () => {
    if (ma_booking === null || ma_booking === undefined || ma_booking === '') {
      addToast(exampleToast('⚠️ Mã booking hiện không hợp lệ'))
      return
    }
    try {
      setLoadExcel(true)
      const blob = await exportExcelHoaDon(ma_booking)

      console.log('Xuất excel thành công:', blob)
      // Tạo URL cho blob
      const url = window.URL.createObjectURL(blob)
      // Tạo link tạm thời
      const link = document.createElement('a')
      link.href = url
      const now = new Date()
      const yyyy = now.getFullYear()
      const MM = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const HH = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      const ss = String(now.getSeconds()).padStart(2, '0')

      const fileName = `XacNhanHoaDon_${yyyy}${MM}${dd}${HH}${mm}${ss}.xlsx`

      link.setAttribute('download', fileName)
      // Thêm link vào DOM
      document.body.appendChild(link)
      // Click vào link để tải
      link.click()
      // Xóa link và URL
      link.remove()
      window.URL.revokeObjectURL(url)

      addToast(exampleToast('✔️ Xuất excel thành công!'))
      onClose() // Đóng modal khi xuất excel thành công
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error)
      addToast(exampleToast('❌ Lỗi khi xuất báo cáo. Vui lòng thử lại sau!'))
    } finally {
      setLoadExcel(false)
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
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Xuất Excel
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div>
            <span>Bạn có muốn xuất file excel hóa đơn cho booking này? </span>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose}>
            Bỏ qua
          </CButton>
          {loadexcel ? (
            <CButton color="success" disabled>
              <CSpinner as="span" size="sm" aria-hidden="true" />
              Đang xử lý...
            </CButton>
          ) : (
            <CButton color="success" className="text-white px-4" onClick={handleExportExcel}>
              <FontAwesomeIcon icon={faCircleCheck} /> Đồng ý
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

XuatExcelHoaDon.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  ma_booking: PropTypes.string.isRequired, // ma_booking là string, bắt buộc
}
export default XuatExcelHoaDon
