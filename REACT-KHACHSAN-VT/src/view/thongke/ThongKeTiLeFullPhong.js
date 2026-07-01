import React, { useState, useRef, useMemo } from 'react'
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
import { faDownload, faSearch, faTable } from '@fortawesome/free-solid-svg-icons'

import { exportExcelThongKePhongDaBanKhoanThoiGian } from 'src/service/ThongKeService'
import { exportThongKePhongDaBan } from 'src/utils/exportThongKePhongDaBan'
import PropTypes from 'prop-types'

const ThongKeTiLeFullPhong = ({ isActive }) => {
  const [thangBD, setThangBD] = useState("1")
  const [namBD, setNamBD] = useState("2026")
  const [thangKT, setThangKT] = useState("12")
  const [namKT, setNamKT] = useState("2026")

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadexcel, setLoadExcel] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [filterNam, setFilterNam] = useState('')
  const [filterThang, setFilterThang] = useState('')

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

  const validate = () => {
    const thangBDNum = parseInt(thangBD, 10)
    const thangKTNum = parseInt(thangKT, 10)
    const namBDNum = parseInt(namBD, 10)
    const namKTNum = parseInt(namKT, 10)
    const namHienTai = new Date().getFullYear()

    if (thangBDNum < 1 || thangBDNum > 12 || thangKTNum < 1 || thangKTNum > 12) {
      addToast(exampleToast('❌ Tháng không hợp lệ. Tháng phải từ 1 đến 12.'))
      return false
    }

    if (namBDNum > namKTNum) {
      addToast(exampleToast('❌ Năm bắt đầu không được lớn hơn năm kết thúc.'))
      return false
    }

    if (namBDNum < 2025 || namBDNum > namHienTai || namKTNum > namHienTai) {
      addToast(exampleToast(`❌ Năm phải từ 2025 đến ${namHienTai}.`))
      return false
    }

    if (namBDNum === namKTNum && thangBDNum > thangKTNum) {
      addToast(exampleToast('❌ Tháng bắt đầu không được lớn hơn tháng kết thúc trong cùng năm.'))
      return false
    }

    return true
  }

  const normalizeData = (rawData) => {
    if (!rawData) return []
    let items = rawData
    if (!Array.isArray(rawData)) {
      items = rawData.result ?? rawData.data ?? rawData.content ?? Object.values(rawData)[0] ?? []
    }
    return Array.isArray(items) ? items : []
  }

  const groupedData = useMemo(() => {
    const grouped = {}
    data.forEach((item) => {
      if (!grouped[item.nam]) grouped[item.nam] = {}
      if (!grouped[item.nam][item.thang]) grouped[item.nam][item.thang] = {}
      grouped[item.nam][item.thang][item.ngay] = {
        so_phong_da_ban: item.so_phong_da_ban,
        ti_le_full: item.ti_le_full,
      }
    })
    return grouped
  }, [data])

  const years = useMemo(() => {
    const result = []
    const namBDNum = parseInt(namBD, 10)
    const namKTNum = parseInt(namKT, 10)
    for (let y = namBDNum; y <= namKTNum; y++) result.push(y)
    return result
  }, [namBD, namKT])

  const getCellValue = (nam, thang, ngay, field) => {
    const val = groupedData[nam]?.[thang]?.[ngay]?.[field]
    if (val === null || val === undefined || val === '') return ''
    return val
  }

  const formatTiLe = (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const num = Number(value)
    if (isNaN(num)) return value
    return `${Math.round(num)}%`
  }

  const isSaturday = (nam, thang, ngay) => {
    const date = new Date(nam, thang - 1, ngay)
    return date.getMonth() === thang - 1 && date.getDay() === 6
  }

  const tinhTrungBinh = (nam, thang, field) => {
    let sum = 0
    let count = 0
    for (let ngay = 1; ngay <= 31; ngay++) {
      const val = getCellValue(nam, thang, ngay, field)
      if (val !== '') {
        sum += Number(val)
        count++
      }
    }
    if (count === 0) return ''
    const avg = sum / count
    return field === 'ti_le_full' ? `${Math.round(avg)}%` : Math.round(avg).toString()
  }

  const handleSearch = async () => {
    if (!validate()) return
    try {
      setLoading(true)
      setHasSearched(true)
      const rawData = await exportExcelThongKePhongDaBanKhoanThoiGian(thangBD, namBD, thangKT, namKT)
      console.log('[ThongKeTiLeFullPhong] data từ API:', rawData)
      const normalized = normalizeData(rawData)
      if (normalized.length === 0) {
        addToast(exampleToast('⚠️ Không tìm thấy dữ liệu trong khoảng thời gian này!'))
      } else {
        addToast(exampleToast('✔ Tìm kiếm thành công!'))
      }
      setData(normalized)
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error)
      setData([])
      addToast(exampleToast(`❌ Lỗi khi tìm kiếm dữ liệu: ${error.message}`))
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!validate()) return
    try {
      setLoadExcel(true)
      const rawData = await exportExcelThongKePhongDaBanKhoanThoiGian(thangBD, namBD, thangKT, namKT)
      console.log('[ThongKeTiLeFullPhong] data từ API:', rawData)
      const normalized = normalizeData(rawData)
      if (normalized.length === 0) {
        throw new Error('Không có dữ liệu để xuất.')
      }
      await exportThongKePhongDaBan(normalized, thangBD, namBD, thangKT, namKT)
      addToast(exampleToast('✔ Xuất báo cáo thành công!'))
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error)
      addToast(exampleToast(`❌ Lỗi khi xuất báo cáo: ${error.message}`))
    } finally {
      setLoadExcel(false)
    }
  }

  const renderTable = (nam) => {
    const namBDNum = parseInt(namBD, 10)
    const namKTNum = parseInt(namKT, 10)
    const thangBDNam = nam === namBDNum ? parseInt(thangBD, 10) : 1
    const thangKTNam = nam === namKTNum ? parseInt(thangKT, 10) : 12

    const thangFilterNum = filterThang ? parseInt(filterThang, 10) : null
    const months = thangFilterNum
      ? [thangFilterNum]
      : Array.from({ length: 12 }, (_, i) => i + 1)

    const dayHeaders = Array.from({ length: 31 }, (_, i) => (
      <th key={`day-${i}`} className="text-center" style={{ minWidth: '38px' }}>
        {i + 1}
      </th>
    ))

    return (
      <CCard key={`table-${nam}`} className="mb-4">
        <CCardBody className="p-3">
          <div className="text-center fw-bold mb-3 fs-6">
            BẢNG THEO DÕI TỈ LỆ PHÒNG ĐÃ BÁN
            <br />
            <span className="fs-6">
              (Từ tháng {thangBDNam}/{nam} đến tháng {thangKTNam}/{nam})
            </span>
          </div>
          <div className="overflow-auto">
            <table className="table table-bordered table-sm table-striped align-middle mb-0" style={{ tableLayout: 'auto' }}>
              <thead className="table-dark">
                <tr>
                  <th rowSpan={2} className="text-center" style={{ minWidth: '90px', verticalAlign: 'middle' }}>
                    Tháng
                  </th>
                  <th rowSpan={2} className="text-center" style={{ minWidth: '130px', verticalAlign: 'middle' }}>
                    Chỉ tiêu
                  </th>
                  <th rowSpan={2} className="text-center" style={{ minWidth: '110px', verticalAlign: 'middle' }}>
                    TB CỦA THÁNG
                  </th>
                  <th colSpan={31} className="text-center">
                    Ngày
                  </th>
                </tr>
                <tr>{dayHeaders}</tr>
              </thead>
              <tbody>
                {months.map((thang) => (
                  <React.Fragment key={`month-${thang}`}>
                    <tr>
                      <td rowSpan={2} className="text-center fw-semibold" style={{ verticalAlign: 'middle' }}>
                        Tháng {thang}
                      </td>
                      <td className="fw-semibold">Số phòng đã bán</td>
                      <td className="text-center fw-semibold">
                        {tinhTrungBinh(nam, thang, 'so_phong_da_ban')}
                      </td>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((ngay) => (
                        <td
                          key={`ban-${ngay}`}
                          className="text-center"
                          style={isSaturday(nam, thang, ngay) ? { backgroundColor: '#fff3cd' } : {}}
                        >
                          {getCellValue(nam, thang, ngay, 'so_phong_da_ban')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="fw-semibold">Tỉ lệ full</td>
                      <td className="text-center fw-semibold">
                        {tinhTrungBinh(nam, thang, 'ti_le_full')}
                      </td>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((ngay) => (
                        <td
                          key={`tile-${ngay}`}
                          className="text-center"
                          style={isSaturday(nam, thang, ngay) ? { backgroundColor: '#fff3cd' } : {}}
                        >
                          {formatTiLe(getCellValue(nam, thang, ngay, 'ti_le_full'))}
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CCardBody>
      </CCard>
    )
  }

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
              <CFormSelect aria-label="Năm kết thúc" value={namKT} onChange={(e) => setNamKT(e.target.value)}>
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
            <CCol md={4} className="d-flex gap-2 align-items-end">
              {loading ? (
                <CButton color="primary" disabled className="text-white flex-fill">
                  <CSpinner as="span" size="sm" aria-hidden="true" className="me-2" />
                  Đang tìm...
                </CButton>
              ) : (
                <CButton color="primary" className="text-white flex-fill" onClick={handleSearch}>
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Xem thống kê
                </CButton>
              )}
              {loadexcel ? (
                <CButton color="success" disabled className="flex-fill">
                  <CSpinner as="span" size="sm" aria-hidden="true" className="me-2" />
                  Đang xử lý...
                </CButton>
              ) : (
                <CButton color="success" className="text-white flex-fill" onClick={handleExport}>
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Xuất thống kê
                </CButton>
              )}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {loading ? (
        <CCard className="mb-4">
          <CCardBody className="p-5 text-center">
            <CSpinner color="primary" className="mb-3" />
            <p className="text-muted mb-0">Đang tải dữ liệu thống kê...</p>
          </CCardBody>
        </CCard>
      ) : (
        <>
          {data.length > 0 && (
            <div>
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
                <h5 className="mb-0 fw-bold">Kết quả thống kê</h5>
              </div>
              <CRow className="g-3 align-items-end mb-3">
                <CCol md={2}>
                  <CFormLabel className="col-form-label labelcustome">Lọc theo năm</CFormLabel>
                  <CFormSelect
                    aria-label="Lọc theo năm"
                    value={filterNam}
                    onChange={(e) => setFilterNam(e.target.value)}
                  >
                    <option value="">Tất cả năm</option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        Năm {y}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CFormLabel className="col-form-label labelcustome">Lọc theo tháng</CFormLabel>
                  <CFormSelect
                    aria-label="Lọc theo tháng"
                    value={filterThang}
                    onChange={(e) => setFilterThang(e.target.value)}
                  >
                    <option value="">Tất cả tháng</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={String(m)}>
                        Tháng {m}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              {years
                .filter((nam) => (filterNam ? String(nam) === filterNam : true))
                .map((nam) => renderTable(nam))}
            </div>
          )}

          {hasSearched && data.length === 0 && !loading && (
            <CCard className="mb-4">
              <CCardBody className="p-5 text-center">
                <FontAwesomeIcon icon={faTable} size="3x" className="text-muted mb-3" />
                <h5 className="text-muted">Không có dữ liệu thống kê</h5>
                <p className="text-muted">
                  Vui lòng chọn khoảng thời gian và nhấn &quot;Xem thống kê&quot; để xem báo cáo
                </p>
              </CCardBody>
            </CCard>
          )}
        </>
      )}
    </div>
  )
}
ThongKeTiLeFullPhong.propTypes = {
  isActive: PropTypes.bool.isRequired,
}
export default ThongKeTiLeFullPhong
