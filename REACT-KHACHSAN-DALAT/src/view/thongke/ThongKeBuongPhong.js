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
  CFormLabel,
  CSmartTable,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faFileExcel } from '@fortawesome/free-solid-svg-icons'
import { format, parseISO } from 'date-fns'
import { getThongKeBuongPhong, exportExcelThongKeBuongPhong } from 'src/service/ThongKeService'

const ThongKeBuongPhong = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  })

  const [loading, setLoading] = useState(false)
  const [loadexcel, setLoadExcel] = useState(false)
  const [danhSachThongKe, setDanhSachThongKe] = useState([])

  const handleDateChange = (date, type) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: date,
    }))
  }

  const handleTimKiem = async () => {
    try {
      setLoading(true)

      const ngayBatDau = format(dateRange.startDate, 'yyyy-MM-dd')
      const ngayKetThuc = format(dateRange.endDate, 'yyyy-MM-dd')

      // Kiểm tra ngày bắt đầu không được lớn hơn ngày kết thúc
      if (dateRange.startDate > dateRange.endDate) {
        addToast(exampleToast('⚠️ Ngày bắt đầu không được lớn hơn ngày kết thúc!'))
        setLoading(false)
        return
      }

      // Gọi API thống kê buồng phòng
      const response = await getThongKeBuongPhong(ngayBatDau, ngayKetThuc)
      if (response && Array.isArray(response) && response.length > 0) {
        setDanhSachThongKe(response)
        addToast(exampleToast('✔ Tìm kiếm thành công!'))
      } else {
        setDanhSachThongKe([])
        addToast(exampleToast('⚠️ Không tìm thấy dữ liệu trong khoảng thời gian này!'))
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error)
      addToast(exampleToast('❌ Lỗi khi tìm kiếm dữ liệu. Vui lòng thử lại!'))
    } finally {
      setLoading(false)
    }
  }

  const handleXuatExcel = async () => {
    try {
      setLoadExcel(true)

      const ngayBatDau = format(dateRange.startDate, 'yyyy-MM-dd')
      const ngayKetThuc = format(dateRange.endDate, 'yyyy-MM-dd')

      // Kiểm tra ngày bắt đầu không được lớn hơn ngày kết thúc
      if (dateRange.startDate > dateRange.endDate) {
        addToast(exampleToast('⚠️ Ngày bắt đầu không được lớn hơn ngày kết thúc!'))
        setLoadExcel(false)
        return
      }

      // Gọi API xuất excel
      const blob = await exportExcelThongKeBuongPhong(ngayBatDau, ngayKetThuc)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ThongKeBuongPhong_${ngayBatDau}_${ngayKetThuc}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      addToast(exampleToast('✔ Xuất Excel thành công!'))
    } catch (error) {
      console.error('Lỗi khi xuất excel:', error)
      addToast(exampleToast('❌ Lỗi khi xuất Excel. Vui lòng thử lại!'))
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

  // Định nghĩa columns cho bảng
  const columns = [
    {
      key: 'stt',
      label: 'STT',
      filter: false,
      _style: { width: '10%' },
    },
    {
      key: 'thoi_gian_tao',
      label: 'Thời gian tạo',
      _style: { width: '10%' },
    },
    {
      key: 'nguoi_tao',
      label: 'Người tạo',
      _style: { width: '15%' },
    },
    {
      key: 'ma_booking',
      label: 'Mã booking',
      _style: { width: '15%' },
    },
    {
      key: 'ma_phong',
      label: 'Mã phòng',
      _style: { width: '12%' },
    },
    {
      key: 'ten_loai_phong',
      label: 'Tên loại phòng',
      _style: { width: '12%' },
    },
    {
      key: 'ngay_den',
      label: 'Ngày đến',
      _style: { width: '12%' },
    },
    {
      key: 'ngay_di',
      label: 'Ngày đi',
      _style: { width: '12%' },
    },
  ]

  return (
    <div>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

      <CCard className="mt-2 mb-4 w-full">
        <CCardBody className="p-4">
          <CRow className="mb-3">
            <CCol md={12}>
              <h4 className="mb-4 fw-bold">Thống kê buồng phòng</h4>
            </CCol>
          </CRow>

          <CRow className="mb-3 align-items-end">
            <CCol md={4}>
              <CFormLabel htmlFor="ngayBatDau" className="fw-semibold mb-2">
                Ngày bắt đầu
              </CFormLabel>
              <CDatePicker
                locale="en-GB"
                date={dateRange.startDate}
                onDateChange={(date) => handleDateChange(date, 'startDate')}
                className="w-100"
              />
            </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="ngayKetThuc" className="fw-semibold mb-2">
                Ngày kết thúc
              </CFormLabel>
              <CDatePicker
                locale="en-GB"
                date={dateRange.endDate}
                onDateChange={(date) => handleDateChange(date, 'endDate')}
                className="w-100"
                minDate={dateRange.startDate}
              />
            </CCol>

            <CCol md={4} className="d-flex gap-2 justify-content-end">
              {loading ? (
                <CButton color="primary" disabled className="text-white">
                  <CSpinner as="span" size="sm" aria-hidden="true" className="me-2" />
                  Đang tìm kiếm...
                </CButton>
              ) : (
                <CButton color="primary" className="text-white" onClick={handleTimKiem}>
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Tìm kiếm
                </CButton>
              )}

              {loadexcel ? (
                <CButton color="success" disabled className="text-white">
                  <CSpinner as="span" size="sm" aria-hidden="true" className="me-2" />
                  Đang xuất...
                </CButton>
              ) : (
                <CButton color="success" className="text-white" onClick={handleXuatExcel}>
                  <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                  Xuất Excel
                </CButton>
              )}
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Bảng hiển thị kết quả */}
      {danhSachThongKe.length > 0 && (
        <CCard className="mb-4">
          <CCardBody className="p-4">
            <h5 className="mb-3 fw-bold">Kết quả thống kê</h5>
            <CSmartTable
              activePage={1}
              clickableRows
              columns={columns}
              items={danhSachThongKe}
              itemsPerPageSelect
              itemsPerPage={20}
              pagination
              columnFilter
              columnSorter
              scopedColumns={{
                stt: (item, index, columnVisible) => <td>{index + 1}</td>,
                thoi_gian_tao: (item) => (
                  <td>
                    {item.thoi_gian_tao
                      ? format(parseISO(item.thoi_gian_tao), 'dd/MM/yyyy HH:mm')
                      : ''}
                  </td>
                ),
                ngay_den: (item) => (
                  <td>{item.ngay_den ? format(parseISO(item.ngay_den), 'dd/MM/yyyy') : ''}</td>
                ),
                ngay_di: (item) => (
                  <td>{item.ngay_di ? format(parseISO(item.ngay_di), 'dd/MM/yyyy') : ''}</td>
                ),
              }}
              tableProps={{
                className: 'add-this-custom-class',
                responsive: true,
                striped: true,
                hover: true,
              }}
              tableBodyProps={{
                className: 'align-middle',
              }}
              noItemsLabel={
                <div className="text-center py-5">
                  <p className="text-muted">Không có dữ liệu thống kê</p>
                </div>
              }
            />
          </CCardBody>
        </CCard>
      )}

      {/* Hiển thị khi chưa có dữ liệu */}
      {danhSachThongKe.length === 0 && !loading && (
        <CCard>
          <CCardBody className="p-5 text-center">
            <FontAwesomeIcon icon={faFileExcel} size="3x" className="text-muted mb-3" />
            <h5 className="text-muted">Chưa có dữ liệu thống kê</h5>
            <p className="text-muted">
              Vui lòng chọn khoảng thời gian và nhấn &quot;Tìm kiếm&quot; để xem thống kê
            </p>
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default ThongKeBuongPhong
