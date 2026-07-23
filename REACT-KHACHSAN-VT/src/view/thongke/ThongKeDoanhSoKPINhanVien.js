import React, { useState, useRef } from 'react'
import { format } from 'date-fns'
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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormLabel,
  CFormSelect,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faSearch, faTable } from '@fortawesome/free-solid-svg-icons'

import {
  exportExcelThongKeDoanhSoKPINhanVien,
  getThongKeAllKPINhanVienTheoKhoanThoiGian,
  getThongKeChiTietKPINhanVienTheoKhoanThoiGian,
} from 'src/service/ThongKeService'


const ThongKeDoanhSoKPINhanVien = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  })
  const [activeTab, setActiveTab] = useState(1)
  const [allData, setAllData] = useState([])
  const [chiTietData, setChiTietData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadexcel, setLoadExcel] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filterNguoiTao, setFilterNguoiTao] = useState('')
  const PAGE_SIZE = 50
  const [pageAll, setPageAll] = useState(1)
  const [pageChiTiet, setPageChiTiet] = useState(1)

  const handleDateChange = (date, type) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: date,
    }))
  }

  const normalizeData = (rawData) => {
    if (!rawData) return []
    let items = rawData
    if (!Array.isArray(rawData)) {
      items = rawData.result ?? rawData.data ?? rawData.content ?? Object.values(rawData)[0] ?? []
    }
    return Array.isArray(items) ? items : []
  }

  const formatCurrency = (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const num = Number(value)
    if (isNaN(num)) return value
    return num.toLocaleString('vi-VN')
  }

  const formatDateTime = (value) => {
    if (!value) return ''
    try {
      return format(new Date(value), 'dd/MM/yyyy HH:mm')
    } catch {
      return value
    }
  }

  const formatDate = (value) => {
    if (!value) return ''
    try {
      return format(new Date(value), 'dd/MM/yyyy')
    } catch {
      return value
    }
  }

  const getNumericValue = (item, field) => {
    const val = item?.[field]
    if (val === '' || val === null || val === undefined) return 0
    const num = Number(val)
    return isNaN(num) ? 0 : num
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      setHasSearched(true)

      const allData = await getThongKeAllKPINhanVienTheoKhoanThoiGian(
        dateRange.startDate,
        dateRange.endDate,
      )
      console.log('[ThongKeDoanhSoKPINhanVien] data từ API /thong-ke-all-kpi-nhan-vien-theo-khoan-thoi-gian:', allData)

      const chiTietData = await getThongKeChiTietKPINhanVienTheoKhoanThoiGian(
        dateRange.startDate,
        dateRange.endDate,
      )
      console.log('[ThongKeDoanhSoKPINhanVien] data từ API /thong-ke-chi-tiet-kpi-nhan-vien-theo-khoan-thoi-gian:', chiTietData)

      const normalizedAll = normalizeData(allData)
      const normalizedChiTiet = normalizeData(chiTietData)
      if (normalizedAll.length === 0 && normalizedChiTiet.length === 0) {
        addToast(exampleToast('⚠️ Không tìm thấy dữ liệu trong khoảng thời gian này!'))
      } else {
        addToast(exampleToast('✔ Tìm kiếm thành công!'))
      }
      setAllData(normalizedAll)
      setChiTietData(normalizedChiTiet)
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error)
      setAllData([])
      setChiTietData([])
      addToast(exampleToast(`❌ Lỗi khi tìm kiếm dữ liệu: ${error.message}`))
    } finally {
      setLoading(false)
    }
  }

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

  const tongKPIFields = [
    'tong_tien_ta',
    'tong_tien_ota',
    'tong_tien_walkin',
    'tong_tien_doan_le',
    'tong_tien_doan_gala',
    'tong_tien_none',
    'tong_phu_thu_giuong',
    'tong_phu_thu_an_sang',
    'tong_phu_thu_tre_em',
    // 'tong_phu_thu_giuong',
    'tong_phu_thu_nguoi_lon',
    'tong_tien_setmonan',
    'tong_tien_minibar',
    'tong_tien_giatui',
    'tong_tien_denbu',
    'tong_tien_hoi_nghi',
    'tong_phu_thu_check_in_som',
    'tong_phu_thu_check_out_tre',
    'tong_thanh_toan',
  ]

  const chiTietKPIFields = [
    'tong_gia_phong',
    'tong_phu_thu_giuong',
    'tong_phu_thu_an_sang',
    'tong_phu_thu_tre_em',
    'tong_phu_thu_nguoi_lon',
    'tong_tien_dich_vu_minibar',
    'tong_tien_dich_vu_giatui',
    'tong_tien_dich_vu_khac',
    'tong_tien_den_bu',
    'tong_tien_hoi_nghi',
    'tong_phu_thu_check_in_som',
    'tong_phu_thu_check_out_tre',
    'tong_tien_set_mon_an',
    'tong_tien',
    'tien_coc',
    'tong_tien_cong_tien_coc',
  ]

  const renderPagination = (page, setPage, total, totalPagesOverride) => {
    const totalPages = totalPagesOverride ?? Math.ceil(total / PAGE_SIZE)
    if (totalPages <= 1) return null
    return (
      <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
        <span className="text-muted small">
          Trang {page}/{totalPages} &mdash; Tổng {total} dòng
        </span>
        <div className="d-flex gap-1 flex-wrap">
          <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="btn btn-sm disabled">…</span>
              ) : (
                <button
                  key={p}
                  className={`btn btn-sm ${ p === page ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
          <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      </div>
    )
  }

  const renderTongKPI = () => {
    const totalValues = tongKPIFields.map((field) =>
      allData.reduce((sum, item) => sum + getNumericValue(item, field), 0),
    )
    const start = (pageAll - 1) * PAGE_SIZE
    const pageData = allData.slice(start, start + PAGE_SIZE)

    return (
      <>
        <div className="overflow-auto">
          <table
            className="table table-bordered table-sm table-striped align-middle mb-0"
            style={{ tableLayout: 'auto' }}
          >
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ minWidth: '50px' }}>STT</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Người tạo</th>
                <th className="text-center" style={{ minWidth: '180px' }}>Tên nhân viên</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền TA</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền OTA</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền Walkin</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền đoàn lẻ</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền đoàn gala</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền NONE</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu giường</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu ăn sáng</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu trẻ em</th>
                {/* <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu giường</th> */}
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu người lớn</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền set món ăn</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền minibar</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền giặt ủi</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền đền bù</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền hội nghị</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu check in sớm</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng phụ thu check out trễ</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((item, index) => (
                <tr key={`tong-${start + index}`}>
                  <td className="text-center">{start + index + 1}</td>
                  <td>{item.nguoi_tao ?? ''}</td>
                  <td>{item.ten_nhan_vien ?? ''}</td>
                  {tongKPIFields.map((field) => (
                    <td key={field} className="text-end">{formatCurrency(item[field])}</td>
                  ))}
                </tr>
              ))}
              <tr className="table-warning fw-bold">
                <td className="text-center" colSpan={3}>Tổng cộng</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                {totalValues.slice(6).map((val, idx) => (
                  <td key={`total-${idx}`} className="text-end">{formatCurrency(val)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {renderPagination(pageAll, setPageAll, allData.length)}
      </>
    )
  }

  const calcGroupTotals = (rows) =>
    chiTietKPIFields.map((field) =>
      rows.reduce((sum, item) => {
        if (field === 'tong_tien_cong_tien_coc') {
          return sum + getNumericValue(item, 'tong_tien') + getNumericValue(item, 'tien_coc')
        }
        return sum + getNumericValue(item, field)
      }, 0),
    )

  const renderChiTietRow = (item, index, globalIndex) => {
    const tongTien = getNumericValue(item, 'tong_tien')
    const tienCoc = getNumericValue(item, 'tien_coc')
    const loaiPhong = item.danh_sach_loai_phong ?? ''
    return (
      <tr key={`chitiet-${globalIndex}`}>
        <td className="text-center">{globalIndex + 1}</td>
        <td>{formatDateTime(item.thoi_gian_tao)}</td>
        <td>{item.nguoi_tao ?? ''}</td>
        <td>{item.ma_booking ?? ''}</td>
        <td>{item.ten_nhom_khach_hang ?? ''}</td>
        <td>
          <div
            title={loaiPhong}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: '180px',
              cursor: loaiPhong.length > 0 ? 'help' : 'default',
            }}
          >
            {loaiPhong}
          </div>
        </td>
        <td>{formatDate(item.ngay_den)}</td>
        <td>{formatDate(item.ngay_di)}</td>
        <td className="text-end">{formatCurrency(item.gia_phong)}</td>
        <td className="text-end">{formatCurrency(item.tong_gia_phong)}</td>
        <td>{item.danh_sach_ghi_chu ?? ''}</td>
        <td className="text-end">{formatCurrency(item.tong_phu_thu_giuong)}</td>
        <td className="text-end">{formatCurrency(item.tong_phu_thu_an_sang)}</td>
        <td className="text-end">{formatCurrency(item.tong_phu_thu_tre_em)}</td>
        <td className="text-end">{formatCurrency(item.tong_phu_thu_nguoi_lon)}</td>
        <td className="text-end">{formatCurrency(item.tong_tien_dich_vu_minibar)}</td>
        <td className="text-end">{formatCurrency(item.tong_tien_dich_vu_giatui)}</td>
        <td className="text-end">{formatCurrency(item.tong_tien_dich_vu_khac)}</td>
        <td className="text-end">{formatCurrency(item.tong_tien_den_bu)}</td>
        <td className="text-end">{formatCurrency(item.tong_tien_hoi_nghi)}</td>
        <td className="text-end">{formatCurrency(item.tong_phu_thu_check_in_som)}</td>
        <td className="text-end">{formatCurrency(item.tong_phu_thu_check_out_tre)}</td>
        <td className="text-end">{formatCurrency(item.tong_tien_set_mon_an)}</td>
        <td className="text-end">{formatCurrency(tongTien)}</td>
        <td className="text-end">{formatCurrency(tienCoc)}</td>
        <td className="text-end">{formatCurrency(tongTien + tienCoc)}</td>
      </tr>
    )
  }

  const renderSubtotalRow = (nguoiTao, totals, key) => (
    <tr key={key} className="table-info fw-bold">
      <td colSpan={3} className="text-center">Tổng cộng: {nguoiTao}</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td className="text-end">{formatCurrency(totals[0])}</td>
      <td></td>
      {totals.slice(1).map((val, idx) => (
        <td key={`sub-${key}-${idx}`} className="text-end">{formatCurrency(val)}</td>
      ))}
    </tr>
  )

  const nguoiTaoOptions = [...new Set(chiTietData.map((item) => item.nguoi_tao ?? ''))].filter(Boolean)

  const renderChiTietKPI = () => {
    const filteredData = filterNguoiTao
      ? chiTietData.filter((item) => (item.nguoi_tao ?? '') === filterNguoiTao)
      : chiTietData

    // Build ordered group list from full filtered data
    const seenOrder = []
    const groupMap = {}
    filteredData.forEach((item) => {
      const key = item.nguoi_tao ?? ''
      if (!groupMap[key]) {
        groupMap[key] = []
        seenOrder.push(key)
      }
      groupMap[key].push(item)
    })

    // Assign cumulative start index per group for correct STT
    let cumIndex = 0
    const groupMeta = seenOrder.map((nguoiTao) => {
      const rows = groupMap[nguoiTao]
      const startIdx = cumIndex
      cumIndex += rows.length
      return { nguoiTao, rows, startIdx }
    })

    // Paginate by group: collect groups until row count >= PAGE_SIZE per page
    const pages = []
    let currentPage = []
    let currentCount = 0
    groupMeta.forEach((g) => {
      currentPage.push(g)
      currentCount += g.rows.length
      if (currentCount >= PAGE_SIZE) {
        pages.push(currentPage)
        currentPage = []
        currentCount = 0
      }
    })
    if (currentPage.length > 0) pages.push(currentPage)

    const totalPages = pages.length
    const safePage = Math.min(pageChiTiet, Math.max(totalPages, 1))
    const pageGroups = pages[safePage - 1] ?? []

    const groups = []
    pageGroups.forEach(({ nguoiTao, rows, startIdx }) => {
      rows.forEach((item, localIdx) => {
        groups.push(renderChiTietRow(item, localIdx, startIdx + localIdx))
      })
      const totals = calcGroupTotals(rows)
      groups.push(renderSubtotalRow(nguoiTao, totals, `sub-${nguoiTao}-${safePage}`))
    })

    const grandTotals = calcGroupTotals(filteredData)

    return (
      <>
        <div className="overflow-auto">
          <table
            className="table table-bordered table-sm table-striped align-middle mb-0"
            style={{ tableLayout: 'auto' }}
          >
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ minWidth: '50px' }}>STT</th>
                <th className="text-center" style={{ minWidth: '140px' }}>Thời gian tạo</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Người tạo</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Mã booking</th>
                <th className="text-center" style={{ minWidth: '140px' }}>Tên nhóm khách hàng</th>
                <th className="text-center" style={{ minWidth: '250px' }}>Loại phòng</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Ngày đến</th>
                <th className="text-center" style={{ minWidth: '110px' }}>Ngày đi</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Giá phòng</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Mức chiết khấu</th>
                <th className="text-center" style={{ minWidth: '150px' }}>Lí do chiết khấu</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng phụ thu giường</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng phụ thu ăn sáng</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng phụ thu trẻ em</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng phụ thu người lớn</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng tiền dịch vụ minibar</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng tiền dịch vụ giặt ủi</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng tiền dịch vụ khác</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng tiền đền bù</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng tiền hội nghị</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng phụ thu check in sớm</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng phụ thu check out trễ</th>
                <th className="text-center" style={{ minWidth: '100px' }}>Tổng tiền set món ăn</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tiền cọc</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Tổng tiền + Tiền cọc</th>
              </tr>
            </thead>
            <tbody>
              {groups}
              <tr className="table-warning fw-bold">
                <td className="text-center" colSpan={3}>Tổng cộng</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="text-end">{formatCurrency(grandTotals[0])}</td>
                <td></td>
                {grandTotals.slice(1).map((val, idx) => (
                  <td key={`grand-${idx}`} className="text-end">{formatCurrency(val)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {renderPagination(safePage, setPageChiTiet, filteredData.length, totalPages)}
      </>
    )
  }

  return (
    <div className="p-0 m-0 mt-2">
      <div>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

        <CCard className="mt-2 mb-2 w-full m-0">
          <CCardBody className="p-3">
            <CRow className="m-0 mb-2">
              <CCol md={2}>
                 <CFormLabel className="col-form-label labelcustome">Ngày bắt đầu</CFormLabel>
                <CDatePicker
                  locale="en-GB"
                  date={dateRange.startDate}
                  onDateChange={(date) => handleDateChange(date, 'startDate')}
                  className="w-full"
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel className="col-form-label labelcustome">Ngày kết thúc</CFormLabel>
                <CDatePicker
                  locale="en-GB"
                  date={dateRange.endDate}
                  onDateChange={(date) => handleDateChange(date, 'endDate')}
                  className="w-full"
                />
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
            {(allData.length > 0 || chiTietData.length > 0) && (
              <div>
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon icon={faTable} className="me-2 text-primary" />
                  <h5 className="mb-0 fw-bold">Kết quả thống kê</h5>
                </div>

                <CCard className="mb-4">
                  <CCardBody className="p-3">
                    <div className="text-center fw-bold mb-3 fs-6">
                      BÁO CÁO THỐNG KÊ DOANH THU TỔNG
                      <br />
                      <span className="fs-6">
                        Từ {format(dateRange.startDate, 'dd/MM/yyyy')} đến {format(dateRange.endDate, 'dd/MM/yyyy')}
                      </span>
                    </div>

                    <CNav variant="tabs" className="mb-3">
                      <CNavItem>
                        <CNavLink
                          active={activeTab === 1}
                          onClick={() => setActiveTab(1)}
                          style={{ cursor: 'pointer' }}
                        >
                          Tổng KPI
                        </CNavLink>
                      </CNavItem>
                      <CNavItem>
                        <CNavLink
                          active={activeTab === 2}
                          onClick={() => setActiveTab(2)}
                          style={{ cursor: 'pointer' }}
                        >
                          Chi tiết KPI
                        </CNavLink>
                      </CNavItem>
                    </CNav>

                    <CTabContent>
                      <CTabPane visible={activeTab === 1}>
                        {renderTongKPI()}
                      </CTabPane>
                        <CTabPane visible={activeTab === 2}>
                        {chiTietData.length > 0 && (
                          <div className="d-flex align-items-center gap-2 mb-3" style={{ maxWidth: '300px' }}>
                            <CFormLabel className="col-form-label labelcustome mb-0 text-nowrap">Người tạo:</CFormLabel>
                            <CFormSelect
                              value={filterNguoiTao}
                              onChange={(e) => setFilterNguoiTao(e.target.value)}
                            >
                              <option value="">Tất cả</option>
                              {nguoiTaoOptions.map((name) => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </CFormSelect>
                          </div>
                        )}
                        {renderChiTietKPI()}
                      </CTabPane>
                    </CTabContent>
                  </CCardBody>
                </CCard>
              </div>
            )}

            {hasSearched && allData.length === 0 && chiTietData.length === 0 && !loading && (
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
    </div>
  )
}

export default ThongKeDoanhSoKPINhanVien
