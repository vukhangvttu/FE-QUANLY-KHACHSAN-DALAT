import React, { useState, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CSpinner,
  CButton,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CFormLabel,
  CFormSelect,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import { exportExcelThongKePhongDaBanKhoanThoiGian } from 'src/service/ThongKeService'
import { exportThongKePhongDaBan } from 'src/utils/exportThongKePhongDaBan'
import PropTypes from 'prop-types'

const ThongKeTiLeFullPhong = ({ isActive }) => {


    const [thangBD, setThangBD] = useState("1")
    const [namBD, setNamBD] = useState("2025")
    const [thangKT, setThangKT] = useState("12")
    const [namKT, setNamKT] = useState("2025")

  const [loadexcel, setLoadExcel] = useState(false)

  const handleExport = async () => {
    const thangBDNum = parseInt(thangBD, 10)
    const thangKTNum = parseInt(thangKT, 10)
    const namBDNum = parseInt(namBD, 10)
    const namKTNum = parseInt(namKT, 10)
    const namHienTai = new Date().getFullYear()

    if (thangBDNum < 1 || thangBDNum > 12 || thangKTNum < 1 || thangKTNum > 12) {
      addToast(exampleToast('❌ Tháng không hợp lệ. Tháng phải từ 1 đến 12.'))
      return
    }

    if (namBDNum > namKTNum) {
      addToast(exampleToast('❌ Năm bắt đầu không được lớn hơn năm kết thúc.'))
      return
    }

    if (namBDNum < 2025 || namBDNum > namHienTai || namKTNum > namHienTai) {
      addToast(exampleToast(`❌ Năm phải từ 2025 đến ${namHienTai}.`))
      return
    }

    if (namBDNum === namKTNum && thangBDNum > thangKTNum) {
      addToast(exampleToast('❌ Tháng bắt đầu không được lớn hơn tháng kết thúc trong cùng năm.'))
      return
    }

    try {
      setLoadExcel(true)
      const data = await exportExcelThongKePhongDaBanKhoanThoiGian(
        thangBD,
        namBD,
        thangKT,
        namKT,
      )

      console.log('[ThongKeTiLeFullPhong] data từ API:', data)

      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error('Không có dữ liệu để xuất.')
      }

      await exportThongKePhongDaBan(data, thangBD, namBD, thangKT, namKT)
      addToast(exampleToast('✔ Xuất báo cáo thành công!'))
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error)
      addToast(exampleToast(`❌ Lỗi khi xuất báo cáo: ${error.message}`))
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
    <div>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      <CCard className="mt-2 mb-2">
        <CCardBody className="p-3">
          <CRow className="g-3 align-items-end">
            <CCol md={2}>
              <CFormLabel className="col-form-label labelcustome">Tháng bắt đầu</CFormLabel>
              <CFormSelect aria-label="Tháng bắt đầu" value={thangBD} onChange={(e) => setThangBD(e.target.value)}>
                <option value="1">Tháng 1</option>
                <option value="2">Tháng 2</option>
                <option value="3">Tháng 3</option>
                <option value="4">Tháng 4</option>
                <option value="5">Tháng 5</option>
                <option value="6">Tháng 6</option>
                <option value="7">Tháng 7</option>
                <option value="8">Tháng 8</option>
                <option value="9">Tháng 9</option>
                <option value="10">Tháng 10</option>
                <option value="11">Tháng 11</option>
                <option value="12">Tháng 12</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel className="col-form-label labelcustome">Năm bắt đầu</CFormLabel>
              <CFormSelect aria-label="Năm bắt đầu" value={namBD} onChange={(e) => setNamBD(e.target.value)}>
                <option value="2025">Năm 2025</option>
                <option value="2026">Năm 2026</option>
                <option value="2027">Năm 2027</option>
                <option value="2028">Năm 2028</option>
                <option value="2029">Năm 2029</option>
                <option value="2030">Năm 2030</option>
                <option value="2031">Năm 2031</option>
                <option value="2032">Năm 2032</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel className="col-form-label labelcustome">Tháng kết thúc</CFormLabel>
              <CFormSelect aria-label="Tháng kết thúc" value={thangKT} onChange={(e) => setThangKT(e.target.value)}>
                <option value="1">Tháng 1</option>
                <option value="2">Tháng 2</option>
                <option value="3">Tháng 3</option>
                <option value="4">Tháng 4</option>
                <option value="5">Tháng 5</option>
                <option value="6">Tháng 6</option>
                <option value="7">Tháng 7</option>
                <option value="8">Tháng 8</option>
                <option value="9">Tháng 9</option>
                <option value="10">Tháng 10</option>
                <option value="11">Tháng 11</option>
                <option value="12">Tháng 12</option>
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel className="col-form-label labelcustome">Năm kết thúc</CFormLabel>
             <CFormSelect aria-label="Tháng kết thúc" value={namKT} onChange={(e) => setNamKT(e.target.value)}>
                <option value="2025">Năm 2025</option>
                <option value="2026">Năm 2026</option>
                <option value="2027">Năm 2027</option>
                <option value="2028">Năm 2028</option>
                <option value="2029">Năm 2029</option>
                <option value="2030">Năm 2030</option>
                <option value="2031">Năm 2031</option>
                <option value="2032">Năm 2032</option>
                
              </CFormSelect>
            </CCol>
            <CCol md={4} className="d-flex align-items-end">
              {loadexcel ? (
                <CButton color="success" disabled className="w-100">
                  <CSpinner as="span" size="sm" aria-hidden="true" className="me-2" />
                  Đang xử lý...
                </CButton>
              ) : (
                <CButton color="success" className="text-white w-100" onClick={handleExport}>
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Xuất thống kê
                </CButton>
              )}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  )
}
ThongKeTiLeFullPhong.propTypes = {
  isActive: PropTypes.bool.isRequired,
}
export default ThongKeTiLeFullPhong
