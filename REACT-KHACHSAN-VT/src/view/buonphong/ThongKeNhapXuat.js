import React, { useState, useRef, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExcel, faSearch, faSync } from '@fortawesome/free-solid-svg-icons'
import axiosInstance from 'src/service/axiosConfig'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

const ThongKeNhapXuat = () => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [ngayBatDau, setNgayBatDau] = useState(today)
  const [ngayKetThuc, setNgayKetThuc] = useState(today)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
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
        <small>Vừa xong</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  const loadThongKe = async () => {
    if (!ngayBatDau || !ngayKetThuc) {
      addToast(exampleToast('⚠️ Vui lòng chọn ngày bắt đầu và ngày kết thúc'))
      return
    }

    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/phieu-nhap-hang/thong-ke-nhap-xuat', {
        params: { ngayBatDau, ngayKetThuc },
      })

      if (response.data && response.data.code === 200) {
        setData(response.data.result || [])
        if (response.data.result?.length === 0) {
          addToast(exampleToast('⚠️ Không có dữ liệu trong khoảng thời gian này'))
        }
      } else {
        setData([])
        addToast(exampleToast('⚠️ Không có dữ liệu thống kê'))
      }
    } catch (error) {
      console.error('Lỗi load thống kê nhập xuất:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu thống kê'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadThongKe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTongNhap = () => data.reduce((sum, item) => sum + (item.so_luong_da_nhap || 0), 0)
  const getTongXuat = () => data.reduce((sum, item) => sum + (item.so_luong_da_xuat || 0), 0)

  const exportToExcel = () => {
    if (data.length === 0) {
      addToast(exampleToast('⚠️ Không có dữ liệu để xuất'))
      return
    }

    const ngayThongKe = data[0]?.ngay_thong_ke || `${ngayBatDau} - ${ngayKetThuc}`

    const excelData = data.map((item, index) => ({
      STT: index + 1,
      'Tên hàng hóa': item.ten_hang_hoa || '',
      'Đơn vị tính': item.don_vi_tinh || '',
      'SL đã nhập': item.so_luong_da_nhap || 0,
      'SL đã xuất': item.so_luong_da_xuat || 0,
      'Phòng 2 khách': item.tong_phong_2_khach || 0,
      'Phòng 3 khách': item.tong_phong_3_khach || 0,
      'Phòng 4 khách': item.tong_phong_4_khach || 0,
    }))

    excelData.push({
      STT: '',
      'Tên hàng hóa': 'TỔNG CỘNG',
      'Đơn vị tính': '',
      'SL đã nhập': getTongNhap(),
      'SL đã xuất': getTongXuat(),
      'Phòng 2 khách': data.reduce((s, i) => s + (i.tong_phong_2_khach || 0), 0),
      'Phòng 3 khách': data.reduce((s, i) => s + (i.tong_phong_3_khach || 0), 0),
      'Phòng 4 khách': data.reduce((s, i) => s + (i.tong_phong_4_khach || 0), 0),
    })

    const ws = XLSX.utils.json_to_sheet(excelData)

    const colWidths = [
      { wch: 5 },
      { wch: 25 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
    ]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Thống kê nhập xuất')
    XLSX.writeFile(wb, `ThongKe_NhapXuat_${ngayBatDau}_${ngayKetThuc}.xlsx`)

    addToast(exampleToast(`✔️ Đã xuất Excel - ${ngayThongKe}`))
  }

  return (
    <>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

      <CCard>
        <CCardBody>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0">Thống kê nhập - xuất hàng hóa</h5>
              <div className="d-flex gap-2">
                <CButton
                  color="success"
                  variant="outline"
                  onClick={exportToExcel}
                  disabled={data.length === 0}
                >
                  <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                  Xuất Excel
                </CButton>
                <CButton
                  color="primary"
                  variant="outline"
                  onClick={loadThongKe}
                  disabled={isLoading}
                >
                  <FontAwesomeIcon icon={faSync} className={`me-2 ${isLoading ? 'fa-spin' : ''}`} />
                  Làm mới
                </CButton>
              </div>
            </div>
          </div>

          <CRow className="mb-3 align-items-end">
            <CCol xs={12} sm={4} md={3}>
              <CFormLabel className="mb-1 fw-semibold">Từ ngày</CFormLabel>
              <CFormInput
                type="date"
                value={ngayBatDau}
                onChange={(e) => setNgayBatDau(e.target.value)}
              />
            </CCol>
            <CCol xs={12} sm={4} md={3}>
              <CFormLabel className="mb-1 fw-semibold">Đến ngày</CFormLabel>
              <CFormInput
                type="date"
                value={ngayKetThuc}
                onChange={(e) => setNgayKetThuc(e.target.value)}
              />
            </CCol>
            <CCol xs={12} sm={4} md={3}>
              <CButton color="primary" onClick={loadThongKe} disabled={isLoading} className="w-100">
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                Tìm kiếm
              </CButton>
            </CCol>
          </CRow>

          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>STT</th>
                  <th>Tên hàng hóa</th>
                  <th className="text-center" style={{ width: '100px' }}>ĐVT</th>
                  <th className="text-center" style={{ width: '120px' }}>SL đã nhập</th>
                  <th className="text-center" style={{ width: '120px' }}>SL đã xuất</th>
                  <th className="text-center" style={{ width: '120px' }}>Phòng 2 khách</th>
                  <th className="text-center" style={{ width: '120px' }}>Phòng 3 khách</th>
                  <th className="text-center" style={{ width: '120px' }}>Phòng 4 khách</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <CSpinner color="primary" />
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  <>
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">{item.stt || index + 1}</td>
                        <td>{item.ten_hang_hoa || '-'}</td>
                        <td className="text-center">{item.don_vi_tinh || '-'}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${item.so_luong_da_nhap > 0 ? 'bg-info text-dark' : 'bg-secondary'}`}
                          >
                            {item.so_luong_da_nhap ?? 0}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${item.so_luong_da_xuat > 0 ? 'bg-warning text-dark' : 'bg-secondary'}`}
                          >
                            {item.so_luong_da_xuat ?? 0}
                          </span>
                        </td>
                        <td className="text-center">{item.tong_phong_2_khach ?? 0}</td>
                        <td className="text-center">{item.tong_phong_3_khach ?? 0}</td>
                        <td className="text-center">{item.tong_phong_4_khach ?? 0}</td>
                      </tr>
                    ))}
                    <tr className="table-dark fw-bold">
                      <td colSpan="3" className="text-center">
                        TỔNG CỘNG
                      </td>
                      <td className="text-center">{getTongNhap()}</td>
                      <td className="text-center">{getTongXuat()}</td>
                      <td className="text-center">
                        {data.reduce((s, i) => s + (i.tong_phong_2_khach || 0), 0)}
                      </td>
                      <td className="text-center">
                        {data.reduce((s, i) => s + (i.tong_phong_3_khach || 0), 0)}
                      </td>
                      <td className="text-center">
                        {data.reduce((s, i) => s + (i.tong_phong_4_khach || 0), 0)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      Không có dữ liệu thống kê
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.length > 0 && (
            <div className="mt-2 d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Kỳ thống kê: {data[0]?.ngay_thong_ke || `${ngayBatDau} - ${ngayKetThuc}`}
              </small>
              <small className="text-muted">Tổng: {data.length} mặt hàng</small>
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default ThongKeNhapXuat
