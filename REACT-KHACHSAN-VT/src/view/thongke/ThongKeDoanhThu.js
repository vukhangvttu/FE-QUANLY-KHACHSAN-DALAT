import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CWidgetStatsF,
  CSpinner,
  CFormSelect,
  CDatePicker,
  CButton,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CFormInput,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHotel,
  faUsers,
  faMoneyBillWave,
  faChartLine,
  faCalendarAlt,
  faDownload,
  faSackDollar,
  faFileLines,
} from '@fortawesome/free-solid-svg-icons'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  AllThongKeTheoNgay,
  getThongKeTheoKhoanThoiGian,
  exportExcel,
  getThongKeDoanThuTheoThang,
} from 'src/service/ThongKeService'
import { useNavigate } from 'react-router-dom'
import { getAllLoaiPhongBooKing } from 'src/service/LoaiPhongService'
import { ThongKeKhachLuuTru } from './ThongKeKhachLuuTru'
import { getAllNhomKhachHang } from 'src/service/NhomKhachHang'

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

const ThongKeDoanhThu = () => {
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  })
  const [selectedType, setSelectedType] = useState('all')
  const [thongKeHomNay, setThongKeHomNay] = useState({
    // doanhThu: 418146000,
    // soHoaDon: 11,
    // datPhongMoi: 10,
    // huyDatPhong: 0,
  })
  const [thongKeThang, setThongKeThang] = useState([])
  const [loaiPhong, setLoaiPhong] = useState([])
  const [nhomKhachHang, setNhomKhachHang] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const navigate = useNavigate()
  const fetchData = async () => {
    try {
      setLoading(true)

      // Chạy hai API song song
      const [thongKeHomNayData, thongKeDoanhThuThang, loaiPhong, nhomKhachHang] = await Promise.all(
        [
          AllThongKeTheoNgay('today', navigate),
          getThongKeDoanThuTheoThang(navigate),
          getAllLoaiPhongBooKing(navigate),
          getAllNhomKhachHang(navigate),
        ],
      )

      // Xử lý danh sách phiếu dịch vụ
      if (thongKeHomNayData) {
        setThongKeHomNay(thongKeHomNayData)
      } else {
        addToast(exampleToast('❌ Không thể tải thống kê. Vui lòng thử lại sau!'))
      }

      if (loaiPhong) {
        setLoaiPhong(loaiPhong)
      } else {
        addToast(exampleToast('❌ Không thể tải loại phòng. Vui lòng thử lại sau!'))
      }

      if (nhomKhachHang) setNhomKhachHang(nhomKhachHang)
      else {
        addToast(exampleToast('❌ Không thể tải nhóm khách hàng. Vui lòng thử lại sau!'))
      }

      if (thongKeDoanhThuThang) {
        console.log(thongKeDoanhThuThang)
        setThongKeThang(thongKeDoanhThuThang)
      } else {
        addToast(exampleToast('❌ Không thể tải danh sách thống kê tháng. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const [thongKeTheoKhoanTG, setThongKeTheoKhoanTG] = useState({})
  const fetchDataThonKeTheoThoiGian = async () => {
    const ngayDen = format(dateRange.startDate, 'yyyy-MM-dd')
    const ngayDi = format(dateRange.endDate, 'yyyy-MM-dd')

    console.log(ngayDen, ngayDi)

    try {
      setLoading(true)

      // Chạy hai API song song
      const [thongKeTheoKhoanTG] = await Promise.all([
        getThongKeTheoKhoanThoiGian(
          ngayDen,
          ngayDi,
          selectedNhomKhachHang,
          loaiNguonKhach,
          selectedType,
          navigate,
        ),
      ])

      // Xử lý danh sách phiếu dịch vụ
      if (thongKeTheoKhoanTG) {
        setThongKeTheoKhoanTG(thongKeTheoKhoanTG)
      } else {
        addToast(exampleToast('❌ Không thể tải thống kê. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const fetchDataThonKeTheoNgay = async (ngay, loai) => {
    try {
      // Chạy hai API song song
      const [thongKeTheoNgay] = await Promise.all([AllThongKeTheoNgay(ngay, navigate)])

      // Xử lý danh sách phiếu dịch vụ
      if (thongKeTheoNgay) {
        console.log(thongKeTheoNgay)
        if (loai === 1) {
          setThongKeHomNay((pre) => ({
            ...pre,
            tong_tien: thongKeTheoNgay.tong_tien,
            tong_so_hoa_don: thongKeTheoNgay.tong_so_hoa_don,
          }))
        } else {
          setThongKeHomNay((pre) => ({
            ...pre,
            tong_so_don_dat: thongKeTheoNgay.tong_so_don_dat,
            tong_huy_booking: thongKeTheoNgay.tong_huy_booking,
          }))
        }
      } else {
        addToast(exampleToast('❌ Không thể tải thống kê. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
    }
  }

  const [valueDTHomNay, setValueDTHomNay] = useState(0)

  const onChangeThongKeDoanhThuTheoNgay = (e) => {
    console.log(e.target.value)
    const value = e.target.value

    setValueDTHomNay(value)

    fetchDataThonKeTheoNgay(value, 1)
  }

  const [valueDPHomNay, setValueDPHomNay] = useState(0)

  const onChangeThongKeDatPhongTheoNgay = (e) => {
    console.log(e.target.value)
    const value = e.target.value

    setValueDPHomNay(value)

    fetchDataThonKeTheoNgay(value, 2)
  }

  // Dữ liệu mẫu cho biểu đồ
  const rawData = [
    { thang: 'T1', tong_doanh_thu: 0 },
    { thang: 'T2', tong_doanh_thu: 0 },
    { thang: 'T3', tong_doanh_thu: 0 },
    { thang: 'T4', tong_doanh_thu: 0 },
    { thang: 'T5', tong_doanh_thu: 0 },
    { thang: 'T6', tong_doanh_thu: 0 },
    { thang: 'T7', tong_doanh_thu: 0 },
    { thang: 'T8', tong_doanh_thu: 0 },
    { thang: 'T9', tong_doanh_thu: 0 },
    { thang: 'T10', tong_doanh_thu: 0 },
    { thang: 'T11', tong_doanh_thu: 0 },
    { thang: 'T12', tong_doanh_thu: 0 },
  ]

  // Tạo labels và data từ rawData
  const labels = rawData.map((item) => item.thang)
  const data = thongKeThang.map((item) => item.tong_doanh_thu)

  // Dữ liệu cho biểu đồ
  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Doanh thu theo tháng',
        data: data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }
  const barChartData = {
    labels: ['Phòng đơn', 'Phòng đôi', 'Phòng VIP', 'Phòng Suite', 'Phòng Family'],
    datasets: [
      {
        label: 'Số lượt đặt phòng',
        data: [65, 59, 80, 81, 56],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const pieChartData = {
    labels: ['Khách nội địa', 'Khách quốc tế', 'Khách doanh nghiệp', 'Khách đoàn'],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Dữ liệu mẫu cho bảng thống kê
  const tableData = [
    {
      maPhong: 'P101',
      loaiPhong: 'Phòng đơn',
      doanhThu: '15,000,000',
      soLanDat: 25,
      tyLe: '85%',
    },
    {
      maPhong: 'P102',
      loaiPhong: 'Phòng đôi',
      doanhThu: '25,000,000',
      soLanDat: 30,
      tyLe: '90%',
    },
    {
      maPhong: 'P103',
      loaiPhong: 'Phòng VIP',
      doanhThu: '35,000,000',
      soLanDat: 20,
      tyLe: '75%',
    },
    {
      maPhong: 'P104',
      loaiPhong: 'Phòng Suite',
      doanhThu: '45,000,000',
      soLanDat: 15,
      tyLe: '70%',
    },
    {
      maPhong: 'P105',
      loaiPhong: 'Phòng Family',
      doanhThu: '55,000,000',
      soLanDat: 10,
      tyLe: '65%',
    },
  ]

  const handleDateChange = (date, type) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: date,
    }))
  }

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value)
  }

  const [selectedNhomKhachHang, setSelectedNhomKhachHang] = useState('0')

  const handleNhomKhachHangChange = (e) => {
    setSelectedNhomKhachHang(e.target.value)
  }

  const [loaiNguonKhach, setLoaiNguonKhach] = useState('')
  const onInputChage = (e) => {
    const value = e.target.value.toUpperCase()
    setLoaiNguonKhach(value)
  }

  const [loadexcel, setLoadExcel] = useState(false)
  const handleExport = async () => {
    try {
      setLoadExcel(true)
      const blob = await exportExcel(
        dateRange.startDate,
        dateRange.endDate,
        selectedType,
        selectedNhomKhachHang,
        loaiNguonKhach,
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

      const fileName = `ThongKeDoanhThu${yyyy}${MM}${dd}${HH}${mm}${ss}.xlsx`

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
        {/* Thống kê hôm nay */}
        <CRow className=" mx-0">
          <CCol md={6} className="ps-0 pe-1">
            <CCard className="h-100  m-0">
              <CCardBody className=" p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 w-full">
                  <h4 className="m-0 font-bold">DOANH THU HÔM NAY</h4>
                  <select
                    id="cars"
                    name="cars"
                    className="bg-transparent outline-none font-semibold text-blue-500"
                    value={valueDTHomNay}
                    onChange={onChangeThongKeDoanhThuTheoNgay}
                  >
                    <option value="today">Hôm nay</option>
                    <option value="yesterday">Hôm qua</option>
                    <option value="last_7_days">7 ngày qua</option>
                  </select>
                </div>
                <div className="d-flex justify-content-start gap-5 ">
                  <div>
                    <div className="text-primary fw-bold fs-4 w-52">
                      <FontAwesomeIcon icon={faSackDollar} className="me-2" />
                      {thongKeHomNay?.tong_tien?.toLocaleString('vi-VN')}
                    </div>
                    <div className="text-medium-emphasis">Tổng</div>
                  </div>
                  <div>
                    <div className="text-primary fw-bold fs-4">
                      <FontAwesomeIcon icon={faFileLines} className="text-orange-500 me-2" />
                      {thongKeHomNay?.tong_so_hoa_don}
                    </div>
                    <div className="text-medium-emphasis">Hóa đơn</div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={6} className="ps-1 pe-0">
            <CCard className="h-100 w-full m-0">
              <CCardBody className="w-full p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 w-full">
                  <h4 className="m-0 font-bold">ĐẶT PHÒNG HÔM NAY</h4>
                  <select
                    id="cars"
                    name="cars"
                    className="bg-transparent outline-none font-semibold text-blue-500"
                    value={valueDPHomNay}
                    onChange={onChangeThongKeDatPhongTheoNgay}
                  >
                    <option value="today">Hôm nay</option>
                    <option value="yesterday">Hôm qua</option>
                    <option value="last_7_days">7 ngày qua</option>
                  </select>
                </div>
                <div className="d-flex justify-content-start gap-5 w-full">
                  <div>
                    <div className="text-primary fw-bold fs-4">
                      {thongKeHomNay?.tong_so_don_dat}
                    </div>
                    <div className="text-medium-emphasis">Đặt phòng mới</div>
                  </div>
                  <div>
                    <div className="text-primary fw-bold fs-4">
                      {thongKeHomNay?.tong_huy_booking}
                    </div>
                    <div className="text-medium-emphasis">Đặt phòng hủy</div>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Bộ lọc */}
        <CCard className="mt-2 mb-2 w-full m-0">
          <CCardBody className="p-3">
            <CRow className="m-0 mb-2">
              <CCol md={3} className="ps-0">
                <CFormSelect value={selectedType} onChange={handleTypeChange} className="w-full">
                  <option value="all">Tất cả loại phòng</option>
                  {loaiPhong.map((item) => (
                    <option key={item.maLoaiPhong} value={item.maLoaiPhong}>
                      {item.tenLoaiPhong}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2} className="ps-0">
                <CFormSelect
                  value={selectedNhomKhachHang}
                  onChange={handleNhomKhachHangChange}
                  className="w-full"
                >
                  <option value="0">Loại nguồn khách</option>
                  {nhomKhachHang.map((item) => (
                    <option key={item.maNhomKhachHang} value={item.maNhomKhachHang}>
                      {item.tenNhomKhachHang}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3} className="ps-0">
                <CFormInput
                  type="text"
                  value={loaiNguonKhach}
                  placeholder="Nhập tên nguồn khách"
                  onChange={onInputChage}
                />
              </CCol>
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
            </CRow>
            <CRow className="d-grid gap-2 d-md-flex justify-content-md-end">
              <CCol md={3} className="pe-0 ">
                <CButton color="primary" className="me-2" onClick={fetchDataThonKeTheoThoiGian}>
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />
                  Lọc dữ liệu
                </CButton>
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

        {/* Thống kê tổng quan */}
        <CRow className="mb-4">
          <CCol sm={6} lg={3}>
            <CWidgetStatsF
              className="mb-3"
              color="primary"
              icon={<FontAwesomeIcon icon={faHotel} />}
              title="Tổng số phòng"
              value={thongKeTheoKhoanTG.tongsophongdat}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsF
              className="mb-3"
              color="info"
              icon={<FontAwesomeIcon icon={faUsers} />}
              title="Tổng khách hàng"
              value={thongKeTheoKhoanTG.tongsokh}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsF
              className="mb-3"
              color="warning"
              icon={<FontAwesomeIcon icon={faCalendarAlt} />}
              title="Tổng đơn đặt"
              value={thongKeTheoKhoanTG.tongsohd}
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsF
              className="mb-3"
              color="success"
              icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
              title="Tổng doanh thu"
              value={thongKeTheoKhoanTG.tongdoanhthu?.toLocaleString('vi-VN')}
            />
          </CCol>
        </CRow>

        {/* Biểu đồ */}
        <CRow className="mb-4">
          <CCol md={8}>
            <CCard>
              <CCardBody>
                <h5 className="card-title mb-4">Doanh thu theo tháng</h5>
                <Line data={lineChartData} />
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard>
              <CCardBody>
                <h5 className="card-title mb-4">Phân bố khách hàng</h5>
                <Pie data={pieChartData} />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <CRow className="mb-4">
          <CCol md={12}>
            <CCard>
              <CCardBody>
                <h5 className="card-title mb-4">Khách lưu trú</h5>
                <ThongKeKhachLuuTru />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        {/* <CRow className="mb-4">
          <CCol md={12}>
            <CCard>
              <CCardBody>
                <h5 className="card-title mb-4">Số lượt đặt phòng theo loại</h5>
                <Bar data={barChartData} />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow> */}

        {/* Bảng thống kê chi tiết */}
        {/* <CCard>
          <CCardBody>
            <h5 className="card-title mb-4">Thống kê chi tiết theo phòng</h5>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Mã phòng</CTableHeaderCell>
                  <CTableHeaderCell>Loại phòng</CTableHeaderCell>
                  <CTableHeaderCell>Doanh thu</CTableHeaderCell>
                  <CTableHeaderCell>Số lần đặt</CTableHeaderCell>
                  <CTableHeaderCell>Tỷ lệ sử dụng</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {tableData.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{item.maPhong}</CTableDataCell>
                    <CTableDataCell>{item.loaiPhong}</CTableDataCell>
                    <CTableDataCell>{item.doanhThu}</CTableDataCell>
                    <CTableDataCell>{item.soLanDat}</CTableDataCell>
                    <CTableDataCell>{item.tyLe}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard> */}
      </div>
    </div>
  )
}

export default ThongKeDoanhThu
