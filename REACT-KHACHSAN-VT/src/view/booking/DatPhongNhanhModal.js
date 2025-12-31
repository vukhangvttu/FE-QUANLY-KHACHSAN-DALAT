import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CDatePicker,
  CFormLabel,
  CTimePicker,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { format, parse } from 'date-fns'
import {
  CButton,
  CCol,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faCirclePlus,
  faDeleteLeft,
  faCreditCard,
  faBaby,
  faUserPen,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import AddKhachHang from '../khachhang/AddKhachHang'
import { getAllKhangHangBooKing } from 'src/service/KhachHangBooKingService'
import { useNavigate } from 'react-router-dom'
import ChonPhongModal from '../modal/ChonPhongModal'
import { vi } from 'date-fns/locale'

const getTomorrowAtNoon = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1) // Cộng thêm 1 ngày
  date.setHours(12, 0, 0, 0) // Đặt giờ thành 12:00:00
  return date
}

const DatPhongNhanhModal = ({ visible, onClose, roomData }) => {
  const [value, setValue] = useState('250,000')
  const handleChange = (e) => {
    let inputValue = e.target.value.replace(/[^0-9.]/g, '') // Loại bỏ ký tự không phải số
    inputValue = Number(inputValue).toLocaleString() // Định dạng với dấu phẩy phân cách phần ngàn
    setValue(inputValue)
  }

  const [valueTGNhan, setValueTGNhan] = useState(new Date())

  const [visibleAddKH, setVisibleAddKH] = useState(false)

  // set mặc định ngày tiếp theo
  const [valueTGTra, setValueTGTra] = useState(getTomorrowAtNoon())

  // danh sách thông tin cần thiết
  let navigate = useNavigate()
  const [loading, setLoading] = useState(false) // Ngăn gọi API nhiều lần

  const [danhSachKHBooKing, setDanhSachKHBooKing] = useState([])
  const DanhSach = async () => {
    if (loading) return // Nếu đang loading thì không gọi API
    setLoading(true)
    const data = await getAllKhangHangBooKing(navigate)
    setDanhSachKHBooKing(data)
    setLoading(false)
  }

  // custome input search

  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const wrapperRef = useRef(null)

  // Sample data - replace with your actual data
  // const sampleData = [
  //   { id: 1, name: 'iPhone 13 Pro', category: 'Electronics', price: '$999' },
  //   { id: 2, name: 'MacBook Air', category: 'Electronics', price: '$1299' },
  //   { id: 3, name: 'AirPods Pro', category: 'Accessories', price: '$249' },
  //   { id: 4, name: 'iPad Mini', category: 'Electronics', price: '$499' },
  //   { id: 5, name: 'Magic Mouse', category: 'Accessories', price: '$79' },
  // ]

  // Handle click outside to close dropdown

  useEffect(() => {
    console.log(visible)
    if (visible) {
      console.log('data')
      handleDataFromModal(roomData)

      DanhSach()

      const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setShowResults(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible])

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value)
    setSelectedItem(null)
    if (value.trim()) {
      const filtered = danhSachKHBooKing.filter(
        (item) =>
          item.hoTen.toLowerCase().includes(value.toLowerCase()) ||
          item.tenCongTy.toLowerCase().includes(value.toLowerCase()),
      )
      setSearchResults(filtered)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
    setShowResults(false)
    setSelectedItem(null)
  }

  // Handle item selection
  const handleSelectItem = (item) => {
    setSearchTerm(item.hoTen)
    setSelectedItem(item)
    setShowResults(false)
  }

  const [visibleAddPhong, setVisibleAddPhong] = useState(false)

  const [tonggia, setTongia] = useState(0)
  const handleDataFromModal = (newRoom) => {
    const isDuplicate = selectedRooms.some((room) => room.maloaiphong === newRoom.maloaiphong)

    if (isDuplicate) {
      addToast(exampleToast(`Đã tồn tại phòng thuộc loại ${newRoom.tenloaiphong}!`))
      return
    }

    // Cập nhật danh sách phòng
    setSelectedRooms([...selectedRooms, newRoom])

    updateNgayMinMax([...selectedRooms, newRoom])
    // Kiểm tra nếu newRoom là mảng hoặc đối tượng
    console.log('room', newRoom)
    const tongGia = Array.isArray(newRoom)
      ? newRoom.reduce((total, room) => {
          const soLuongPhong = soluong[room.maloaiphong] || 1
          return total + soLuongPhong * room.gia
        }, 0)
      : (soluong[newRoom.maloaiphong] || 1) * newRoom.gia // Nếu newRoom là đối tượng, tính trực tiếp

    setTongTatCaGia(newRoom.gia + tongTatCaGia)
    setTongSoLuong(tongSoLuong + 1)
  }

  const [selectedRooms, setSelectedRooms] = useState([])

  // Lấy giờ hiện tại và làm tròn phút về 00 hoặc 30
  const now = new Date()
  const roundedMinutes = Math.floor(now.getMinutes() / 30) * 30
  const defaultTime = new Date(now.setMinutes(roundedMinutes, 0, 0)) // Đặt giây về 0

  const [timeGioNhan, setTimeGioNhan] = useState(defaultTime)

  const [timeGioTra, setTimeGioTra] = useState('12:00')

  const handleRemoveRow = (indexToRemove) => {
    setSelectedRooms((prevRooms) => prevRooms.filter((_, index) => index !== indexToRemove))
  }

  const handleGiaChange = (event, maloaiphong) => {
    let value = event.target.value.replace(/,/g, '') // Loại bỏ dấu phẩy để chuyển về số nguyên
    if (!isNaN(value)) {
      let newRooms = [...selectedRooms]
      newRooms[maloaiphong].gia = Number(value)
      setSelectedRooms(newRooms)

      // Sau khi cập nhật selectedRooms, tính lại tổng giá
      const newTongGia = newRooms.reduce((total, room) => {
        const soLuongPhong = soluong[room.maloaiphong] || 1 // Lấy số lượng (mặc định là 1)
        return total + soLuongPhong * room.gia
      }, 0)

      console.log(newTongGia)
      setTongTatCaGia(newTongGia) // Cập nhật tổng giá
    }
  }

  const [soluong, setSoLuong] = useState({}) // Lưu số lượng từng loại phòng
  const [tongGia, setTongGia] = useState({})
  const [tongTatCaGia, setTongTatCaGia] = useState(0) // Tổng giá của tất cả dòng
  const [tongSoLuong, setTongSoLuong] = useState(0)
  const handleSoLuongChange = (event, maloaiphong, dangtrong, gia) => {
    const value = Math.max(1, Number(event.target.value)) // Giữ giá trị >= 1
    if (value > dangtrong) return

    // setSoLuong((prev) => ({
    //   ...prev,
    //   [maloaiphong]: value, // Cập nhật số lượng
    // }))

    const newTongSoLong = {
      ...soluong,
      [maloaiphong]: value,
    }

    /// cộng tất cả giá trị số liuongwj của dòng
    const soluongSum = Object.values(newTongSoLong).reduce((acc, val) => acc + val, 0)
    setTongSoLuong(soluongSum)

    setSoLuong(newTongSoLong)
    const newTongGia = {
      ...tongGia,
      [maloaiphong]: value * gia, // Cập nhật tổng giá của từng loại phòng
    }

    setTongGia(newTongGia)

    // Cộng tổng tất cả giá trị của các dòng
    const totalSum = Object.values(newTongGia).reduce((acc, val) => acc + val, 0)
    setTongTatCaGia(totalSum)
  }

  const [ngayDenMin, setNgayDenMin] = useState('') // Ngày đến nhỏ nhất
  const [ngayDiMax, setNgayDiMax] = useState('') // Ngày đi lớn nhất

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, "dd 'Thg' M", { locale: vi }) // Kết quả: "21 Thg 2"
  }
  const updateNgayMinMax = (rooms) => {
    if (rooms.length === 0) {
      setNgayDenMin('')
      setNgayDiMax('')
      return
    }

    const ngayDenList = rooms.map((room) => new Date(room.ngaynhan)) // Chuyển về Date
    const ngayDiList = rooms.map((room) => new Date(room.ngaytra))

    const minNgayDen = new Date(Math.min(...ngayDenList)) // Tìm ngày đến nhỏ nhất
    const maxNgayDi = new Date(Math.max(...ngayDiList)) // Tìm ngày đi lớn nhất

    setNgayDenMin(formatDate(minNgayDen)) // Format YYYY-MM-DD
    setNgayDiMax(formatDate(maxNgayDi))
  }

  console.log(selectedRooms)

  // save booking

  const initialFormState = {
    ngayDen: '',
    ngayDi: '',
    soNguoiLon: 1,
    soTreEm: 0,
    tiLeChietKhau: 0,
    tienCoc: 0,
    ngayCoc: '2021-02-2025',
    tourCode: 'CODE1',
    tongSoLuong: 0,
    tonngTien: 0,
    nguonGoc: {
      maNguonGoc: 1,
    },
    tinhTrang: {
      maTinhDang: 1,
    },
    yeuCauDatPhong: {
      maYeuCau: 1,
    },
    hinhThucDamBao: {
      maHinhThucDamBao: 1,
    },
    doiTuongThanhToan: {
      maDoiTuongThanhToan: 1,
    },
    hinhThucThanhToan: {
      maHinhThucThanhToan: 1,
    },
    nguonKhach: {
      maNguonKhach: 1,
    },
    thiTruong: {
      maThiTruong: 1,
    },
    khachHangBooKing: {
      maKhachHang: 1,
    },
    chiTietDatPhongs: [
      {
        ngayDen: '',
        ngayDi: '',
        gioDen: '',
        gioDi: '',
        soLuong: 0,
        soLuongDuBaoPhong: 0,
        gia: 0,
        loaiPhong: {
          maLoaiPhong: 0,
        },
        loaiGia: {
          maLoaiGia: 1,
        },
      },
    ],
  }

  const [booKing, setBooKing] = useState(initialFormState)

  const { soNguoiLon, soTreEm, tienCoc } = booKing

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
        size="xl"
        backdrop="static"
        visible={visible}
        onClose={onClose}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel" className="text- font-bold">
            Đặt/Nhận phòng nhanh
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className=" font-bold  text-gray-500 ">
            <CRow className="mb-3">
              {/* <div className="" ref={wrapperRef}>
                  <div className="relative">
           
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchTerm && !selectedItem && setShowResults(true)}
                        placeholder="Nhập mã, Tên, SĐT khách hàng"
                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          selectedItem ? 'bg-blue-50' : 'bg-white'
                        }`}
                      />
                      {searchTerm && (
                        <button
                          onClick={clearSearch}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                       
                          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                        </button>
                      )}
                      {!searchTerm && (
                        <button
                          onClick={() => setVisibleAddKH(true)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                      
                          <FontAwesomeIcon icon={faCirclePlus} />
                        </button>
                      )}
                    </div>
                  
                    {showResults && !selectedItem && (
                      <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                        {searchResults.length > 0 ? (
                          <div>
                        
                            <div className="divide-y divide-gray-100">
                              {searchResults.map((result) => (
                                <div
                                  key={result.maKhachHang}
                                  onClick={() => handleSelectItem(result)}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {result.hoTen}
                                      </h4>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {result.maKhachHang}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            <p>No results found for</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div> */}

              <CCol md={3}></CCol>
              <CCol md={3}>
                <CFormLabel className="labelcustome col-form-label">
                  Khu vực <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="bg-transparent outline-none font-semibold"
                  aria-label="Default select example"
                  options={[
                    { label: 'Open this select menu' },
                    { label: 'One', value: '1' },
                    { label: 'Two', value: '2' },
                    { label: 'Three', value: '3', disabled: true },
                  ]}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel className="labelcustome col-form-label">
                  Khu vực <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="bg-transparent outline-none font-semibold"
                  aria-label="Default select example"
                  options={[
                    { label: 'Open this select menu' },
                    { label: 'One', value: '1' },
                    { label: 'Two', value: '2' },
                    { label: 'Three', value: '3', disabled: true },
                  ]}
                />
              </CCol>
            </CRow>

            {/* <div className=" ">
              <div className="flex items-center space-x-2 border-r border-gray-300 pr-6  border-l pl-6">
                <div className="flex flex-col flex-1">
                  <span className="text-gray-500">Ngưới lớn</span>
                  <div className="flex items-center border-b border-gray-300">
                    <FontAwesomeIcon icon={faUserPen} className="text-gray-500 mr-2" />
                    <select
                      id="cars"
                      name="cars"
                      className="bg-transparent outline-none font-semibold"
                    >
                      <option value="volvo">1</option>
                      <option value="saab">2</option>
                      <option value="fiat">3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className=" ">
              <div className="flex items-center space-x-2 border-r border-gray-300 pr-6">
                <div className="flex flex-col flex-1">
                  <span className="text-gray-500">Trẻ em</span>
                  <div className="flex items-center border-b border-gray-300">
                    <FontAwesomeIcon icon={faBaby} className="text-gray-500 mr-2" />
                    <select
                      id="cars"
                      name="cars"
                      className="bg-transparent outline-none font-semibold"
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                </div>
              </div>
            </div> */}

            <div>
              <div className="flex items-center space-x-2 border-r border-gray-300 pr-6">
                <div className="flex flex-col flex-1">
                  <span className="text-gray-500">Nguồn booKing</span>
                  <div className="flex items-center border-b border-gray-300">
                    {/* <FontAwesomeIcon icon={faBaby} className="text-gray-500 mr-2" /> */}
                    <select
                      id="cars"
                      name="cars"
                      className="bg-transparent outline-none font-semibold"
                    >
                      <option value="0">Không có</option>
                      <option value="0">SALES 01</option>
                      <option value="1">SALES SAIGION</option>

                      <option value="3">ONLINE TRAVEL</option>
                      <option value="3">HOUSE USE</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CRow className="mb-3">
            <CCol md={3}>
              <CFormLabel className="labelcustome col-form-label">
                Khu vực <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                className="bg-transparent outline-none font-semibold"
                aria-label="Default select example"
                options={[
                  { label: 'Open this select menu' },
                  { label: 'One', value: '1' },
                  { label: 'Two', value: '2' },
                  { label: 'Three', value: '3', disabled: true },
                ]}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel className="labelcustome col-form-label">
                Tên công việc <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  { label: 'Open this select menu' },
                  { label: 'One', value: '1' },
                  { label: 'Two', value: '2' },
                  { label: 'Three', value: '3', disabled: true },
                ]}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel className="labelcustome col-form-label">
                Tên công việc <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  { label: 'Open this select menu' },
                  { label: 'One', value: '1' },
                  { label: 'Two', value: '2' },
                  { label: 'Three', value: '3', disabled: true },
                ]}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel className="labelcustome col-form-label">
                Tên công việc <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                aria-label="Default select example"
                options={[
                  { label: 'Open this select menu' },
                  { label: 'One', value: '1' },
                  { label: 'Two', value: '2' },
                  { label: 'Three', value: '3', disabled: true },
                ]}
              />
            </CCol>
          </CRow>
          <CCol>
            <CTable align="middle" responsive borderless hover>
              <CTableHead>
                <CTableRow color="success" className="h-12">
                  <CTableHeaderCell scope="col" className=" align-middle">
                    Hạng phòng
                  </CTableHeaderCell>
                  {/* <CTableHeaderCell scope="col" className=" align-middle">
                    Phòng
                  </CTableHeaderCell> */}

                  {/* <CTableHeaderCell scope="col" className=" align-middle">
                    Hình thức
                  </CTableHeaderCell> */}
                  <CTableHeaderCell scope="col" className=" align-middle">
                    Số lượng
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className=" align-middle ">
                    Trống
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className=" align-middle  w-44">
                    Nhận
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className=" align-middle w-44">
                    Trả phòng
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className=" align-middle">
                    Dự kiến
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className=" align-middle text-center">
                    Thành tiền
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" className=" align-middle"></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {/* <CTableRow className="h-12">
                  <CTableDataCell className=" align-middle w-72">
                    Phòng 01 giường đơn
                  </CTableDataCell>
                  <CTableDataCell className=" align-middle">
                    <CFormSelect
                      size="sm"
                      options={[
                        { label: 'P.201', value: '201' },
                        { label: 'P.202', value: '202' },
                        { label: 'P.203', value: '203' },
                      ]}
                    />
                  </CTableDataCell>

                  <CTableDataCell className=" align-middle">
                    <div className=" flex items-center w-52">
                      <div>
                        <CDatePicker
                          locale="en-GB"
                          size="sm"
                          date={valueTGNhan}
                          onDateChange={setValueTGNhan}
                          inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                          inputDateFormat={(date) =>
                            format(new Date(date), "dd 'Thg' M'", { locale: vi }).replace(
                              'Thg Thg',
                              'Thg',
                            )
                          }
                        />
                      </div>
                      <div>
                        <CTimePicker
                          size="sm"
                          className="w-20"
                          locale="en-GB"
                          seconds={false}
                          minutes={[0, 30]}
                          time={timeGioNhan}
                        />
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className=" align-middle">
                    <div className=" flex items-center w-52">
                      <div>
                        <CDatePicker
                          locale="en-GB"
                          size="sm"
                          date={valueTGTra}
                          onDateChange={setValueTGTra}
                          inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                          inputDateFormat={(date) =>
                            format(new Date(date), "dd 'Thg' M'", { locale: vi }).replace(
                              'Thg Thg',
                              'Thg',
                            )
                          }
                        />
                      </div>
                      <div>
                        <CTimePicker
                          size="sm"
                          className="w-20"
                          locale="en-GB"
                          seconds={false}
                          minutes={[0, 30]}
                          time={timeGioTra}
                        />
                      </div>
                    </div>
                  </CTableDataCell>
                  <CTableDataCell className=" align-middle">1 ngày</CTableDataCell>
                  <CTableDataCell className="align-middle">
                    <input
                      type="text"
                      className="outline-none w-28 border-b-2 border-gray-500 rounded-none text-right"
                      value={value}
                      onChange={handleChange}
                    />
                  </CTableDataCell>

                  <CTableDataCell className=" align-middle">
                    <CCol className="hover:text-red-500">
                      <FontAwesomeIcon icon={faDeleteLeft} />
                    </CCol>
                  </CTableDataCell>
                </CTableRow> */}
                {selectedRooms
                  .slice() // Tạo bản sao để không thay đổi mảng gốc
                  .sort((a, b) => a.maloaiphong - b.maloaiphong) // Sắp xếp theo maloaiphong
                  .map((room, index) => (
                    <CTableRow key={index} className="h-12">
                      <CTableDataCell className="align-middle">{room.tenloaiphong}</CTableDataCell>
                      {/* <CTableDataCell className="align-middle">
                        <CFormSelect
                          size="sm"
                          options={[
                            { label: 'P.201', value: '201' },
                            { label: 'P.202', value: '202' },
                            { label: 'P.203', value: '203' },
                          ]}
                        />
                      </CTableDataCell> */}
                      <CTableDataCell className="align-middle">
                        <input
                          type="number"
                          min={1}
                          value={soluong[room.maloaiphong] || 1}
                          onChange={(e) =>
                            handleSoLuongChange(e, room.maloaiphong, room.dangtrong, room.gia)
                          }
                          className="outline-none w-20 border-b-2 border-gray-500 rounded-none text-center"
                        />
                      </CTableDataCell>
                      <CTableDataCell className="align-middle text-danger text-center">
                        {room.dangtrong}
                      </CTableDataCell>
                      <CTableDataCell className=" align-middle">
                        <div className=" flex items-center w-52">
                          <div>
                            <CDatePicker
                              locale="en-GB"
                              size="sm"
                              date={room.ngaynhan}
                              onDateChange={setValueTGNhan}
                              inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                              inputDateFormat={(date) =>
                                format(new Date(date), "dd 'Thg' M'", { locale: vi }).replace(
                                  'Thg Thg',
                                  'Thg',
                                )
                              }
                            />
                          </div>
                          <div>
                            <CTimePicker
                              size="sm"
                              className="w-20"
                              locale="en-GB"
                              seconds={false}
                              minutes={[0, 30]}
                              time={room.gionhan}
                            />
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className=" align-middle">
                        <div className=" flex items-center w-52">
                          <div>
                            <CDatePicker
                              locale="en-GB"
                              size="sm"
                              date={room.ngaytra}
                              onDateChange={setValueTGTra}
                              inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                              inputDateFormat={(date) =>
                                format(new Date(date), "dd 'Thg' M'", { locale: vi }).replace(
                                  'Thg Thg',
                                  'Thg',
                                )
                              }
                            />
                          </div>
                          <div>
                            <CTimePicker
                              size="sm"
                              className="w-20"
                              locale="en-GB"
                              seconds={false}
                              minutes={[0, 30]}
                              time={room.giotra}
                            />
                          </div>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="align-middle w-24">
                        {room.songay} ngày
                      </CTableDataCell>
                      <CTableDataCell className="align-middle">
                        <input
                          type="text"
                          className="outline-none w-28 border-b-2 border-gray-500 rounded-none text-right "
                          value={(tongGia[room.maloaiphong] || room.gia).toLocaleString('en-US')}
                          onChange={(e) => handleGiaChange(e, index)}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="align-middle">
                        <CCol
                          className="hover:text-red-500 cursor-pointer"
                          onClick={() => handleRemoveRow(index)}
                        >
                          <FontAwesomeIcon icon={faDeleteLeft} />
                        </CCol>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                <CTableRow color="secondary">
                  <CTableHeaderCell scope="row">Tổng</CTableHeaderCell>
                  <CTableDataCell scope="col" className="text-center">
                    {' '}
                    {tongSoLuong}
                  </CTableDataCell>
                  <CTableDataCell scope="col"></CTableDataCell>
                  <CTableDataCell scope="col">{ngayDenMin}</CTableDataCell>
                  <CTableDataCell colSpan={2} scope="col">
                    {ngayDiMax}
                  </CTableDataCell>
                  <CTableDataCell className="text-right font-bold">
                    {' '}
                    {tongTatCaGia.toLocaleString('en-US')}
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCol>
          <div className="flex  justify-between mb-3 ">
            <div className=" gap-3 flex items-center p-2 w-full max-w-3xl">
              <CButton
                onClick={() => setVisibleAddPhong(true)}
                color="success"
                variant="outline"
                className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
              >
                <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                Thêm loại phòng
              </CButton>

              {/* <CButton
                color="primary"
                variant="outline"
                className="p-1 px-3 border-none text-blue-500 group-hover:text-green-100 hover:text-white"
              >
                <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                Sản phẩm, dịch vụ
              </CButton> */}
            </div>
            <div className="border-l-green-300 flex-1 mb-2">
              {/* <button className="px-3 py-1 bg-white rounded-full flex items-center gap-2">
                Chọn nhiều phòng
              </button> */}
              <div className="flex font-bold mb-3">
                <div className="flex-auto">
                  <h4>Khách cần trả</h4>
                </div>
                <div className=" font-bold">
                  <input
                    type="text"
                    className="outline-none w-28 flex-1 border-b-2 border-gray-300 rounded-none text-right text-green-500"
                    value={tongTatCaGia.toLocaleString('en-US')}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex gap-3 ">
                <div className="flex-auto flex">
                  <h4>Khách đã cọc</h4>{' '}
                  <FontAwesomeIcon className="ml-2 text-green-500 mt-1" icon={faCreditCard} />
                </div>
                <div className="font-bold">
                  <input
                    type="text"
                    className="outline-none w-28 flex-1 border-b-2 border-gray-300 rounded-none text-right "
                    value={0}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <div>
              <Link to="/pos/add-chi-tiet-dat-phong">
                <CButton color="secondary" variant="outline">
                  Thêm tùy chọn
                </CButton>
              </Link>
            </div>
            {/* <div>
              <CButton color="success" className=" text-white">
                Nhận phòng
              </CButton>
            </div> */}
            <div>
              <CButton color="warning" className=" text-white">
                Đặt trước
              </CButton>
            </div>
          </div>
        </CModalBody>
      </CModal>

      <AddKhachHang visible={visibleAddKH} onClose={() => setVisibleAddKH(false)} />

      <ChonPhongModal
        visible={visibleAddPhong}
        onClose={() => setVisibleAddPhong(false)}
        onSubmit={handleDataFromModal}
      />
    </>
  )
}

DatPhongNhanhModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  roomData: PropTypes.object.isRequired,
}
export default DatPhongNhanhModal
