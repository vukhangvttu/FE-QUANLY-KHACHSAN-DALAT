import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CDatePicker,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTimePicker,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import {
  faCirclePlus,
  faDeleteLeft,
  faFloppyDisk,
  faList,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import Select from 'react-select'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAllDanhXung,
  getAllGiamGia,
  getAllHinhThucThanhToan,
  getAllKhuVuc,
  getAllLoaiGia,
  getAllLoaiThe,
  getAllMucDichDen,
  getAllNguonKhach,
  getAllThiTruong,
  getAllTrangThaiBooKing,
  getAllYeuCau,
} from 'src/service/APIService'

import { getAllLoaiPhongBooKing } from 'src/service/LoaiPhongService'
import { getAllNhomKhachHang } from 'src/service/NhomKhachHang'
import {
  getBooKingByMaBooKing,
  getChiTietBooKingByMaBooKing,
  updateBooking,
} from 'src/service/BooKingService'
import ThongBaoDaXepPhongModal from '../modal/ThongBaoDaXepPhongModal'

const Check_InBooKing = () => {
  const { ma_booking } = useParams()

  const [rows, setRows] = useState([])

  // Thêm dòng mới
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        ngayDen: format(valueNgayDen, 'dd/MM/yyyy'), // Chuyển Date thành chuỗi YYYY-MM-DD
        gioDen: '14:00',
        ngayDi: format(valueNgayDi, 'dd/MM/yyyy'),
        gioDi: '12:00',
        loaiPhong: '0',
        soLuongDuBaoPhong: 5,
        soLuong: 1,
        nguoiLon: 1,
        treEm: 0,
        maGia: '0',
        gia: '',
      },
    ])
  }

  // Xóa dòng theo index
  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  const getTomorrowAtNoon = (date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 1) // Cộng thêm 1 ngày
    newDate.setHours(12, 0, 0, 0) // Đặt giờ thành 12:00:00
    return newDate
  }

  const date = new Date()
  const [valueNgayDen, setValueNgayDen] = useState(new Date())

  // set mặc định ngày tiếp theo
  const [valueNgayDi, setValueNgayDi] = useState(getTomorrowAtNoon(date))

  const handleDateChangeNgayDen = (date) => {
    console.log('Ngày được chọn:', date)
    setValueNgayDen(date)
    setValueNgayDi(getTomorrowAtNoon(date))

    setBooKing((prev) => ({
      ...prev,
      ngayDen: date ? date.toLocaleDateString('en-CA') : '', // Định dạng YYYY-MM-DD
    }))
  }

  const calculateDays = (checkin, checkout) => {
    if (!checkin || !checkout) return 0 // Nếu chưa chọn đủ 2 ngày thì trả về 0

    const timeDiff = checkout.getTime() - checkin.getTime() // Lấy chênh lệch thời gian (ms)
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) // Chuyển đổi ms → ngày
  }

  const [valueSoNgay, setValueSoNgay] = useState(1)

  const handleDateChangeNgayDi = (date) => {
    setValueNgayDi(date)
    setValueSoNgay(calculateDays(valueNgayDi, date))

    setBooKing((prev) => ({
      ...prev,
      ngayDi: date ? date.toLocaleDateString('en-CA') : '', // Định dạng YYYY-MM-DD
    }))
  }

  const handleLoaiPhongChange = (event, rowIndex) => {
    const selectedMaLoaiPhong = event.target.value

    // Kiểm tra nếu loại phòng đã tồn tại ở dòng khác
    const isDuplicate = rows.some(
      (row, index) => index !== rowIndex && row.loaiPhong?.maLoaiPhong === selectedMaLoaiPhong,
    )

    if (isDuplicate) {
      alert('⚠️ Loại phòng đã tồn tại ở dòng khác. Vui lòng chọn loại khác!')
      return
    }

    // Tìm kiếm thông tin đầy đủ của loại phòng
    const selectedLoaiPhong = loaiPhong.find((option) => option.maLoaiPhong === selectedMaLoaiPhong)

    if (!selectedLoaiPhong) {
      alert('⚠️ Không tìm thấy thông tin loại phòng. Vui lòng chọn loại khác!')
      return
    }

    // Cập nhật giá trị loại phòng với cấu trúc chính xác
    const updatedRows = [...rows]
    updatedRows[rowIndex].loaiPhong = {
      maLoaiPhong: selectedLoaiPhong.maLoaiPhong,
      tenLoaiPhong: selectedLoaiPhong.tenLoaiPhong,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // Lọc giá theo mã loại phòng đã chọn
  const getGiaOptions = (maLoaiPhong) => {
    return (
      loaiGia?.flatMap((loaiGia) =>
        loaiGia.giaPhongs
          .filter((giaPhong) => giaPhong.loaiPhong.maLoaiPhong === maLoaiPhong)
          .map((giaPhong) => ({
            maGiaPhong: giaPhong.maGiaPhong,
            tenLoaiGia: loaiGia.tenLoaiGia,
            gia: giaPhong.gia,
          })),
      ) || []
    )
  }
  const [tongSoLuong, setTongSoLuong] = useState(0)
  const [tongTien, setTongTien] = useState(0)
  const handleSoLuongChange = (event, maloaiphong) => {
    let value = event.target.value

    // Chuyển đổi về số nguyên và đảm bảo không âm
    value = isNaN(value) || value < 0 ? 0 : Number(value)

    // Cập nhật số lượng chỉ cho dòng có `maloaiphong` tương ứng
    const updatedRows = rows.map((row) =>
      row.loaiPhong === maloaiphong ? { ...row, soLuong: value } : row,
    )

    // Tính tổng tiền tất cả các hàng
    const tongTienTatCa = updatedRows.reduce((sum, row) => sum + (row.tongTien || 0), 0)

    // Tính tổng số lượng tất cả các hàng
    const tongSoLuongTatCa = updatedRows.reduce((sum, row) => sum + (row.soLuong || 0), 0)

    console.log('Tổng tiền tất cả:', tongTienTatCa.toLocaleString('vi-VN'), 'VND')
    console.log('Tổng số lượng tất cả:', tongSoLuongTatCa)

    // setTongSoLuong(tongSoLuongTatCa)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    setBooKing((prevState) => ({
      ...prevState,
      tongSoLuong: tongSoLuongTatCa,
    }))
  }

  const [tongNguoiLon, setTongNguoiLon] = useState(0)

  const handleSLNguoiLonChange = (event, maloaiphong) => {
    let value = event.target.value

    if (maloaiphong === '0')
      return addToast(exampleToast('Vui lòng chọn loại phòng trước khi thay đổi'))
    // Chuyển đổi về số nguyên và đảm bảo không âm
    value = isNaN(value) || value < 0 ? 0 : Number(value)

    // Cập nhật số lượng chỉ cho dòng có maloaiphong tương ứng
    const updatedRows = rows.map((row) =>
      row.loaiPhong === maloaiphong ? { ...row, nguoiLon: value } : row,
    )

    // Tính tổng số người lớn của tất cả các hàng
    const tongSoNguoiLonTatCa = updatedRows.reduce((sum, row) => sum + (row.nguoiLon || 0), 0)

    console.log('Tổng số người lớn tất cả:', tongSoNguoiLonTatCa)

    setTongNguoiLon(tongSoNguoiLonTatCa)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  const [tongTreEm, setTongTreEm] = useState(0)

  const handleSLTreEmChange = (event, maloaiphong) => {
    let value = event.target.value

    if (maloaiphong === '0')
      return addToast(exampleToast('Vui lòng chọn loại phòng trước khi thay đổi'))
    // Chuyển đổi về số nguyên và đảm bảo không âm
    value = isNaN(value) || value < 0 ? 0 : Number(value)

    // Cập nhật số lượng chỉ cho dòng có maloaiphong tương ứng
    const updatedRows = rows.map((row) =>
      row.loaiPhong === maloaiphong ? { ...row, treEm: value } : row,
    )

    // Tính tổng số người lớn của tất cả các hàng
    const tongSoTreEmTatCa = updatedRows.reduce((sum, row) => sum + (row.treEm || 0), 0)

    console.log('Tổng số trẻ em tất cả:', tongSoTreEmTatCa)

    setTongTreEm(tongSoTreEmTatCa)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    setBooKing((prevState) => ({
      ...prevState,
      soTreEm: tongSoTreEmTatCa,
    }))
  }

  const handleLoaiGiaChange = (event, maLoaiPhong) => {
    const selectedMaGiaPhong = event.target.value

    const selectedGia =
      getGiaOptions(maLoaiPhong).find(
        (option) => option.maGiaPhong.toString() === selectedMaGiaPhong,
      )?.gia || 0

    console.log('Mã Giá Phòng:', selectedMaGiaPhong, 'Giá:', selectedGia)

    const updatedRows = rows.map((row) =>
      row.loaiPhong.maLoaiPhong === maLoaiPhong
        ? {
            ...row,
            loaiGia: {
              ...row.loaiGia,
              maLoaiGia: selectedMaGiaPhong,
            },
            gia: selectedGia,
          }
        : row,
    )
    console.log('updatedRows:', updatedRows)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Tính tổng tiền tất cả các hàng (gia * soLuong)
    const tongTienTatCa = updatedRows.reduce(
      (sum, row) => sum + (row.gia || 0) * (row.soLuong || 0),
      0,
    )

    console.log('Tổng tiền tất cả:', tongTienTatCa)
    setTongTien(tongTienTatCa)

    setBooKing((prevState) => ({
      ...prevState,
      tongTien: tongTienTatCa,
    }))
  }

  const handleGiaChange = (event, maLoaiPhong) => {
    const input = event.target
    const cursorPosition = input.selectionStart // Lấy vị trí con trỏ hiện tại
    const inputValue = input.value

    // Loại bỏ các ký tự không phải số và dấu phẩy
    const rawValue = inputValue.replace(/[^\d]/g, '')

    if (!isNaN(rawValue)) {
      // Chuyển đổi về số nguyên và đảm bảo không âm
      const value = Math.max(0, Number(rawValue))

      // Định dạng lại giá trị với dấu phẩy phân cách ngàn
      const formattedValue = value.toLocaleString('en-US')

      // Cập nhật giá trị 'gia' chỉ cho dòng có 'loaiPhong' tương ứng
      const updatedRows = rows.map((row) =>
        row.loaiPhong === maLoaiPhong ? { ...row, gia: formattedValue } : row,
      )

      setRows(updatedRows)
      updateChiTietBooKings(updatedRows)

      // Tính toán vị trí con trỏ mới dựa trên sự thay đổi độ dài chuỗi
      const diff = formattedValue.length - inputValue.length
      const newCursorPosition = cursorPosition + (diff > 0 ? diff : 0)

      // Đặt lại vị trí con trỏ sau khi render
      setTimeout(() => input.setSelectionRange(newCursorPosition, newCursorPosition), 0)
    }
  }

  const navigate = useNavigate()

  // const [congTy, setCongTy] = useState([])
  const [danhXung, setDanhXung] = useState([])
  const [nhomKhachHang, setNhomKhachHang] = useState([])
  const [khuVuc, setKhuVuc] = useState([])
  const [thiTruong, setThiTruong] = useState([])
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState([])
  const [sourceBooking, setSourceBooking] = useState([])
  const [promotionName, setPromotionName] = useState([])
  const [mucDichDen, setMucDichDen] = useState([])
  const [trangThaiBooKing, setTrangThaiBooKing] = useState([])
  const [loaiThe, setLoaiThe] = useState([])
  const [yeuCau, setyeuCau] = useState([])

  const [loaiPhong, setLoaiPhong] = useState([])
  const [loaiGia, setLoaiGia] = useState([])
  const DanhSach = async () => {
    try {
      // Gọi 3 API đồng thời với Promise.all
      const [
        danhXung,
        nhomKhachHang,
        khuVuc,
        thiTruong,
        hinhThucThanhToan,
        sourceBooking,
        mucDichDen,
        giamgia,
        trangThaiBooKing,
        loaiThe,
        yeuCau,
        loaiPhong,
        loaiGia,
      ] = await Promise.all([
        getAllDanhXung(navigate),
        getAllNhomKhachHang(navigate),
        getAllKhuVuc(navigate),
        getAllThiTruong(navigate),
        getAllHinhThucThanhToan(navigate),
        getAllNguonKhach(navigate),
        getAllMucDichDen(navigate),
        getAllGiamGia(navigate),
        getAllTrangThaiBooKing(navigate),
        getAllLoaiThe(navigate),
        getAllYeuCau(navigate),
        getAllLoaiPhongBooKing(navigate),
        getAllLoaiGia(navigate),
      ])

      // Kiểm tra và xử lý kết quả khi tất cả API thành công
      if (
        danhXung &&
        nhomKhachHang &&
        khuVuc &&
        thiTruong &&
        hinhThucThanhToan &&
        sourceBooking &&
        mucDichDen &&
        giamgia &&
        trangThaiBooKing &&
        loaiThe &&
        yeuCau &&
        loaiPhong &&
        loaiGia
      ) {
        setDanhXung(danhXung)
        setNhomKhachHang(nhomKhachHang) // Set state cho nguonKhach
        // Nếu cần set state cho khuVuc và thiTruong, thêm vào đây
        setKhuVuc(khuVuc)
        setThiTruong(thiTruong)
        setHinhThucThanhToan(hinhThucThanhToan)
        setSourceBooking(sourceBooking)
        setMucDichDen(mucDichDen)
        setPromotionName(giamgia)
        setTrangThaiBooKing(trangThaiBooKing)
        setLoaiThe(loaiThe)
        setyeuCau(yeuCau)
        setLoaiPhong(loaiPhong)
        setLoaiGia(loaiGia)
      } else {
        addToast(exampleToast('Không thể tải danh sách. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      addToast(exampleToast('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!'))
    }
  }

  const [chiTietBooKing, setChiTietBooKing] = useState([])

  const [loading, setLoading] = useState(false)

  const ChiTietBooKing = async (ma_booking) => {
    try {
      // Hiển thị trạng thái đang tải (loading)
      setLoading(true)

      // Gọi API lấy chi tiết đặt phòng
      const chitietbooking = await getChiTietBooKingByMaBooKing(ma_booking, navigate)

      if (chitietbooking) {
        // Cập nhật chi tiết booking
        setChiTietBooKing(chitietbooking)

        // Cập nhật rows với dữ liệu đã kiểm tra
        setRows(chitietbooking)

        // Trả về chitietbooking để sử dụng trong hàm BooKing
        return chitietbooking
      } else {
        addToast(exampleToast('Không thể tải chi tiết đặt phòng. Vui lòng thử lại sau!'))
        return null
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
      return null
    } finally {
      // Tắt trạng thái loading sau khi hoàn tất
      setLoading(false)
    }
  }

  const BooKing = async (ma_booking) => {
    try {
      // Gọi API lấy thông tin booking
      const booking = await getBooKingByMaBooKing(ma_booking, navigate)

      if (booking) {
        // Gọi API lấy chi tiết booking
        const chitietbooking = await ChiTietBooKing(ma_booking)

        if (chitietbooking) {
          // Cập nhật booking với chi tiết booking
          setBooKing((prev) => ({
            ...prev,
            ...booking,
            chiTietBooKings: chitietbooking,
          }))

          setDaXepPhong(booking.daXepPhong)
          setTongSoLuong(booking.tongSoLuong)
          setTongNguoiLon(booKing.soNguoiLon)
          setTongTreEm(booKing.soTreEm)
          setTongTien(booKing.tongTien)
        } else {
          addToast(exampleToast('Không thể tải chi tiết đặt phòng. Vui lòng thử lại sau!'))
        }
      } else {
        addToast(exampleToast('Không thể tải thông tin đặt phòng. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  useEffect(() => {
    DanhSach()
    BooKing(ma_booking)
  }, [ma_booking])
  // save thông tin đặt phòng

  const [booKing, setBooKing] = useState({
    ngayDen: valueNgayDen.toLocaleDateString('en-CA'),
    ngayDi: valueNgayDi.toLocaleDateString('en-CA'),
    soLuongDuBaoPhong: 0,
    soNguoiLon: 0,
    soTreEm: 0,
    tiLeChietKhau: 0,
    tienCoc: 0,
    ngayCoc: '',
    tongSoLuong: 0,
    tongTien: 0,

    danhXung: {
      maDanhXung: '',
    },

    khachHangBooKing: {
      hoKhachHangBooking: '',
      tenKhachHangBooking: '',
      diaChiBooking: '',
      emailBooking: '',
      sdtBooking: '',
      faxBooking: '',
    },
    thongTinLienHeBooKing: {
      tenThongTinLienHeBooKing: '',
      emailThongTinLienHeBooKing: '',
      sdtThongTinLienHeBooKing: '',
      faxThongTinLienHeBooKing: '',
      tourCode: '',
    },

    nhomKhachHang: {
      maNhomKhachHang: '',
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
    khuVuc: {
      maKhuVuc: 1,
    },
    mucDichDen: {
      maMucDich: 1,
    },
    giamGia: {
      maGiamGia: 1,
    },
    trangThaiBooKing: {
      maTrangThaiBooKing: 1,
    },
    loaiThe: {
      maLoaiThe: 1,
    },
    yeuCaus: [],
    chiTietBooKings: [], // Mảng chi tiết đặt phòng
  })

  const onInputChange = (e) => {
    const { name, value, type, checked } = e.target
    console.log(name)
    if (type === 'checkbox') {
      setBooKing((prev) => {
        const yeuCausList = checked
          ? [...prev.yeuCaus, { maYeuCau: value }] // Thêm mới với object
          : prev.yeuCaus.filter((item) => item.maYeuCau.toString() !== value.toString())
        return { ...prev, yeuCaus: yeuCausList }
      })
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setBooKing((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }))
    } else {
      setBooKing((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Đồng bộ rows với booKing.chiTietBooKings
  const updateChiTietBooKings = (updatedRows) => {
    const chiTietBooKings = updatedRows.map((row) => ({
      maChiTietBooking: row.maChiTietBooking,
      ngayDen: row.ngayDen ? new Date(row.ngayDen).toLocaleDateString('en-CA') : null,
      ngayDi: row.ngayDi ? new Date(row.ngayDi).toLocaleDateString('en-CA') : null,
      gioDen: row.gioDen,
      gioDi: row.gioDi,
      soLuong: row.soLuong,
      soLuongDuBaoPhong: row.soLuongDuBaoPhong,
      nguoiLon: row.nguoiLon,
      treEm: row.treEm,
      gia: row.gia ? parseFloat(row.gia) : null,
      loaiPhong: row.loaiPhong, // Chỉ gửi mã loại phòng
      loaiGia: { maLoaiGia: row.loaiGia.maLoaiGia }, // Chỉ gửi mã loại giá
    }))
    setBooKing((prev) => ({ ...prev, chiTietBooKings }))
  }

  console.log('booKing:', booKing)

  const [trangthaiload, setTrangthaiload] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault()
    // 1. Kiểm tra các điều kiện form trước khi gọi API
    if (!booKing?.danhXung?.maDanhXung) {
      return addToast(exampleToast('⚠️ Chưa chọn danh xưng'))
    }

    if (!booKing?.khachHangBooKing?.hoKhachHangBooking?.trim()) {
      return addToast(exampleToast('⚠️ Chưa nhập Last Name'))
    }

    if (!booKing?.chiTietBooKings?.length) {
      return addToast(exampleToast('⚠️ Chưa thêm loại phòng'))
    }

    // 2. Kiểm tra chi tiết từng loại phòng sử dụng .some()
    const isInvalidDetail = booKing.chiTietBooKings.some((item) => {
      if (!item?.loaiPhong?.maLoaiPhong || item.loaiPhong.maLoaiPhong === '0') {
        addToast(exampleToast('⚠️ Chưa chọn loại phòng'))
        return true
      }

      if (!item?.soLuong || item.soLuong <= 0) {
        addToast(exampleToast('⚠️ Chưa nhập số lượng'))
        return true
      }

      if (!item?.loaiGia?.maLoaiGia || item.loaiGia.maLoaiGia === '0') {
        addToast(exampleToast('⚠️ Chưa chọn giá'))
        return true
      }

      if (item?.gia === '' || item.gia <= 0) {
        addToast(exampleToast('⚠️ Chưa nhập giá hợp lệ'))
        return true
      }

      return false
    })

    // 3. Nếu có lỗi, dừng không gọi API
    if (isInvalidDetail) return

    try {
      setTrangthaiload(true)
      // 4. Gọi API nếu dữ liệu hợp lệ

      const response = await updateBooking(ma_booking, booKing, navigate)

      console.log('Booking created successfully:', response)
      setTrangthaiload(false)
      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast(response.message))
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangthaiload(false)
      // 6. Xử lý lỗi khi gọi API
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

  const [daXepPhong, setDaXepPhong] = useState(false)

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
    <CRow className="px-2">
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      <CCard>
        <CCardBody>
          <CForm className="row needs-validation mb-3" onSubmit={handleSubmit}>
            <CCol md={6}>
              <div className="relative mb-3">
                <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                  Guest Infomation
                </span>
                <div className="border-2 border-gray-500 rounded-md p-4 ">
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Last Name <span className="text-danger"> *</span>
                    </CFormLabel>
                    <CCol sm={8}>
                      <CInputGroup>
                        <CFormSelect
                          className="w-4"
                          name="danhXung.maDanhXung"
                          value={booKing.danhXung.maDanhXung}
                          onChange={onInputChange}
                        >
                          <option value="0">Chọn </option>
                          {danhXung.map((item) => (
                            <option key={item.maDanhXung} value={item.maDanhXung}>
                              {item.maDanhXung} - {item.tenDanhXung}
                            </option>
                          ))}
                        </CFormSelect>
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="khachHangBooKing.hoKhachHangBooking"
                          value={booKing.khachHangBooKing.hoKhachHangBooking}
                          onChange={onInputChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      First Name <span className="text-danger"> *</span>
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="khachHangBooKing.tenKhachHangBooking"
                        value={booKing.khachHangBooKing.tenKhachHangBooking}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Address
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="khachHangBooKing.diaChiBooking"
                        value={booKing.khachHangBooKing.diaChiBooking}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Email
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="khachHangBooKing.emailBooking"
                        value={booKing.khachHangBooKing.emailBooking}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Phone/Fax
                    </CFormLabel>
                    <CCol sm={8}>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="khachHangBooKing.sdtBooKing"
                          value={booKing.khachHangBooKing.sdtBooking}
                          onChange={onInputChange}
                        />
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="khachHangBooKing.faxBooKing"
                          value={booKing.khachHangBooKing.faxBooking}
                          onChange={onInputChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Company/Agent Information
                    </CFormLabel>
                    <CCol sm={8}>
                      <Select
                        getOptionValue={(option) => option.maNhomKhachHang}
                        getOptionLabel={(option) => option.tenNhomKhachHang}
                        value={nhomKhachHang.find(
                          (option) =>
                            option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                        )}
                        options={nhomKhachHang}
                        onChange={(selectedOption) =>
                          setBooKing((prev) => ({
                            ...prev,
                            nhomKhachHang: {
                              ...prev.nhomKhachHang,
                              maNhomKhachHang: selectedOption?.maNhomKhachHang || '',
                            },
                          }))
                        }
                      />
                    </CCol>
                  </CRow>
                </div>
              </div>
              <div className="relative mb-3">
                <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                  Contract Preson Infomation
                </span>
                <div className="border-2 border-gray-500 rounded-md p-4 ">
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Name
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="thongTinLienHeBooKing.tenThongTinLienHeBooKing"
                        value={booKing.thongTinLienHeBooKing.tenThongTinLienHeBooKing}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Email
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="thongTinLienHeBooKing.emailThongTinLienHeBooKing"
                        value={booKing.thongTinLienHeBooKing.emailThongTinLienHeBooKing}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Phone/Fax
                    </CFormLabel>
                    <CCol sm={8}>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="thongTinLienHeBooKing.sdttThongTinLienHeBooKing"
                          value={booKing.thongTinLienHeBooKing.sdtThongTinLienHeBooKing}
                          onChange={onInputChange}
                        />
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="thongTinLienHeBooKing.faxThongTinLienHeBooKing"
                          value={booKing.thongTinLienHeBooKing.faxThongTinLienHeBooKing}
                          onChange={onInputChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Tour Code
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="thongTinLienHeBooKing.tourCode"
                        value={booKing.thongTinLienHeBooKing.tourCode}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                </div>
              </div>
            </CCol>
            <CCol md={6}>
              <div className="relative mb-3">
                <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                  Others Infomation
                </span>
                <div className="border-2 border-gray-500 rounded-md p-4 ">
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Area Market
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="khuVuc.maKhuVuc"
                        value={booKing.khuVuc.maKhuVuc}
                        onChange={onInputChange}
                      >
                        {khuVuc.map((item) => (
                          <option key={item.maKhuVuc} value={item.maKhuVuc}>
                            {item.tenKhucVucVi}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Market Segment Code
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="thiTruong.maThiTruong"
                        value={booKing.thiTruong.maThiTruong}
                        onChange={onInputChange}
                      >
                        {thiTruong.map((item) => (
                          <option key={item.maThiTruong} value={item.maThiTruong}>
                            {item.tenThiTruong}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Method of Payment
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="hinhThucThanhToan.maHinhThucThanhToan"
                        value={booKing.hinhThucThanhToan.maHinhThucThanhToan}
                        onChange={onInputChange}
                      >
                        {hinhThucThanhToan.map((item) => (
                          <option key={item.maHinhThucThanhToan} value={item.maHinhThucThanhToan}>
                            {item.tenHinhThucThanhToan}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Purpose Arrival
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="mucDichDen.maMucDich"
                        value={booKing.mucDichDen.maMucDich}
                        onChange={onInputChange}
                      >
                        {mucDichDen.map((item) => (
                          <option key={item.maMucDich} value={item.maMucDich}>
                            {item.tenMucDich}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Source Booking
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="nguonKhach.maNguonKhach"
                        value={booKing.nguonKhach.maNguonKhach}
                        onChange={onInputChange}
                      >
                        {sourceBooking.map((item) => (
                          <option key={item.maNguonKhach} value={item.maNguonKhach}>
                            {item.tenNguonKhach}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Promotion Name
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="giamGia.maGiamGia"
                        value={booKing.giamGia.maGiamGia}
                        onChange={onInputChange}
                      >
                        {promotionName.map((item) => (
                          <option key={item.maGiamGia} value={item.maGiamGia}>
                            {item.tenGiamGia}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                </div>
              </div>
              <div className="relative mb-3">
                <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                  BooKing Status Information
                </span>
                <div className="border-2 border-gray-500 rounded-md p-4 ">
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      BooKing Status
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="trangThaiBooKing.maTrangThaiBooKing"
                        value={booKing.trangThaiBooKing.maTrangThaiBooKing}
                        onChange={onInputChange}
                      >
                        {trangThaiBooKing.map((item) => (
                          <option key={item.maTrangThaiBooKing} value={item.maTrangThaiBooKing}>
                            {item.tenTrangThaiBooKing}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Card Type
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        name="loaiThe.maLoaiThe"
                        value={booKing.loaiThe.maLoaiThe}
                        onChange={onInputChange}
                      >
                        {loaiThe.map((item) => (
                          <option key={item.maLoaiThe} value={item.maLoaiThe}>
                            {item.tenLoaiThe}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Amount Deposit
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="tienCoc"
                        value={booKing.tienCoc}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                </div>
              </div>
            </CCol>
            <div className="relative mb-3">
              <span className="absolute -top-3 left-6 bg-white px-1 text-sm font-semibold">
                Reservation required
              </span>
              <div className="border-2 border-gray-500 rounded-md p-4 ">
                <CCol className="mb-1">
                  {yeuCau.map((item) => (
                    <CFormCheck
                      inline
                      id={`checkbox-${item.maYeuCau}`}
                      key={item.maYeuCau}
                      value={item.maYeuCau}
                      label={item.dienGiai}
                      checked={booKing.yeuCaus?.some(
                        (req) => req.maYeuCau.toString() === item.maYeuCau.toString(),
                      )}
                      onChange={onInputChange}
                    />
                  ))}
                </CCol>

                <div className="">
                  <div className="flex items-center ">
                    <div className="font-semibold cursor-pointer ">
                      <FontAwesomeIcon icon={faCirclePlus} className="text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500 hover:text-blue-300">
                        Thêm yêu cầu
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mb-2">
              <span className="absolute -top-3 left-6 bg-white px-1 text-sm font-semibold">
                Thông tin booking <span className="text-danger"> *</span>
              </span>
              <CRow className="border-2 border-blue-500 rounded-md p-3 mb-3">
                <CCol sm={3}>
                  <CRow className="mb-2">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Ngày đến
                    </CFormLabel>
                    <CCol sm={8}>
                      {daXepPhong ? (
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-form-label text-red-500 font-semibold"
                        >
                          {booKing.ngayDen
                            ? format(parseISO(booKing.ngayDen), 'dd/MM/yyyy')
                            : 'N/A'}
                        </CFormLabel>
                      ) : (
                        <CDatePicker
                          locale="en-GB"
                          date={booKing.ngayDen}
                          onDateChange={handleDateChangeNgayDen}
                        />
                      )}
                    </CCol>
                  </CRow>
                </CCol>
                <CCol sm={3}>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Ngày đi
                    </CFormLabel>
                    <CCol sm={8}>
                      {daXepPhong ? (
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-form-label text-red-500 font-semibold"
                        >
                          {booKing.ngayDi ? format(parseISO(booKing.ngayDi), 'dd/MM/yyyy') : 'N/A'}
                        </CFormLabel>
                      ) : (
                        <CDatePicker
                          locale="en-GB"
                          date={booKing.ngayDi}
                          onDateChange={handleDateChangeNgayDi}
                        />
                      )}
                    </CCol>
                  </CRow>
                </CCol>
                {daXepPhong ? (
                  ''
                ) : (
                  <CCol sm={3}>
                    <CButton color="success" variant="outline">
                      Nhận dự báo
                    </CButton>
                  </CCol>
                )}

                <CCol className="mb-2 border-b" md={12}>
                  <CTable align="middle" responsive borderless hover>
                    <CTableHead>
                      <CTableRow color="success">
                        <CTableHeaderCell>Ngày đến</CTableHeaderCell>
                        <CTableHeaderCell>Giờ đến</CTableHeaderCell>
                        <CTableHeaderCell>Ngày đi</CTableHeaderCell>
                        <CTableHeaderCell>Giờ đi</CTableHeaderCell>
                        <CTableHeaderCell style={{ minWidth: '100px' }}>
                          Loại phòng{' '}
                          <FontAwesomeIcon
                            className="bg-slate-50 ml-1 cursor-pointer"
                            icon={faList}
                          />
                        </CTableHeaderCell>
                        <CTableHeaderCell style={{ minWidth: '80px' }}>Dự báo</CTableHeaderCell>
                        <CTableHeaderCell className="max-w-52">Số lượng</CTableHeaderCell>
                        <CTableHeaderCell>Người lớn</CTableHeaderCell>
                        <CTableHeaderCell>Trẻ em</CTableHeaderCell>
                        <CTableHeaderCell>
                          Mã giá
                          <FontAwesomeIcon
                            className="bg-slate-50 ml-1 cursor-pointer"
                            icon={faList}
                          />
                        </CTableHeaderCell>

                        <CTableHeaderCell>Giá</CTableHeaderCell>
                        <CTableHeaderCell></CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {loading ? (
                        <div className="text-center py-5">Đang tải dữ liệu...</div>
                      ) : (
                        rows.map((row, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>
                              {format(row.ngayDen, 'dd/MM/yyyy') || 'Chọn ngày'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>{row.gioDen.slice(0, 5)}</h4>
                              ) : (
                                <CTimePicker
                                  size="sm"
                                  className="w-20"
                                  locale="en-GB"
                                  seconds={false}
                                  minutes={[0, 30]}
                                  time={row.gioDen}
                                />
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {format(row.ngayDi, 'dd/MM/yyyy') || 'Chọn ngày'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>{row.gioDi.slice(0, 5)}</h4>
                              ) : (
                                <CTimePicker
                                  size="sm"
                                  className="w-20"
                                  locale="en-GB"
                                  seconds={false}
                                  minutes={[0, 30]}
                                  time={row.gioDi}
                                />
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4> {row.loaiPhong.tenLoaiPhong}</h4>
                              ) : (
                                <CFormSelect
                                  size="sm"
                                  value={row.loaiPhong.maLoaiPhong}
                                  onChange={(event) => handleLoaiPhongChange(event, index)}
                                >
                                  <option value="0">Chọn loại phòng</option>
                                  {loaiPhong.map((item) => (
                                    <option key={item.maLoaiPhong} value={item.maLoaiPhong}>
                                      {item.tenLoaiPhong} Trống {item.soLuong}
                                    </option>
                                  ))}
                                </CFormSelect>
                              )}
                            </CTableDataCell>
                            <CTableDataCell>{row.soLuongDuBaoPhong}</CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>{row.soLuong}</h4>
                              ) : (
                                <CFormInput
                                  type="number"
                                  size="sm"
                                  value={row.soLuong}
                                  onChange={(event) => handleSoLuongChange(event, row.loaiPhong)}
                                />
                              )}
                            </CTableDataCell>

                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>{row.nguoiLon} </h4>
                              ) : (
                                <CFormInput
                                  size="sm"
                                  type="number"
                                  value={row.nguoiLon}
                                  onChange={(event) => handleSLNguoiLonChange(event, row.loaiPhong)}
                                />
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>{row.treEm}</h4>
                              ) : (
                                <CFormInput
                                  size="sm"
                                  type="number"
                                  value={row.treEm}
                                  onChange={(event) => handleSLTreEmChange(event, row.loaiPhong)}
                                />
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>
                                  {row.loaiGia.tenLoaiGia} - Giá:{' '}
                                  {row.loaiGia.giaPhongs[0].gia
                                    .toLocaleString('en-US')
                                    .replace(/,/g, ',')}
                                </h4>
                              ) : (
                                <CFormSelect
                                  size="sm"
                                  value={row.loaiGia.maLoaiGia}
                                  onChange={(event) =>
                                    handleLoaiGiaChange(event, row.loaiPhong.maLoaiPhong)
                                  }
                                >
                                  <option value="0">Chọn giá</option>
                                  {getGiaOptions(row.loaiPhong.maLoaiPhong).map((option) => (
                                    <option key={option.maGiaPhong} value={option.maGiaPhong}>
                                      {`${option.tenLoaiGia} - Giá: ${option.gia

                                        .toLocaleString('en-US')
                                        .replace(/,/g, ',')} VND`}
                                    </option>
                                  ))}
                                  {/* {loaiGia?.map((dataloaiGia) =>
                              dataloaiGia.giaPhongs.map((giaPhong) => (
                                <option key={giaPhong.maGiaPhong} value={giaPhong.maGiaPhong}>
                                  {`${dataloaiGia.tenLoaiGia} - Giá: ${giaPhong.gia.toLocaleString(
                                    'vi-VN',
                                  )} VND`}
                                </option>
                              )),
                            )} */}
                                </CFormSelect>
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                <h4>{row.gia?.toLocaleString('en-US')}</h4>
                              ) : (
                                <input
                                  type="text"
                                  className="outline-none w-20 border-b-2 border-gray-500 rounded-none text-right "
                                  value={row.gia?.toLocaleString('en-US')}
                                  onChange={(event) => handleGiaChange(event, row.loaiPhong)}
                                />
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {daXepPhong ? (
                                ''
                              ) : (
                                <FontAwesomeIcon
                                  icon={faDeleteLeft}
                                  className="text-red-500 cursor-pointer"
                                  onClick={() => handleRemoveRow(index)}
                                />
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                    <CTableRow color="secondary">
                      <CTableDataCell colSpan={6} className="text-center">
                        {' '}
                      </CTableDataCell>
                      <CTableDataCell className="text-center" scope="col">
                        {booKing.tongSoLuong}
                      </CTableDataCell>
                      <CTableDataCell scope="col" className="text-center">
                        {booKing.soNguoiLon}
                      </CTableDataCell>
                      <CTableDataCell scope="col" className="text-center">
                        {booKing.soTreEm}
                      </CTableDataCell>
                      <CTableDataCell scope="col" className="text-center"></CTableDataCell>
                      <CTableDataCell className="text-center font-bold">
                        {booKing.tongTien.toLocaleString('en-US')}
                      </CTableDataCell>
                    </CTableRow>
                  </CTable>
                </CCol>

                {daXepPhong ? (
                  ''
                ) : (
                  <CCol className=" d-md-flex justify-content-md-end">
                    <CButton
                      color="success"
                      onClick={handleAddRow}
                      variant="outline"
                      className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
                    >
                      <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                      Thêm loại phòng
                    </CButton>
                  </CCol>
                )}
              </CRow>
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
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
                    value={booKing.tongTien.toLocaleString('en-US')}
                    //   onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <CButton color="danger" className="me-md-2" variant="outline">
                <FontAwesomeIcon icon={faXmark} /> Hủy Booking
              </CButton>
              {!trangthaiload && (
                <CButton color="primary" type="submit" variant="outline">
                  <FontAwesomeIcon icon={faFloppyDisk} /> Update
                </CButton>
              )}
              {trangthaiload && (
                <CButton color="primary" disabled>
                  <CSpinner as="span" size="sm" aria-hidden="true" />
                  Update...
                </CButton>
              )}
            </div>
          </CForm>
        </CCardBody>
      </CCard>

      <ThongBaoDaXepPhongModal visible={daXepPhong} />
    </CRow>
  )
}

export default Check_InBooKing
