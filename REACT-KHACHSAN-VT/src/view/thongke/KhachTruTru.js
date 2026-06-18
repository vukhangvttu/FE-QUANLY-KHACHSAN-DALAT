import React, { useState, useEffect, useRef } from 'react'
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
import { faDownload, faRotate } from '@fortawesome/free-solid-svg-icons'
import { exportExcelKhachLuuTruKhoanThoiGian } from 'src/service/ThongKeService'
import { getKhachLuuTruTrongKhoanThoiGian } from 'src/service/KhacHangPhongService'
import PropTypes from 'prop-types'
import { format } from 'date-fns'
const KhachTruTru = ({ isActive }) => {
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
      const response = await exportExcelKhachLuuTruKhoanThoiGian(
        dateRange.startDate,
        dateRange.endDate,
      )

      // Kiểm tra response có phải là Blob không
      if (!(response instanceof Blob)) {
        throw new Error('Dữ liệu trả về không phải là định dạng Blob')
      }

      // Kiểm tra kích thước của blob
      if (response.size === 0) {
        throw new Error('File Excel trống')
      }

      // Tạo URL cho blob
      const url = window.URL.createObjectURL(
        new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
      )

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

      const fileName = `ThongTinLuuTruKhoanThoiGian${yyyy}${MM}${dd}${HH}${mm}${ss}.xlsx`

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
      addToast(exampleToast(`❌ Lỗi khi xuất báo cáo: ${error.message}`))
    } finally {
      setLoadExcel(false)
    }
  }

  const columns = [
    {
      key: 'stt',
      label: 'STT',
      filter: false,
      _style: { width: '10%' },
    },
    {
      key: 'ten_khach_hang',
      label: 'Tên khách hàng',
      _style: { width: '20%' },
    },
    {
      key: 'ngay_sinh',
      label: 'Ngày sinh',
      filter: false,
    },
    {
      key: 'gioi_tinh',
      label: 'Giới tính',
      filter: false,
      sorter: false,
    },
    {
      key: 'ma_loai_giay_to',
      label: 'Loại giấy tờ',
      filter: false,
      sorter: false,
    },
    {
      key: 'so_giay_to',
      label: 'Số giấy tờ',

      sorter: false,
    },
    {
      key: 'dia_chi',
      label: 'Địa chỉ',
      filter: false,
      sorter: false,
    },
  ]

  const [loading, setLoading] = useState(false)
  const [thongTinLuuTru, setThongTinLuuTru] = useState([])

  const fetchData = async (startDate, endDate) => {
    try {
      setLoading(true)

      const response = await getKhachLuuTruTrongKhoanThoiGian(startDate, endDate)
      if (response) {
        console.log('response', response)
        setThongTinLuuTru(response)
      } else {
        addToast(exampleToast('Không thể tải thông tin lưu trú. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isActive) {
      fetchData(dateRange.startDate, dateRange.endDate)
    }
  }, [])

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
      <CCard className="mt-2 mb-2 w-full m-0">
        <CCardBody className="p-3">
          <CRow className="m-0">
            <CCol md={3}>
              <CFormLabel htmlFor="inputPassword" className="col-sm-6 col-form-label labelcustome">
                Ngày đến
              </CFormLabel>
              <CCol sm={8}>
                <CDatePicker
                  locale="en-GB"
                  date={dateRange.startDate}
                  onDateChange={(date) => handleDateChange(date, 'startDate')}
                  className="w-full"
                />
              </CCol>
            </CCol>
            <CCol md={3}>
              <CFormLabel htmlFor="inputPassword" className="col-sm-6 col-form-label labelcustome">
                Ngày đi
              </CFormLabel>
              <CCol sm={8}>
                <CDatePicker
                  locale="en-GB"
                  date={dateRange.endDate}
                  onDateChange={(date) => handleDateChange(date, 'endDate')}
                  className="w-full"
                />
              </CCol>
            </CCol>
            <CCol md={4} className="pe-0 position-relative">
              <div className="position-absolute bottom-0">
                {loading ? (
                  <CButton color="primary" disabled className="me-2">
                    <CSpinner as="span" size="sm" aria-hidden="true" />
                    Đang xử lý...
                  </CButton>
                ) : (
                  <CButton
                    color="primary"
                    className="text-white me-2"
                    onClick={() => fetchData(dateRange.startDate, dateRange.endDate)}
                  >
                    <FontAwesomeIcon icon={faRotate} className="me-2" />
                    Xem thông tin
                  </CButton>
                )}
                {loadexcel ? (
                  <CButton color="success" disabled>
                    <CSpinner as="span" size="sm" aria-hidden="true" />
                    Đang xử lý...
                  </CButton>
                ) : (
                  <CButton color="success" className="text-white" onClick={handleExport}>
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Xuất ASM
                  </CButton>
                )}
              </div>
            </CCol>
          </CRow>
          <div className="w-full">
            <CSmartTable
              columns={columns}
              columnFilter
              columnSorter
              items={thongTinLuuTru}
              itemsPerPageSelect
              itemsPerPage={10}
              pagination
              scopedColumns={{
                ngay_sinh: (item) => {
                  return item.ngay_sinh ? (
                    <td>{format(new Date(item.ngay_sinh), 'dd/MM/yyyy')}</td>
                  ) : (
                    <td></td>
                  )
                },
              }}
              tableBodyProps={{
                className: 'align-middle',
              }}
              noItemsLabel={<div className="text-center py-5">Không có dữ liệu</div>}
            />
          </div>
        </CCardBody>
      </CCard>
    </div>
  )
}
KhachTruTru.propTypes = {
  isActive: PropTypes.bool.isRequired,
}
export default KhachTruTru
