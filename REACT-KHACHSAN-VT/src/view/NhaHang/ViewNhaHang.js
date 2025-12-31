import React, { useEffect, useRef, useState } from 'react'

import {
  CBadge,
  CFormCheck,
  CRow,
  CSmartTable,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CFormLabel,
  CFormTextarea,
  CSpinner,
} from '@coreui/react-pro'

import { CChart } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { getDanhSachPhongAnSang, getThongKeAnSang } from 'src/service/ThongKeService'
import { useNavigate } from 'react-router-dom'
import { it } from 'date-fns/locale'
import CapNhatAnSang from '../modal/CapNhatAnSang'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faPlus, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import config from 'src/service/Config'
import axios from 'axios'

import CurrencyInput from 'react-currency-input-field'
import LichSuThanhToan from './LichSuThanhToan'
import HangHoaModal from './HangHoaModal'

const ViewNhaHang = ({ isActive, refreshTrigger }) => {
  const [stats, setStats] = useState({})
  const [activeTab, setActiveTab] = useState('anSang')
  const [loading, setLoading] = useState(false)
  const [thongKeAnSang, setThongKeAnSang] = useState([])
  const [danhSachPhongAnSang, setDanhSachPhongAnSang] = useState([])
  const [visibleAnSang, setVisibleAnSang] = useState(false)
  const [object, setObject] = useState({})
  const [isChecked, setIsChecked] = useState(false)
  const [toast, addToast] = useState(0)
  const [danhSachDichVu, setDanhSachDichVu] = useState([])
  const [visibleDichVu, setVisibleDichVu] = useState(false)
  const [giamGia, setGiamGia] = useState(0)
  const [ghiChu, setGhiChu] = useState('')
  const [selectedOption, setSelectedOption] = useState('1')
  const [loadSubmit, setLoadSubmit] = useState(false)

  const toaster = useRef()

  const [chartData, setChartData] = useState({
    labels: ['Đã ăn sáng', 'Chưa ăn sáng'],
    datasets: [
      {
        backgroundColor: ['#41B883', '#E46651'],
        data: [0, 0],
      },
    ],
  })

  const options = {
    plugins: {
      legend: {
        labels: {
          color: getStyle('--cui-body-color'),
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || ''
            const value = context.raw || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ${percentage}% (${value})`
          },
        },
      },
    },
  }

  const columns = [
    {
      key: 'Check_All',
      label: 'ALL',
      filter: false,
      sorter: false,
    },
    {
      key: 'stt',
      label: 'STT',
      filter: false,
      _style: { width: '10%' },
    },
    {
      key: 'ma_phong',
      label: 'PHÒNG',
      _style: { width: '12%' },
    },
    {
      key: 'ten_khach_hang_dai_dien',
      label: 'TÊN KHÁCH',
      _style: { width: '38%' },
    },
    {
      key: 'so_nguoi_lon',
      label: 'LỚN',
      filter: false,
      sorter: false,
    },
    {
      key: 'so_tre_em',
      label: 'TRẺ',
      filter: false,
      sorter: false,
    },

    {
      key: 'da_an_sang',
      label: 'TT',
      filter: false,
    },
    {
      key: 'da_tra_phong',
      label: 'TRẢ',
      filter: false,
    },
    {
      key: 'chi_tiet',
      label: '',
      filter: false,
      sorter: false,
    },
  ]

  const navigate = useNavigate()
  const fetchData = async () => {
    try {
      setLoading(true)

      // Chạy hai API song song
      const [thongKeAnSang, danhSachPhongAnSang] = await Promise.all([
        getThongKeAnSang(navigate),
        getDanhSachPhongAnSang(navigate),
      ])

      // Xử lý danh sách chi tiết booking
      if (thongKeAnSang) {
        console.log('thong ke', thongKeAnSang)
        setThongKeAnSang(thongKeAnSang)

        // Sử dụng reduce để tính tổng
        const summary = thongKeAnSang.reduce(
          (acc, item) => {
            // Thêm phòng vào Set (Set tự động loại bỏ trùng lặp)
            acc.uniqueRooms.add(item.ma_phong)

            // Thêm khách vào Set (tránh trùng lặp)
            acc.totalSoKhach += item.tong_so_khach

            // Cộng tổng số người đã ăn sáng
            acc.totalDaAnSang += item.da_an_sang

            // Cộng tổng số người chưa ăn sáng (bao gồm cả khong_co_thong_tin)
            acc.totalChuaAnSang += item.chua_an_sang

            return acc
          },
          {
            uniqueRooms: new Set(),
            totalSoKhach: 0,
            totalDaAnSang: 0,
            totalChuaAnSang: 0,
          },
        )

        // Kết quả tính toán
        const totalRooms = summary.uniqueRooms.size // Tổng số phòng không trùng lặp
        const totalGuests = summary.totalSoKhach // Tổng số khách không trùng lặp
        const totalDaAnSang = summary.totalDaAnSang // Tổng số đã ăn sáng
        const totalChuaAnSang = summary.totalChuaAnSang // Tổng số chưa ăn sáng
        setStats({
          totalRooms: totalRooms,
          totalGuests: totalGuests,
          totalDaAnSang: totalDaAnSang,
          totalChuaAnSang: totalChuaAnSang,
        })

        setChartData((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: [totalDaAnSang, totalChuaAnSang], // cập nhật số liệu mới
            },
          ],
        }))
      } else {
        addToast(exampleToast('❌ Không thể tải thống kê. Vui lòng thử lại sau!'))
      }

      if (danhSachPhongAnSang) {
        console.log('danh sách phòng', danhSachPhongAnSang)
        setDanhSachPhongAnSang(danhSachPhongAnSang)
      } else {
        addToast(
          exampleToast('❌ Không thể tải thông tin danh sách phòng ăn sáng. Vui lòng thử lại sau!'),
        )
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const handleClickUpdateAnSang = (
    ma_xepphong,
    ma_phong,
    tong_so_khach,
    da_an_sang,
    chua_an_sang,
  ) => {
    console.log(ma_xepphong, ma_phong)

    setObject({
      ma_xepphong: ma_xepphong,
      ma_phong: ma_phong,
      tong_so_khach: tong_so_khach,
      da_an_sang: da_an_sang,
      chua_an_sang: chua_an_sang,
    })

    setVisibleAnSang(true)
  }

  const handleClickUpdateAllAnSang = async (ma_xepphong, ma_phong, tong_so_khach, checked) => {
    if (ma_xepphong === null || ma_xepphong === undefined)
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))

    if (tong_so_khach === null || tong_so_khach === undefined)
      return addToast(exampleToast('⚠️ Số lượng người không hợp lệ'))

    let tongSoKhach = 0
    if (checked) {
      tongSoKhach = tong_so_khach
    } else {
      tongSoKhach = 0
    }
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/an-sang-moi-ngay`,
        {},

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            ma_xepphong: ma_xepphong,
            so_luong: tongSoKhach,
          },

          validateStatus: () => {
            return true
          },
        },
      )

      if (response.status === 200) {
        setIsChecked(checked)
        addToast(exampleToast(response.data.message + ' Phòng ' + ma_phong))

        const data = {
          trangthai: true,
          soluong: tongSoKhach,
          tongsokhach: tong_so_khach,
          ma_xepphong: ma_xepphong,
        }
        handleUpdateAnSangComplete(data)
      } else if (response.status === 401) {
        navigate('/login')
      } else {
        addToast(exampleToast(JSON.stringify(response.data, null, 2)))
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 500) {
          addToast(exampleToast('❌ Thêm không thành công. Internal Server Error!'))
        } else if (data?.message) {
          addToast(exampleToast(`❌ ${data.message}`))
        } else {
          addToast(exampleToast('❌ Đã xảy ra lỗi không xác định!'))
        }
      } else {
        addToast(exampleToast('❌ Lỗi kết nối đến server'))
      }
    }
  }

  const handleUpdateAnSangComplete = (data) => {
    // 1. Cập nhật danhSachPhongAnSang
    if (data.trangthai) {
      setDanhSachPhongAnSang((prevState) =>
        prevState.map((phong) =>
          phong.ma_xep_phong_booking === data.ma_xepphong
            ? { ...phong, da_an_sang: data.soluong }
            : phong,
        ),
      )
    }

    // 2. Cập nhật thongKeAnSang
    setThongKeAnSang((prevState) => {
      const updatedData = prevState.map((thongke) => {
        if (thongke.ma_xep_phong_booking === data.ma_xepphong) {
          const da_an_sang = data.soluong
          const chua_an_sang = thongke.tong_so_khach - da_an_sang
          return {
            ...thongke,
            da_an_sang,
            chua_an_sang,
          }
        }
        return thongke
      })

      // 3. Tính toán tổng số liệu
      const total_DaAnSang = updatedData.reduce((sum, item) => sum + item.da_an_sang, 0)
      const total_ChuaAnSang = updatedData.reduce((sum, item) => sum + item.chua_an_sang, 0)

      // 4. Cập nhật stats và chart
      setStats({
        totalRooms: new Set(updatedData.map((item) => item.ma_phong)).size,
        totalGuests: updatedData.reduce((sum, item) => sum + item.tong_so_khach, 0),
        totalDaAnSang: total_DaAnSang,
        totalChuaAnSang: total_ChuaAnSang,
      })

      setChartData((prev) => ({
        ...prev,
        datasets: [
          {
            ...prev.datasets[0],
            data: [total_DaAnSang, total_ChuaAnSang],
          },
        ],
      }))

      return updatedData
    })
  }

  useEffect(() => {
    if (isActive) {
      if (activeTab === 'anSang') {
        fetchData()
      } else if (activeTab === 'banHang') {
        // Reset form bán hàng
        setDanhSachDichVu([])
        setGiamGia(0)
        setGhiChu('')
        setSelectedOption('1')
      }
    }
  }, [isActive, activeTab, refreshTrigger])

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

  const handleGiamGiaChange = (value) => {
    const giamGiaValue = value ? parseFloat(value.replace(/,/g, '')) : 0
    setGiamGia(giamGiaValue)
  }

  const tinhTongTienDichVu = () => {
    return danhSachDichVu.reduce((tong, dichVu) => tong + dichVu.thanhTien, 0)
  }

  const handleThemDichVu = (danhSachDichVuMoi) => {
    setDanhSachDichVu((prevDanhSach) => {
      const updatedDanhSach = [...prevDanhSach]

      danhSachDichVuMoi.forEach((dichVuMoi) => {
        const existingIndex = updatedDanhSach.findIndex(
          (item) => item.maDichVu === dichVuMoi.maDichVu,
        )

        if (existingIndex !== -1) {
          // Nếu dịch vụ đã tồn tại, cộng thêm số lượng
          updatedDanhSach[existingIndex] = {
            ...updatedDanhSach[existingIndex],
            soLuong: updatedDanhSach[existingIndex].soLuong + dichVuMoi.soLuong,
            thanhTien: (updatedDanhSach[existingIndex].soLuong + dichVuMoi.soLuong) * dichVuMoi.gia,
          }
        } else {
          // Nếu là dịch vụ mới, thêm vào danh sách
          updatedDanhSach.push({
            ...dichVuMoi,
            thanhTien: dichVuMoi.soLuong * dichVuMoi.gia,
          })
        }
      })

      return updatedDanhSach
    })

    setVisibleDichVu(false)
  }

  const handleCapNhatSoLuong = (maDichVu, soLuongMoi) => {
    if (soLuongMoi < 0) return

    setDanhSachDichVu((prevDanhSach) =>
      prevDanhSach.map((dichVu) =>
        dichVu.maDichVu === maDichVu
          ? {
              ...dichVu,
              soLuong: soLuongMoi,
              thanhTien: soLuongMoi * dichVu.gia,
            }
          : dichVu,
      ),
    )
  }

  const handleXoaDichVu = (index) => {
    const newDanhSach = [...danhSachDichVu]
    newDanhSach.splice(index, 1)
    setDanhSachDichVu(newDanhSach)
  }

  const handleSubmit = async () => {
    try {
      setLoadSubmit(true)

      // Cập nhật dữ liệu banHang
      const updatedBanHang = {
        tongThanhToan: tinhTongTienDichVu() - giamGia,
        giamGia: giamGia,
        ghiChu: ghiChu,
        hinhThucThanhToan: {
          maHinhThucThanhToan: parseInt(selectedOption),
        },
        chiTietHoaDonBanLe: danhSachDichVu.map((dichVu) => ({
          dichvu: {
            maDichVu: dichVu.maDichVu,
            tenDichVu: dichVu.tenDichVu,
          },
          soLuong: dichVu.soLuong,
          donGia: dichVu.gia,
          thanhTien: dichVu.thanhTien,
        })),
      }

      // Cập nhật state banHang
      setBanHang(updatedBanHang)

      // Gọi API lưu hóa đơn
      const response = await axios.post(
        `${config.apiBaseUrl}/hoa-don-nha-hang/add-hoa-don-ban-le`,
        updatedBanHang,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      )

      console.log(response)
      if (response.status === 200) {
        // Reset form
        setDanhSachDichVu([])
        setGiamGia(0)
        setGhiChu('')
        setSelectedOption('1')
        addToast(exampleToast('✅ Thanh toán thành công!'))

        // Reset banHang state
        setBanHang({
          tongThanhToan: 0,
          giamGia: 0,
          ghiChu: '',
          hinhThucThanhToan: { maHinhThucThanhToan: 1 },
          chiTietHoaDonBanLe: [
            {
              dichvu: { tenDichVu: '' },
              soLuong: 0,
              donGia: 0,
              thanhTien: 0,
            },
          ],
        })
      } else {
        throw new Error('Lỗi khi lưu hóa đơn')
      }
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error)
      addToast(exampleToast('❌ Lỗi khi thanh toán. Vui lòng thử lại!'))
    } finally {
      setLoadSubmit(false)
    }
  }

  // Sửa lại hàm xử lý chuyển tab
  const handleTabChange = (tab) => {
    console.log('Changing tab to:', tab)
    setActiveTab(tab)
  }

  const [banHang, setBanHang] = useState({
    tongThanhToan: 0,
    giamGia: 0,
    ghiChu: '',
    hinhThucThanhToan: { maHinhThucThanhToan: 1 },
    chiTietHoaDonBanLe: [
      {
        dichvu: { tenDichVu: 1 },
        soLuong: 0,
        donGia: 0,
        thanhTien: 0,
      },
    ],
  })

  return (
    <div className="border-2 border-blue-500 rounded-md flex flex-col items-center justify-center w-full mt-2 mb-2 bg-gray-100">
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      <div className="w-full px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Quản Lý Nhà Hàng</h1>

        <div>
          <CNav variant="tabs" className="mb-4 cursor-pointer">
            <CNavItem>
              <CNavLink active={activeTab === 'anSang'} onClick={() => handleTabChange('anSang')}>
                Ăn Sáng
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 'banHang'} onClick={() => handleTabChange('banHang')}>
                Bán Hàng
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink active={activeTab === 'lichSu'} onClick={() => handleTabChange('lichSu')}>
                Lịch Sử Thanh Toán
              </CNavLink>
            </CNavItem>
          </CNav>

          <div className="tab-content">
            {activeTab === 'anSang' && (
              <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-2 w-full">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full">
                  <div className="d-flex justify-content-between align-items-center mb-3 w-full">
                    <h4 className="m-0 font-bold ">THỐNG KÊ</h4>
                    <select
                      id="cars"
                      name="cars"
                      className="bg-transparent outline-none font-semibold text-blue-500"
                      // value={valueDTHomNay}
                      // onChange={onChangeThongKeDoanhThuTheoNgay}
                    >
                      <option value="today">Hôm nay</option>
                      <option value="yesterday">Ngày mai</option>
                      <option value="last_7_days">7 ngày qua</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="bg-blue-100 p-4 rounded-lg text-center font-bold">
                      <p className="text-sm text-black h-14">Tổng số phòng</p>
                      <p className="text-3xl font-bold text-blue-800">{stats.totalRooms}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg text-center font-bold">
                      <p className="text-sm text-black h-14">Tổng số khách</p>
                      <p className="text-3xl font-bold text-blue-800">{stats.totalGuests}</p>
                    </div>

                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      <p className="text-sm text-black font-bold h-14">Đã ăn sáng</p>
                      <p className="text-3xl font-bold text-green-700">{stats.totalDaAnSang}</p>
                    </div>

                    <div className="bg-yellow-100 p-4 rounded-lg text-center">
                      <p className="text-sm text-black font-bold h-14">Chưa ăn sáng</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.totalChuaAnSang}</p>
                    </div>
                  </div>

                  {/* Biểu đồ */}
                  <h3 className="text-lg font-medium mb-2">Tỷ lệ ăn sáng</h3>
                  <div className=" bg-gray-200 flex justify-center  mb-2">
                    <CChart
                      key={JSON.stringify(chartData)}
                      type="doughnut"
                      data={chartData}
                      options={options}
                      style={{ height: '400px' }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 w-full">
                  <h2 className="font-semibold mb-4 ">DANH SÁCH PHÒNG</h2>

                  <div className="w-full">
                    <CSmartTable
                      columns={columns}
                      columnFilter
                      columnSorter
                      items={danhSachPhongAnSang}
                      itemsPerPageSelect
                      itemsPerPage={10}
                      pagination
                      scopedColumns={{
                        Check_All: (item) => {
                          return (
                            <td>
                              <CFormCheck
                                id="flexCheckDefault"
                                label=""
                                checked={
                                  item.da_an_sang === item.tong_so_khach && item.tong_so_khach !== 0
                                }
                                onChange={(e) =>
                                  handleClickUpdateAllAnSang(
                                    item.ma_xep_phong_booking,
                                    item.ma_phong,
                                    item.tong_so_khach,
                                    e.target.checked,
                                  )
                                }
                              />
                            </td>
                          )
                        },
                        da_an_sang: (item) => {
                          return (
                            <td>
                              <CBadge color={item.da_an_sang > 0 ? 'success' : 'danger'}>
                                {item.da_an_sang > 0
                                  ? 'Đã ăn sáng ' + item.da_an_sang + '/' + item.tong_so_khach
                                  : 'Chưa ăn sáng ' + item.da_an_sang + '/' + item.tong_so_khach}
                              </CBadge>
                            </td>
                          )
                        },
                        da_tra_phong: (item) => {
                          return (
                            <td>
                              <CBadge color={item.da_tra_phong ? 'success' : 'danger'}>
                                {item.da_tra_phong ? 'true' : 'false'}
                              </CBadge>
                            </td>
                          )
                        },
                        chi_tiet: (item) => {
                          return (
                            <td>
                              <button>
                                <FontAwesomeIcon
                                  icon={faEllipsisVertical}
                                  className="text-xl"
                                  onClick={() =>
                                    handleClickUpdateAnSang(
                                      item.ma_xep_phong_booking,
                                      item.ma_phong,
                                      item.tong_so_khach,
                                      item.da_an_sang,
                                      item.chua_an_sang,
                                    )
                                  }
                                />
                              </button>
                            </td>
                          )
                        },
                      }}
                      tableBodyProps={{
                        className: 'align-middle',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'banHang' && (
              <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
                {/* Danh sách dịch vụ */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Danh sách dịch vụ</h2>
                    <CButton
                      color="success"
                      onClick={() => setVisibleDichVu(true)}
                      className="flex items-center gap-2 text-white"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Thêm dịch vụ
                    </CButton>
                  </div>
                  <div className="overflow-x-auto">
                    <CTable align="middle" responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>STT</CTableHeaderCell>
                          <CTableHeaderCell>Tên dịch vụ</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Số lượng</CTableHeaderCell>
                          <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                          <CTableHeaderCell>Thành tiền</CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {danhSachDichVu.map((dichVu, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{index + 1}</CTableDataCell>
                            <CTableDataCell>{dichVu.tenDichVu}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              <input
                                type="number"
                                min="1"
                                value={dichVu.soLuong}
                                onChange={(e) =>
                                  handleCapNhatSoLuong(dichVu.maDichVu, parseInt(e.target.value))
                                }
                                className="form-control text-center w-20 mx-auto"
                              />
                            </CTableDataCell>
                            <CTableDataCell>{dichVu.gia.toLocaleString('vi-VN')} ₫</CTableDataCell>
                            <CTableDataCell>
                              {dichVu.thanhTien.toLocaleString('vi-VN')} ₫
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton
                                color="danger"
                                size="sm"
                                onClick={() => handleXoaDichVu(index)}
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-white" />
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </div>

                {/* Thông tin thanh toán */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Thông tin thanh toán</h2>
                  <div className="space-y-4">
                    <div>
                      <CFormLabel>Giảm giá</CFormLabel>
                      <CurrencyInput
                        className="form-control"
                        name="giamGia"
                        placeholder="0"
                        decimalsLimit={0}
                        onValueChange={handleGiamGiaChange}
                      />
                    </div>
                    <div>
                      <CFormLabel>Ghi chú</CFormLabel>
                      <CFormTextarea
                        rows={3}
                        value={ghiChu}
                        onChange={(e) => setGhiChu(e.target.value)}
                        placeholder="Nhập ghi chú..."
                      />
                    </div>
                    <div>
                      <CFormLabel>Phương thức thanh toán</CFormLabel>
                      <div className="space-y-2">
                        <CFormCheck
                          inline
                          type="radio"
                          name="paymentMethod"
                          value="1"
                          label="Tiền mặt"
                          checked={selectedOption === '1'}
                          onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        <CFormCheck
                          inline
                          type="radio"
                          name="paymentMethod"
                          value="2"
                          label="Chuyển khoản"
                          checked={selectedOption === '2'}
                          onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        <CFormCheck
                          inline
                          type="radio"
                          name="paymentMethod"
                          value="3"
                          label="Ví điện tử"
                          checked={selectedOption === '3'}
                          onChange={(e) => setSelectedOption(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span>Tổng tiền dịch vụ:</span>
                        <span className="font-bold">
                          {tinhTongTienDichVu().toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Giảm giá:</span>
                        <span className="font-bold">{giamGia.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng thanh toán:</span>
                        <span>{(tinhTongTienDichVu() - giamGia).toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </div>
                    <CButton
                      color="success"
                      className="w-full text-white font-bold"
                      onClick={handleSubmit}
                      disabled={loadSubmit || danhSachDichVu.length === 0}
                    >
                      {loadSubmit ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheck} className="me-2 " />
                          Thanh toán
                        </>
                      )}
                    </CButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'lichSu' && <LichSuThanhToan isActive={true} />}
          </div>
        </div>
      </div>

      <CapNhatAnSang
        visible={visibleAnSang}
        onClose={() => setVisibleAnSang(false)}
        thongTin={object}
        onSubmit={handleUpdateAnSangComplete}
      />

      <HangHoaModal
        visible={visibleDichVu}
        onClose={() => setVisibleDichVu(false)}
        onSubmit={handleThemDichVu}
      />
    </div>
  )
}
ViewNhaHang.propTypes = {
  isActive: PropTypes.bool.isRequired,
  refreshTrigger: PropTypes.number.isRequired,
}

export default ViewNhaHang
