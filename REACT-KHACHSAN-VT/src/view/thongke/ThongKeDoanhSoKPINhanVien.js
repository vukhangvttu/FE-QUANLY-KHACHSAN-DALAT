import React, { useState, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
  CDatePicker,
  CButton,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDownload,
} from '@fortawesome/free-solid-svg-icons'

import {
  exportExcelThongKeDoanhSoKPINhanVien,
} from 'src/service/ThongKeService'


const ThongKeDoanhSoKPINhanVien = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  })

  const handleDateChange = (date, type) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: date,
    }))
  }

  const [loadexcel, setLoadExcel] = useState(false)
  const handleExport = async () => {
    try {
      setLoadExcel(true)
      const blob = await exportExcelThongKeDoanhSoKPINhanVien(
        dateRange.startDate,
        dateRange.endDate,
      
      )

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

      const fileName = `ThongKeDoanhThuKPINhanVien${yyyy}${MM}${dd}${HH}${mm}${ss}.xlsx`

      link.setAttribute('download', fileName)
      // Thêm link vào DOM
      document.body.appendChild(link)
      // Click vào link để tải
      link.click()
      // Xóa link và URL
      link.remove()
      window.URL.revokeObjectURL(url)

      addToast(exampleToast('✔ Xuất báo cáo thành công!'))
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
    <div className=" p-0 m-0 mt-2">
      <div className="">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

        {/* Bộ lọc */}
        <CCard className="mt-2 mb-2 w-full m-0">
          <CCardBody className="p-3">
            <CRow className="m-0 mb-2">

              <CCol md={2}>
                <CDatePicker
                  locale="en-GB"
                  date={dateRange.startDate}
                  onDateChange={(date) => handleDateChange(date, 'startDate')}
                  className="w-full"
                />
              </CCol>
              <CCol md={2}>
                <CDatePicker
                  locale="en-GB"
                  date={dateRange.endDate}
                  onDateChange={(date) => handleDateChange(date, 'endDate')}
                  className="w-full"
                />
              </CCol>
               <CCol md={3} className="pe-0 ">
                
                {loadexcel ? (
                  <CButton color="success" disabled>
                    <CSpinner as="span" size="sm" aria-hidden="true" />
                    Xuất báo cáo...
                  </CButton>
                ) : (
                  <CButton color="success" className="text-white" onClick={handleExport}>
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Xuất báo cáo
                  </CButton>
                )}
              </CCol>
            </CRow>
         
          </CCardBody>
        </CCard>

      </div>
    </div>
  )
}

export default ThongKeDoanhSoKPINhanVien
