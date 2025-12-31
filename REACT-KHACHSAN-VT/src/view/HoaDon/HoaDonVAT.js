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
  CFormTextarea,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
  CTooltip,
} from '@coreui/react-pro'
import {
  faCircleCheck,
  faFloppyDisk,
  faPen,
  faPenToSquare,
  faRotateLeft,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createHoaDonVat,
  getAllKhangHangBooKing,
  getHoaDonVatByMaBooKing,
  getListCodeVAT,
  getPrintHoaDonVatNhap,
  getPrintHoaDonVatPhatHanh,
  updateHoaDonVat,
} from 'src/service/HoaDonVatService'
import { AllThongTinKhachHang } from 'src/service/ThanhToanService'
import HienThịHoaDonVatNhap from '../modal/HienThịHoaDonVatNhap'
import XacNhanHoaDonVat from '../modal/XacNhanHoaDonVat'
import PDFHoaDonPhatHanh from '../modal/PDFHoaDonPhatHanh'
import HuyHoaDonPhatHanhVat from '../modal/HuyHoaDonPhatHanhVat'
import Select from 'react-select'
import DichVuVAT from '../modal/DichVuVAT'

const HoaDonVAT = () => {
  const { ma_booking } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [thongtinbooking, setThongTinBooKing] = useState([])
  const [thongtinhoadonvat, setThongTinHoaDonVat] = useState([])
  const [danhSachCodeVat, setDanhSachCodeVat] = useState([])

  const fetchData = async (trangthai) => {
    try {
      setLoading(true)
      const [khachHangData, hoadonvatdata, listcodevat, thongtinkhachhangbooking] =
        await Promise.all([
          AllThongTinKhachHang(ma_booking),
          getHoaDonVatByMaBooKing(ma_booking),
          getListCodeVAT(),
          getAllKhangHangBooKing(ma_booking),
        ])

      if (khachHangData) {
        setThongTinBooKing(khachHangData)
      }

      if (hoadonvatdata) {
        console.log('ds', hoadonvatdata)
        setThongTinHoaDonVat(hoadonvatdata)
      }
      if (listcodevat) {
        console.log('listcodevat', listcodevat)
        setDanhSachCodeVat(listcodevat)
      }

      if (thongtinkhachhangbooking) {
        console.log('thongtinkhachhangbooking', thongtinkhachhangbooking)

        if (trangthai === 'save') {
          setHoaDonVat((prev) => ({
            ...prev,
            tenKhach: thongtinkhachhangbooking.ten_khach,
            tenCongTy: thongtinkhachhangbooking.loai_nguon_khach,
            diaChi: thongtinkhachhangbooking.dia_chi_booking,
            codeVat: thongtinkhachhangbooking.ma_so_thue,
            email: thongtinkhachhangbooking.email_booking,
            dienThoai: thongtinkhachhangbooking.sdt_booking,
            cccd: '',
            ghiChu: '',
          }))
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ma_booking) {
      fetchData('save')
    }
  }, [ma_booking])

  const [selectedVatId, setSelectedVatId] = useState('')

  const initialFormState = {
    maHoaDonVat: '',
    ngayDen: thongtinbooking.ngay_den,
    ngayDi: thongtinbooking.ngay_dI,
    tenKhach: '',
    ngayLap: new Date(),
    mauHoaDon: '1/002',
    kiHieu: 'C25MHK',
    diaChi: '',
    tenCongTy: '',
    codeVat: '',
    soTaiKhoan: '',
    tong: 0.0,
    tongVat: 0.0,
    email: '',
    dienThoai: '',
    cccd: '',
    ghiChu: '',
    noiDungThayThe: '',
    booKing: {
      maBooking: ma_booking,
    },
    loaiGiayTo: 'CCCD',
  }
  const [hoaDonVat, setHoaDonVat] = useState(initialFormState)

  const onInputChange = (e) => {
    if (e.target.name === 'cccd') {
      if (e.target.value.length > 12) return
    }
    if (e.target.name === 'codeVat') {
      if (e.target.value.length > 13) {
        return
      }
    }
    setHoaDonVat({ ...hoaDonVat, [e.target.name]: e.target.value })
  }

  const handleDateChangeNgayLap = (date) => {
    setHoaDonVat((prev) => ({
      ...prev,
      ngayLap: date ? date.toLocaleDateString('en-CA') : '', // Định dạng YYYY-MM-DD
    }))
  }

  const onInputChangeTong = (value) => {
    const newTong = value || 0 // Nếu giá trị rỗng, set về 0

    setHoaDonVat((prev) => ({
      ...prev,
      tong: newTong,
    }))
  }

  const onInputChangeTongVat = (value) => {
    const newTong = value || 0 // Nếu giá trị rỗng, set về 0

    setHoaDonVat((prev) => ({
      ...prev,
      tongVat: newTong,
    }))
  }

  const [trangthaiload, setTrangthaiload] = useState(false)
  const [tt_update, setTT_update] = useState(false)

  const [trangthaiprint, setTrangthaiprint] = useState(false)
  const [countdown, setCountdown] = useState(6)

  const getInitialFormState = () => ({
    maHoaDonVat: '',
    ngayDen: thongtinbooking.ngayDen,
    ngayDi: thongtinbooking.ngayDi,
    tenKhach: '',
    ngayLap: new Date(),
    mauHoaDon: '1/679',
    kiHieu: 'C25TZC',
    diaChi: '',
    tenCongTy: '',
    codeVat: '',
    soTaiKhoan: '',
    tong: 0.0,
    tongVat: 0.0,
    email: '',
    dienThoai: '',
    cccd: '',
    ghiChu: '',
    noiDungThayThe: '',
    booKing: {
      maBooking: ma_booking,
    },
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (hoaDonVat.codeVat === '') {
      // Khi không có mã số thuế, bắt buộc phải có CCCD hợp lệ
      if (hoaDonVat.loaiGiayTo === 'CCCD') {
        if (!hoaDonVat.cccd || hoaDonVat.cccd.trim() === '') {
          return addToast(exampleToast('⚠️ Khi không có mã số thuế, CCCD là bắt buộc'))
        }
        if (!/^\d{12}$/.test(hoaDonVat.cccd)) {
          return addToast(exampleToast('⚠️ CCCD phải gồm đúng 12 chữ số'))
        }
      } else {
        if (hoaDonVat.loaiGiayTo === 'HOCHIEU') {
          if (!hoaDonVat.cccd || hoaDonVat.cccd.trim() === '') {
            return addToast(exampleToast('⚠️ Khi không có mã số thuế, Hộ chiếu là bắt buộc'))
          }
        }
      }
    } else {
      if (hoaDonVat.codeVat.length !== 10 && hoaDonVat.codeVat.length !== 13) {
        return addToast(exampleToast('⚠️ Mã số thuế phải gồm đúng 10 hoặc 13 chữ số'))
      }
      if (hoaDonVat.diaChi === '') {
        return addToast(exampleToast('⚠️ Chưa nhập địa chỉ'))
      }
      if (hoaDonVat.tenCongTy === '') {
        return addToast(exampleToast('⚠️ Chưa nhập tên công ty'))
      }
    }

    console.log(hoaDonVat)

    if (!hoaDonVat?.mauHoaDon) {
      return addToast(exampleToast('⚠️ Chưa nhập mẫu hóa đơn'))
    }
    if (!hoaDonVat?.kiHieu) {
      return addToast(exampleToast('⚠️ Chưa nhập kí hiệu hóa đơn'))
    }

    try {
      setTrangthaiload(true)

      const response = await createHoaDonVat(ma_booking, hoaDonVat, navigate)

      console.log('Booking created successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast('❌ ' + response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))

        fetchData('save')
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

  const handleSubmitUpdate = async (event) => {
    event.preventDefault()

    // Kiểm tra CCCD phải là 12 số

    if (hoaDonVat.codeVat === '') {
      // Khi không có mã số thuế, bắt buộc phải có CCCD hợp lệ
      if (hoaDonVat.loaiGiayTo === 'CCCD') {
        if (!hoaDonVat.cccd || hoaDonVat.cccd.trim() === '') {
          return addToast(exampleToast('⚠️ Khi không có mã số thuế, CCCD là bắt buộc'))
        }
        if (!/^\d{12}$/.test(hoaDonVat.cccd)) {
          return addToast(exampleToast('⚠️ CCCD phải gồm đúng 12 chữ số'))
        }
      } else {
        if (hoaDonVat.loaiGiayTo === 'HOCHIEU') {
          if (!hoaDonVat.cccd || hoaDonVat.cccd.trim() === '') {
            return addToast(exampleToast('⚠️ Khi không có mã số thuế, Hộ chiếu là bắt buộc'))
          }
        }
      }
    } else {
      if (hoaDonVat.codeVat.length !== 10 && hoaDonVat.codeVat.length !== 13) {
        return addToast(exampleToast('⚠️ Mã số thuế phải gồm đúng 10 hoặc 13 chữ số'))
      }
      if (hoaDonVat.diaChi === '') {
        return addToast(exampleToast('⚠️ Chưa nhập địa chỉ'))
      }
      if (hoaDonVat.tenCongTy === '') {
        return addToast(exampleToast('⚠️ Chưa nhập tên công ty'))
      }
    }

    console.log(hoaDonVat)

    if (!hoaDonVat?.mauHoaDon) {
      return addToast(exampleToast('⚠️ Chưa nhập mẫu hóa đơn'))
    }
    if (!hoaDonVat?.kiHieu) {
      return addToast(exampleToast('⚠️ Chưa nhập kí hiệu hóa đơn'))
    }

    try {
      setTrangthaiload(true)

      const response = await updateHoaDonVat(hoaDonVat, navigate)

      console.log('Hoadon update successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast('❌ ' + response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))
        fetchData('update')
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangthaiload(false)
      // 6. Xử lý lỗi khi gọi API
      if (error.response) {
        const { status, data } = error.response
        setTrangthaiload(false)
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

  const handleClickHienThiThongTinHoaDonVat = (mahoadonvat) => {
    // Tìm hóa đơn trong danh sách thongtinhoadonvat
    const hoaDonCanHienThi = thongtinhoadonvat.find((hoaDon) => hoaDon.maHoaDonVat === mahoadonvat)

    if (hoaDonCanHienThi) {
      // Cập nhật state hoaDonVat với thông tin từ hóa đơn được chọn
      setHoaDonVat({
        ...hoaDonVat,
        maHoaDonVat: hoaDonCanHienThi.maHoaDonVat,
        tenKhach: hoaDonCanHienThi.tenKhach,
        ngayLap: new Date(hoaDonCanHienThi.ngayLap),
        mauHoaDon: hoaDonCanHienThi.mauHoaDon,
        kiHieu: hoaDonCanHienThi.kiHieu,
        diaChi: hoaDonCanHienThi.diaChi,
        tenCongTy: hoaDonCanHienThi.tenCongTy,
        codeVat: hoaDonCanHienThi.codeVat,
        soTaiKhoan: hoaDonCanHienThi.soTaiKhoan,
        tong: hoaDonCanHienThi.tong,
        tongVat: hoaDonCanHienThi.tongVat,
        email: hoaDonCanHienThi.email,
        dienThoai: hoaDonCanHienThi.dienThoai,
        cccd: hoaDonCanHienThi.cccd,
        ghiChu: hoaDonCanHienThi.ghiChu,
        noiDungThayThe: hoaDonCanHienThi.noiDungThayThe,
        booKing: {
          maBooking: hoaDonCanHienThi.booKing.maBooking,
        },
        loaiGiayTo: hoaDonCanHienThi.loaiGiayTo,
      })

      // Đánh dấu trạng thái đang cập nhật
      setTT_update(true)
    }
  }

  const [ma_hoadon_vat, setMaHoaDonVat] = useState('')

  const handleClickHienThiThongTinDichVuVat = (mahoadonvat) => {
    if (!mahoadonvat) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần hiển thị'))
      return
    }
    setMaHoaDonVat(mahoadonvat)
    setVisibleDichVuVAT(true)
  }
  const handleReSet = () => {
    setHoaDonVat(initialFormState)
    setTT_update(false)
  }

  const handleChangeLayMaHoaDonVat = (mahoadonvat) => {
    setSelectedVatId(mahoadonvat)

    const hoaDonTimDuoc = thongtinhoadonvat.find((item) => item.maHoaDonVat === mahoadonvat)

    if (hoaDonTimDuoc) {
      if (!hoaDonTimDuoc.daInNhap) {
        setTrangThaiXacNhan(false)
      } else setTrangThaiXacNhan(true)

      if (hoaDonTimDuoc.xacNhan) {
        setTrangThaiInVAT(true)
        setTrangThaiXacNhan(false)
        setTrangThaiHoaDonNhap(false)
        setTrangThaiHuyHoaDonXacNhanVAT(true)
      } else {
        setTrangThaiInVAT(false)
        setTrangThaiHoaDonNhap(true)
      }

      if (hoaDonTimDuoc.daHuy) {
        setTrangThaiXacNhan(false)
        setTrangThaiInVAT(false)
        setTrangThaiHoaDonNhap(false)
        setTrangThaiHuyHoaDonXacNhanVAT(false)
      }
    } else {
      console.warn('Không tìm thấy hóa đơn với mã:', mahoadonvat)
      setSelectedVatId(null) // hoặc giữ nguyên state
    }
  }

  const [pdfUrl, setPdfUrl] = useState(null)
  const [showPdfModal, setShowPdfModal] = useState(false)

  const handlePrintVat = async () => {
    if (!selectedVatId) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần in'))
      return
    }

    try {
      setTrangthaiprint(true)

      setCountdown(6)

      // Đếm ngược mỗi giây
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const response = await getPrintHoaDonVatNhap(ma_booking, selectedVatId)

      setTrangthaiprint(false)

      const { status, data, headers } = response

      if (response.status === 400) {
        if (response && response.data instanceof Blob) {
          const errorBlob = response.data
          try {
            const text = await errorBlob.text() // đọc nội dung blob dưới dạng text
            const json = JSON.parse(text)
            console.error('Lỗi từ server:', json.message || 'Không rõ lỗi')
            alert(json.message || 'Lỗi không xác định')
          } catch (err) {
            console.error('Không thể đọc lỗi từ Blob:', err)
            alert('Lỗi không xác định')
          }
        } else {
          console.error('Lỗi khác:', response.message)
          alert(response.message || 'Lỗi không xác định')
        }
      }

      if (status === 200) {
        const file = new Blob([data], { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(file)

        setPdfUrl(fileURL)
        setShowPdfModal(true)
        setTrangThaiXacNhan(true)
        addToast(exampleToast('✅ In hóa đơn VAT thành công'))
      } else if (status === 403) {
        addToast(exampleToast('❌ Bạn không có quyền thực hiện thao tác này'))
      } else if (status === 400) {
        const errMsg = headers['x-error-message'] || '❌ Dữ liệu không hợp lệ'
        addToast(exampleToast(errMsg))
      } else if (status === 500) {
        addToast(exampleToast('❌ Internal Server Error!'))
      } else {
        addToast(exampleToast('❌ Lỗi không xác định khi in hóa đơn VAT'))
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangthaiload(false)
      setTrangthaiprint(false)
      if (error.response) {
        const { status, data, headers } = error.response

        // Trường hợp lỗi 400 từ server với response body JSON (hoặc blob JSON)
        if (status === 400 && data instanceof Blob) {
          try {
            const text = await data.text()
            const json = JSON.parse(text)
            console.error('Lỗi server (400):', json.message || 'Không rõ lỗi')
            // alert(json.message || '❌ Dữ liệu không hợp lệ')
            addToast(exampleToast('❌ ' + (json.message || 'Dữ liệu không hợp lệ')))
          } catch (err) {
            console.error('Không thể đọc lỗi từ blob:', err)
            alert('❌ Lỗi không xác định từ server')
          }
        } else if (status === 403) {
          addToast(exampleToast('❌ Bạn không có quyền thực hiện thao tác này'))
        } else if (status === 500) {
          addToast(exampleToast('❌ Internal Server Error!'))
        } else {
          console.error('Lỗi không xác định:', error)
          addToast(exampleToast('❌ Lỗi không xác định khi in hóa đơn VAT'))
        }
      } else {
        console.error('Lỗi không có phản hồi:', error)
        addToast(exampleToast('❌ Lỗi kết nối đến server'))
      }
    }
  }

  const [visibleXacNhanHoaDon, setVisibleXacNhanHoaDon] = useState(false)

  const handleChangeHienThiXacNhan = () => {
    if (!selectedVatId) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần xác nhận'))
      return
    }

    setVisibleXacNhanHoaDon(true)
  }

  const handleXacNhanComplete = (data) => {
    if (data.data.trangthai) {
      setVisibleXacNhanHoaDon(false)
      setTrangThaiXacNhan(false)
      setTrangThaiInVAT(true)
      setTrangthaiprint(false)
      setTrangThaiHoaDonNhap(false)

      setTrangThaiHuyHoaDonXacNhanVAT(true)
      const maHoaDonVat = data.data.ma_hoadon_vat

      const danhSachCapNhat = thongtinhoadonvat.map((item) => {
        if (item.maHoaDonVat === maHoaDonVat) {
          return { ...item, xacNhan: true }
        }
        return item
      })

      setThongTinHoaDonVat(danhSachCapNhat)
    }
  }

  const [pdfUrlHDPhatHanh, setPdfUrlHDPhatHanh] = useState(null)
  const [visibleHDPhatHanh, setVisibleHDPhatHanh] = useState(false)
  const handlePrintVatPhatHanh = async () => {
    if (!selectedVatId) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần in'))
      return
    }

    try {
      setTrangThaiLoadHoaDonVAT(true)
      setTrangThaiInVAT(false)
      setCountdown(6)

      // Đếm ngược mỗi giây
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const response = await getPrintHoaDonVatPhatHanh(selectedVatId)

      console.log(response)

      if (response.status === 400) {
        if (response && response.data instanceof Blob) {
          const errorBlob = response.data
          try {
            const text = await errorBlob.text() // đọc nội dung blob dưới dạng text
            const json = JSON.parse(text)
            console.error('Lỗi từ server:', json.message || 'Không rõ lỗi')
            alert(json.message || 'Lỗi không xác định')
          } catch (err) {
            console.error('Không thể đọc lỗi từ Blob:', err)
            alert('Lỗi không xác định')
          }
        } else {
          console.error('Lỗi khác:', response.message)
          alert(response.message || 'Lỗi không xác định')
        }
      }

      setTrangThaiLoadHoaDonVAT(false)
      setTrangThaiInVAT(true)
      const { status, data, headers } = response

      if (status === 200) {
        const file = new Blob([data], { type: 'application/pdf' })
        const fileURL = URL.createObjectURL(file)

        setPdfUrlHDPhatHanh(fileURL)
        setVisibleHDPhatHanh(true)

        addToast(exampleToast('✅ In hóa đơn VAT thành công'))
      } else if (status === 403) {
        addToast(exampleToast('❌ Bạn không có quyền thực hiện thao tác này'))
      } else if (status === 400) {
        const errMsg = headers['x-error-message'] || '❌ Dữ liệu không hợp lệ'
        addToast(exampleToast(errMsg))
      } else if (status === 500) {
        addToast(exampleToast('❌ Internal Server Error!'))
      } else {
        addToast(exampleToast('❌ Lỗi không xác định khi in hóa đơn VAT'))
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangThaiLoadHoaDonVAT(false)
      setTrangThaiInVAT(true)
      addToast(exampleToast('❌ Lỗi kết nối đến server'))
    }
  }

  const [trangthaiHoaDonNhap, setTrangThaiHoaDonNhap] = useState(false)
  const [trangthaiXacNhan, setTrangThaiXacNhan] = useState(false)
  const [trangthaiInVAT, setTrangThaiInVAT] = useState(false)
  const [trangthailoadHoaDonVAT, setTrangThaiLoadHoaDonVAT] = useState(false)

  const [visibleHuyHDVAT, setVisibleHuyHDVAT] = useState(false)

  const handleHuyHoaDonVAT = () => {
    if (!selectedVatId) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần hủy'))
      return
    }

    setVisibleHuyHDVAT(true)
  }

  const handleHuyVATComplete = () => {
    setVisibleHuyHDVAT(false)
    setTrangThaiXacNhan(false)
    setTrangThaiInVAT(false)
    setTrangThaiHoaDonNhap(false)

    setTrangThaiHuyHoaDonXacNhanVAT(false)

    const danhSachCapNhat = thongtinhoadonvat.map((item) => {
      if (item.maHoaDonVat === selectedVatId) {
        return { ...item, daHuy: true }
      }
      return item
    })

    setThongTinHoaDonVat(danhSachCapNhat)
  }

  const [trangthaiHuyHoaDonXacNhanVAT, setTrangThaiHuyHoaDonXacNhanVAT] = useState(false)

  const handleDateChangeNgayDen = (date) => {
    setHoaDonVat((prev) => ({
      ...prev,
      ngayDen: date ? date.toLocaleDateString('en-CA') : '', // Định dạng YYYY-MM-DD
    }))
  }

  const handleDateChangeNgayDi = (date) => {
    setHoaDonVat((prev) => ({
      ...prev,
      ngayDi: date ? date.toLocaleDateString('en-CA') : '', // Định dạng YYYY-MM-DD
    }))
  }

  const handleChangeTimKiemCodeVat = (selectedOption) => {
    if (selectedOption) {
      setHoaDonVat((prev) => ({
        ...prev,
        codeVat: selectedOption.code_vat,
        tenCongTy: selectedOption.ten_cong_ty,
        diaChi: selectedOption.dia_chi,
        soTaiKhoan: selectedOption.so_tai_khoan,
        email: selectedOption.email,
        dienThoai: selectedOption.dien_thoai,
        cccd: selectedOption.cccd,
        tenKhach: selectedOption.ten_khach_hang,
        ghiChu: selectedOption.ghi_chu,
      }))
    } else {
      setHoaDonVat((prev) => ({
        ...prev,
        codeVat: '',
        tenCongTy: '',
        diaChi: '',
        soTaiKhoan: '',
        email: '',
        dienThoai: '',
        cccd: '',
        tenKhach: '',
        ghiChu: '',
      }))
    }
  }

  const [visibleDichVuVAT, setVisibleDichVuVAT] = useState(false)

  const handleDichVuVAT = () => {
    if (!selectedVatId) {
      addToast(exampleToast('⚠️ Vui lòng chọn hóa đơn VAT cần hủy'))
      return
    }

    setVisibleDichVuVAT(true)
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
    <CRow>
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
            <CRow>
              <CCol xs={12}>
                <div className="row mb-2">
                  <div className="col-md-12">
                    <div className="relative mb-3">
                      <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                        Thông tin khách hàng BK-ID: {thongtinbooking.ma_booking}
                      </span>
                      <CForm className=" needs-validation">
                        <div className="border-2  border-blue-500 rounded-md p-4">
                          <CRow className="mb-4">
                            <CCol sm={6}>
                              <CFormLabel
                                htmlFor="inputPassword"
                                className="col-sm-5 col-form-label labelcustome"
                              >
                                Tìm kiếm theo Code VAT
                              </CFormLabel>
                              <Select
                                getOptionValue={(option) => option.code_vat}
                                getOptionLabel={(option) => option.ten_cong_ty}
                                // value={nhomKhachHang.find(
                                //   (option) =>
                                //     option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                                // )}
                                options={danhSachCodeVat}
                                onChange={handleChangeTimKiemCodeVat}
                                placeholder={'Nhập mã số thuế'}
                                //  value={valueTinh}
                              />
                            </CCol>
                          </CRow>

                          <CRow className="mb-1">
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Ngày đến <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  {/* <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    value={thongtinbooking.ngay_den}
                                    onChange={onInputChange}
                                  /> */}
                                  <CDatePicker
                                    locale="en-GB"
                                    date={thongtinbooking.ngay_den}
                                    onDateChange={handleDateChangeNgayDen}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Ngày đi <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  {/* <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    value={thongtinbooking.ngay_di}
                                  /> */}
                                  <CDatePicker
                                    locale="en-GB"
                                    date={thongtinbooking.ngay_di}
                                    onDateChange={handleDateChangeNgayDi}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  BillVatNo <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    value={hoaDonVat.maHoaDonVat}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  ID-Booking <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300 readOnly"
                                    value={thongtinbooking.ma_booking}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                          </CRow>

                          <CRow className="mb-1">
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Tên khách <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="tenKhach"
                                    value={hoaDonVat.tenKhach}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Ngày lập<span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CDatePicker
                                    locale="en-GB"
                                    date={hoaDonVat.ngayLap}
                                    onDateChange={handleDateChangeNgayLap}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-5 col-form-label labelcustome"
                                >
                                  Mẫu hóa đơn <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={7}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    value={hoaDonVat.mauHoaDon}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-5 col-form-label labelcustome"
                                >
                                  Kí hiệu <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={7}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    value={hoaDonVat.kiHieu}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                          </CRow>

                          <CRow className="mb-1">
                            <CCol md={6}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-2 col-form-label labelcustome"
                                >
                                  Tên công ty <span className="text-danger">*</span>
                                </CFormLabel>
                                <CCol sm={10}>
                                  <CFormTextarea
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="tenCongTy"
                                    value={hoaDonVat.tenCongTy}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={6}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-2 col-form-label labelcustome"
                                >
                                  Địa chỉ <span className="text-danger">*</span>
                                </CFormLabel>
                                <CCol sm={10}>
                                  <CFormTextarea
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="diaChi"
                                    value={hoaDonVat.diaChi}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                          </CRow>
                          <CRow className="mb-1">
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Code Vat <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="codeVat"
                                    value={hoaDonVat.codeVat}
                                    onChange={onInputChange}
                                    maxLength={13}
                                    placeholder="Mã số thuế tối đa 13 ký tự"
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Số tài khoản <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="soTaiKhoan"
                                    value={hoaDonVat.soTaiKhoan}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            {/* <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Tổng <span className=" text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CurrencyInput
                                    className="form-control text-right"
                                    name="tong"
                                    placeholder="0"
                                    decimalsLimit={2}
                                    value={hoaDonVat.tong}
                                    onValueChange={onInputChangeTong}
                                  />
                                </CCol>
                              </CRow>
                            </CCol> */}
                            {/* <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Tổng Vat<span className=" text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CurrencyInput
                                    className="form-control text-right"
                                    name="tongVat"
                                    placeholder="0"
                                    decimalsLimit={2}
                                    value={hoaDonVat.tongVat}
                                    onValueChange={onInputChangeTongVat}
                                  />
                                </CCol>
                              </CRow>
                            </CCol> */}
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Email <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="email"
                                    value={hoaDonVat.email}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Điện thoại <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="dienThoai"
                                    value={hoaDonVat.dienThoai}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                          </CRow>

                          <CRow className="mb-1">
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Loại giấy tờ <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormSelect
                                    className="mb-3"
                                    aria-label="Large select example"
                                    name="loaiGiayTo"
                                    value={hoaDonVat.loaiGiayTo}
                                    onChange={onInputChange}
                                  >
                                    <option value="CCCD">CCCD</option>
                                    <option value="HOCHIEU">Hộ chiếu</option>
                                  </CFormSelect>
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Số giấy tờ <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormInput
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="cccd"
                                    value={hoaDonVat.cccd}
                                    onChange={onInputChange}
                                    maxLength={12}
                                    placeholder="CCCD đúng 12 ký tự"
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                            <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Ghi chú <span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormTextarea
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="ghiChu"
                                    value={hoaDonVat.ghiChu}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol>
                          </CRow>

                          <CRow>
                            {/* <CCol md={3}>
                              <CRow className="mb-1">
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-sm-4 col-form-label labelcustome"
                                >
                                  Nội dung thay thế<span className="text-danger"></span>
                                </CFormLabel>
                                <CCol sm={8}>
                                  <CFormTextarea
                                    type="text"
                                    className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                                    name="noiDungThayThe"
                                    value={hoaDonVat.noiDungThayThe}
                                    onChange={onInputChange}
                                  />
                                </CCol>
                              </CRow>
                            </CCol> */}
                          </CRow>

                          <span className="text-danger">
                            Lưu ý: <br />
                            1.Nếu nhập mã số thuế (Code Vat) thì không cần nhập CCCD. <br />
                            2.Nếu nhập CCCD/Hộ chiếu thì không cần nhập mã số thuế (Code Vat).{' '}
                            <br />
                          </span>

                          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                            <CButton color="secondary" variant="outline" onClick={handleReSet}>
                              <FontAwesomeIcon icon={faRotateLeft} /> Reset
                            </CButton>
                            {trangthaiload && (
                              <CButton color="primary" disabled>
                                <CSpinner
                                  as="span"
                                  size="sm"
                                  aria-hidden="true"
                                  className="font-semibold"
                                />
                                Save...
                              </CButton>
                            )}
                            {!trangthaiload && (
                              <>
                                {tt_update ? (
                                  <CButton
                                    color="primary"
                                    variant="outline"
                                    className="font-semibold"
                                    onClick={handleSubmitUpdate}
                                  >
                                    <FontAwesomeIcon icon={faFloppyDisk} /> Update
                                  </CButton>
                                ) : (
                                  <CButton
                                    color="primary"
                                    variant="outline"
                                    className="font-semibold"
                                    onClick={handleSubmit}
                                  >
                                    <FontAwesomeIcon icon={faFloppyDisk} /> Save
                                  </CButton>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </CForm>
                    </div>
                  </div>
                </div>

                <div className=" mb-3">
                  <div className="border-2 border-gray-500 rounded-md p-4 overflow-x-auto w-full ">
                    <CTable align="middle" responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">Chọn</CTableHeaderCell>
                          <CTableHeaderCell scope="col">BillVatNo</CTableHeaderCell>

                          <CTableHeaderCell style={{ minWidth: '200px' }}>
                            Tên khách
                          </CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '200px' }}>Địa chỉ</CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '200px' }}>Công ty</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Mã số thuế</CTableHeaderCell>
                          {/* <CTableHeaderCell scope="col">Số tài khoản</CTableHeaderCell> */}

                          <CTableHeaderCell scope="col">Thời gian</CTableHeaderCell>

                          <CTableHeaderCell scope="col"></CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {thongtinhoadonvat
                          .sort((a, b) => {
                            // Sắp xếp theo thời gian tạo, nếu không có thì sắp xếp theo mã hóa đơn
                            if (a.thoiGianTao && b.thoiGianTao) {
                              const dateA = new Date(a.thoiGianTao)
                              const dateB = new Date(b.thoiGianTao)
                              return dateB.getTime() - dateA.getTime()
                            }
                            // Nếu không có thời gian tạo, sắp xếp theo mã hóa đơn (mới nhất lên đầu)
                            return b.maHoaDonVat.localeCompare(a.maHoaDonVat)
                          })
                          .map((data) => (
                            <CTableRow
                              key={data.maHoaDonVat}
                              color={data.daHuy ? 'danger' : data.xacNhan ? 'success' : ''}
                            >
                              <CTableDataCell>
                                <CFormCheck
                                  type="radio"
                                  checked={selectedVatId === data.maHoaDonVat}
                                  onChange={() => handleChangeLayMaHoaDonVat(data.maHoaDonVat)}
                                />
                              </CTableDataCell>
                              <CTableHeaderCell scope="row">{data.maHoaDonVat}</CTableHeaderCell>

                              <CTableDataCell>{data.tenKhach}</CTableDataCell>
                              <CTableDataCell>{data.diaChi}</CTableDataCell>
                              <CTableDataCell>{data.tenCongTy}</CTableDataCell>
                              <CTableDataCell>{data.codeVat}</CTableDataCell>
                              {/* <CTableDataCell>{data.soTaiKhoan}</CTableDataCell> */}

                              <CTableDataCell>
                                {data.thoiGianTao
                                  ? new Date(data.thoiGianTao).toLocaleString('vi-VN', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </CTableDataCell>

                              <CTableDataCell>
                                {!data.daHuy || !data.xacNhan ? (
                                  <>
                                    <div className="flex items-center space-x-4">
                                      <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className="text-warning cursor-pointer"
                                        onClick={() =>
                                          handleClickHienThiThongTinHoaDonVat(data.maHoaDonVat)
                                        }
                                      />
                                      <CTooltip
                                        content="Chỉnh sửa dịch vụ VAT"
                                        trigger={['hover', 'focus']}
                                      >
                                        <span className="d-inline-block" tabIndex={0}>
                                          <FontAwesomeIcon
                                            className="text-green-500 cursor-pointer p-2"
                                            icon={faPen}
                                            onClick={() =>
                                              handleClickHienThiThongTinDichVuVat(data.maHoaDonVat)
                                            }
                                          />
                                        </span>
                                      </CTooltip>
                                    </div>
                                  </>
                                ) : (
                                  ''
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                      </CTableBody>
                    </CTable>
                  </div>
                </div>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  {trangthaiXacNhan && (
                    <>
                      <CButton
                        color="success"
                        variant="outline"
                        className="font-semibold hover:text-white"
                        onClick={handleChangeHienThiXacNhan}
                      >
                        <FontAwesomeIcon icon={faCircleCheck} /> Phát hành VAT
                      </CButton>
                    </>
                  )}
                  {trangthaiHoaDonNhap && trangthaiprint && (
                    <CButton color="primary" disabled>
                      <CSpinner as="span" size="sm" aria-hidden="true" className="font-semibold" />
                      &nbsp; Chờ xử lý {countdown}s ...
                    </CButton>
                  )}

                  {trangthaiHoaDonNhap && !trangthaiprint && (
                    <>
                      <CButton
                        color="primary"
                        variant="outline"
                        className="font-semibold"
                        onClick={handlePrintVat}
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} /> Print VAT Nháp
                      </CButton>
                    </>
                  )}

                  {trangthailoadHoaDonVAT && !trangthaiInVAT && (
                    <CButton color="primary" disabled>
                      <CSpinner as="span" size="sm" aria-hidden="true" className="font-semibold" />
                      &nbsp; Chờ xử lý {countdown}s ...
                    </CButton>
                  )}
                  {trangthaiInVAT && (
                    <>
                      <CButton
                        color="primary"
                        variant="outline"
                        className="font-semibold"
                        onClick={handlePrintVatPhatHanh}
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} /> Print VAT Xác Nhận
                      </CButton>
                    </>
                  )}
                  {trangthaiHuyHoaDonXacNhanVAT && (
                    <>
                      <CButton
                        color="danger"
                        variant="outline"
                        className="font-semibold hover:text-white"
                        onClick={handleHuyHoaDonVAT}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Hủy VAT
                      </CButton>
                    </>
                  )}
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      <HienThịHoaDonVatNhap
        visible={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        pdfUrl={pdfUrl}
      />

      <XacNhanHoaDonVat
        visible={visibleXacNhanHoaDon}
        onClose={() => setVisibleXacNhanHoaDon(false)}
        ma_hoadon_vat={selectedVatId}
        onSubmit={handleXacNhanComplete}
      />

      <PDFHoaDonPhatHanh
        visible={visibleHDPhatHanh}
        onClose={() => setVisibleHDPhatHanh(false)}
        pdfUrl={pdfUrlHDPhatHanh}
      />

      <HuyHoaDonPhatHanhVat
        visible={visibleHuyHDVAT}
        onClose={() => setVisibleHuyHDVAT(false)}
        ma_hoadon_vat={selectedVatId}
        onSubmit={handleHuyVATComplete}
      />

      <DichVuVAT
        visible={visibleDichVuVAT}
        onClose={() => setVisibleDichVuVAT(false)}
        ma_hoadon_vat={ma_hoadon_vat}
        ma_booking={ma_booking}
        onSubmit={handleHuyVATComplete}
      />
    </CRow>
  )
}

export default HoaDonVAT
