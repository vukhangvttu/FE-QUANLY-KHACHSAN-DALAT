import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
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
  faFloppyDisk,
  faPenToSquare,
  faRotateLeft,
  faTrash,
  faPlus,
  faImage,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parse, parseISO, isValid } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  getAllDanhXung,
  getAllLoaiGiayTo,
  getAllLoaiTreEm,
  getAllQuocGia,
  getAllTinhThanh,
  getHuyenByMaTinh,
  getlPhuongXaByMaHuyen,
} from 'src/service/APIService'
import {
  createKhachHangPhong,
  getKhachHangPhongById,
  getKhachHangPhongByMaXepPhong,
  updateKhachHangPhong,
} from 'src/service/KhacHangPhongService'
import XoaThongTinKhach_Phong from '../modal/XoaThongTinKhach_Phong'
import axiosInstance from '../../service/axiosConfig'
import PhuongXaModal from '../modal/PhuongXaModal'

const AddGuestToRoom = () => {
  const { tenPhong, ma_xepphong_booking } = useParams()

  const [trangthaiload, setTrangthaiload] = useState(false)
  const [ischeck, setIscheck] = useState(0)

  const handleChangeGioTinh = (e) => {
    const value = e.target.value
    setIscheck(value)
    setKhachHangPhong((pre) => ({
      ...pre,
      gioiTinh: value,
    }))
  }

  // save khách hàng
  const initialFormState = {
    maKhachHangPhong: '',
    ho: '',
    ten: '',
    ngaySinh: '',
    gioiTinh: '0',
    diaChi: '',
    soGiayTo: '',
    sdt: '',
    soTuoiTre: '',
    ghiChu: '',
    danhXung: {
      maDanhXung: '',
    },
    loaiTreEm: {
      maLoaiTreEm: 1,
    },
    loaiGiayTo: {
      maLoaiGiayTo: 'CCCD',
    },
    tinhThanh: {
      maTinh: '',
    },
    huyen: {
      maHuyen: '',
    },
    phuongXa: {
      maPhuongXa: '',
    },
    quocGia: {
      maQuocGia: 'VNM',
      tenQuocGia: 'Việt Nam',
    },
  }
  const [khachHangPhong, setKhachHangPhong] = useState(initialFormState)
  const [displayDate, setDisplayDate] = useState('')

  const onInputChange = (e) => {
    console.log(e.target.name)
    console.log(e.target.value)

    const { name, value } = e.target

    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setKhachHangPhong((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }))
    } else {
      setKhachHangPhong((prev) => ({ ...prev, [name]: value }))
    }
  }

  console.log('khach hang', khachHangPhong)

  const handleDateInputChange = (e) => {
    const inputValue = e.target.value
    console.log('Date input value:', inputValue)

    // Kiểm tra nếu input rỗng
    if (!inputValue || inputValue.trim() === '') {
      setDisplayDate('')
      setKhachHangPhong((prev) => ({
        ...prev,
        ngaySinh: null,
      }))
      return
    }

    // Chỉ cho phép nhập số và dấu /
    const allowedChars = /^[0-9/]*$/
    if (!allowedChars.test(inputValue)) {
      // Nếu có ký tự không hợp lệ, không cập nhật
      return
    }

    // Loại bỏ tất cả ký tự không phải số
    const numbersOnly = inputValue.replace(/\D/g, '')

    // Giới hạn tổng số chữ số chỉ 8 ký tự (ddMMyyyy)
    const limitedNumbers = numbersOnly.substring(0, 8)

    // Auto-format thành dd/MM/yyyy với giới hạn 4 chữ số cho năm
    let formattedValue = inputValue
    if (limitedNumbers.length <= 8) {
      if (limitedNumbers.length >= 1) {
        formattedValue = limitedNumbers.substring(0, 2)
        if (limitedNumbers.length >= 3) {
          formattedValue += '/' + limitedNumbers.substring(2, 4)
          if (limitedNumbers.length >= 5) {
            // Giới hạn năm chỉ 4 chữ số
            const year = limitedNumbers.substring(4, 8)
            formattedValue += '/' + year
          }
        }
      }
    }

    // Cập nhật giá trị hiển thị
    setDisplayDate(formattedValue)

    // Thử parse ngày từ định dạng dd/MM/yyyy
    try {
      const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date())

      // Kiểm tra xem ngày có hợp lệ không
      if (isValid(parsedDate)) {
        const formattedDate = format(parsedDate, 'yyyy-MM-dd')
        setKhachHangPhong((prev) => ({
          ...prev,
          ngaySinh: formattedDate,
        }))
        console.log('Parsed date successfully:', formattedDate)
      } else {
        console.log('Invalid date format:', formattedValue)
        // Vẫn cập nhật state với giá trị hiện tại để người dùng có thể tiếp tục nhập
        setKhachHangPhong((prev) => ({
          ...prev,
          ngaySinh: null,
        }))
      }
    } catch (error) {
      console.error('Error parsing date:', error)
      // Vẫn cập nhật state với giá trị hiện tại để người dùng có thể tiếp tục nhập
      setKhachHangPhong((prev) => ({
        ...prev,
        ngaySinh: null,
      }))
    }
  }

  const navigate = useNavigate()

  const [danhSachTinh, setDanhSachTinh] = useState([])

  const [danhSachHuyen, setDanhSachHuyen] = useState([])
  const DanhSachHuyen = async (maTinh) => {
    try {
      // Gọi API lấy thông tin booking
      const huyen = await getHuyenByMaTinh(maTinh, navigate)

      if (huyen) {
        // Gọi API lấy chi tiết booking

        setDanhSachHuyen(huyen)
      } else {
        addToast(exampleToast('Không thể tải danh sách huyện. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin huyện:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [danhSachPhuongXa, setDanhSachPhuongXa] = useState([])
  const DanhSacPhuongXa = async (maHuyen) => {
    try {
      // Gọi API lấy thông tin booking
      const phuongxa = await getlPhuongXaByMaHuyen(maHuyen, navigate)

      if (phuongxa) {
        // Gọi API lấy chi tiết booking

        setDanhSachPhuongXa(phuongxa)
      } else {
        addToast(exampleToast('⚠️ Không thể tải danh sách phường xã. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phường xã:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [loading, setLoading] = useState(false)
  const [danhSachKhacHangPhong, setDanhSachKhacHangPhong] = useState([])

  const LoadDanhSachKhachHangPhong = async (maXepPhong) => {
    try {
      setLoading(true)

      const listkhachhangphong = await getKhachHangPhongByMaXepPhong(maXepPhong, navigate)

      if (listkhachhangphong) {
        setDanhSachKhacHangPhong(listkhachhangphong)
        console.log('kh', listkhachhangphong)
      } else {
        addToast(
          exampleToast('⚠️ Không thể tải danh sách khách hàng trong phòng. Vui lòng thử lại sau!'),
        )
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách khách hàng trong phòng:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    DanhSach()
  }, [])

  const [danhXung, setDanhXung] = useState([])
  const [quocGia, setQuocGia] = useState([])
  const [loaiGiayTo, setLoaiGiayTo] = useState([])
  const [loaiTreEm, setLoaiTreEm] = useState([])

  const DanhSach = async () => {
    try {
      // Gọi 3 API đồng thời với Promise.all
      const [danhXung, tinhThanh, quocGia, loaiGiayTo, loaiTreEm] = await Promise.all([
        getAllDanhXung(navigate),
        getAllTinhThanh(navigate),
        getAllQuocGia(navigate),
        getAllLoaiGiayTo(navigate),
        getAllLoaiTreEm(navigate),
      ])

      // Kiểm tra và xử lý kết quả khi tất cả API thành công
      if (danhXung && tinhThanh && quocGia && loaiGiayTo && loaiTreEm) {
        setDanhXung(danhXung)
        setDanhSachTinh(tinhThanh)
        setQuocGia(quocGia)
        setLoaiGiayTo(loaiGiayTo)
        setLoaiTreEm(loaiTreEm)
        LoadDanhSachKhachHangPhong(ma_xepphong_booking)
      } else {
        addToast(exampleToast('⚠️ Không thể tải danh sách. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      addToast(exampleToast('❌ Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!'))
    }
  }

  const handleChangeTinhThanh = (e) => {
    console.log(e)
    const maTinh = e.maTinh

    if (maTinh === '' || maTinh === undefined) {
      addToast(exampleToast('❌ Mã tỉnh hiện tại không hợp lệ'))
    } else {
      DanhSachHuyen(maTinh)
      setValueTinh(e)
      setKhachHangPhong((prev) => ({
        ...prev,
        tinhThanh: {
          maTinh: e.maTinh || '',
          tenTinh: e.tenTinh || '',
        },
      }))
    }
  }

  const handleChangeHuyen = (e) => {
    console.log(e)
    const maHuyen = e.maHuyen

    if (maHuyen === '' || maHuyen === undefined) {
      addToast(exampleToast('❌ Mã huyện hiện tại không hợp lệ'))
    } else {
      DanhSacPhuongXa(maHuyen)

      setValueHuyen(e)
      setKhachHangPhong((prev) => ({
        ...prev,
        huyen: {
          maHuyen: e.maHuyen || '',
          tenhuyen: e.tenhuyen || '',
        },
      }))
    }
  }

  const handleSubmit = async () => {
    console.log(khachHangPhong)

    if (
      ma_xepphong_booking === '' ||
      ma_xepphong_booking === null ||
      ma_xepphong_booking === undefined
    ) {
      return addToast(exampleToast('⚠️ Mã Xếp Phòng hiện tại đang không hợp lệ'))
    }

    // 1. Kiểm tra các điều kiện form trước khi gọi API
    if (!khachHangPhong?.danhXung?.maDanhXung) {
      return addToast(exampleToast('⚠️ Chưa chọn danh xưng'))
    }

    // Cải thiện validation cho ngày sinh
    if (
      !khachHangPhong?.ngaySinh ||
      khachHangPhong?.ngaySinh === '' ||
      khachHangPhong?.ngaySinh === null
    ) {
      return addToast(exampleToast('⚠️ Vui lòng nhập ngày sinh'))
    }

    // Kiểm tra xem ngày sinh có hợp lệ không
    try {
      const testDate = parse(khachHangPhong.ngaySinh, 'yyyy-MM-dd', new Date())
      if (!isValid(testDate)) {
        return addToast(
          exampleToast('⚠️ Ngày sinh không hợp lệ. Vui lòng nhập đúng định dạng dd/MM/yyyy'),
        )
      }
    } catch (error) {
      return addToast(
        exampleToast('⚠️ Ngày sinh không hợp lệ. Vui lòng nhập đúng định dạng dd/MM/yyyy'),
      )
    }

    if (khachHangPhong?.danhXung?.maDanhXung === 'Children') {
      if (!khachHangPhong?.soTuoiTre || khachHangPhong?.soTuoiTre === 0) {
        return addToast(exampleToast('⚠️ Chưa nhập số tuổi trẻ'))
      }
    } else {
      if (!khachHangPhong?.loaiGiayTo?.maLoaiGiayTo) {
        return addToast(exampleToast('⚠️ Chưa chọn Loại giấy tờ'))
      }

      if (!khachHangPhong?.soGiayTo) {
        return addToast(exampleToast('⚠️ Chưa Nhập Số giấy tờ'))
      }
    }

    if (khachHangPhong.loaiTreEm.maLoaiTreEm === '0') {
      return addToast(exampleToast('⚠️ Chưa chọn loại trẻ em'))
    }

    if (!khachHangPhong?.ho?.trim()) {
      return addToast(exampleToast('⚠️ Chưa nhập Họ và Tên đệm'))
    }

    if (!khachHangPhong?.ten?.trim()) {
      return addToast(exampleToast('⚠️ Chưa nhập Tên'))
    }

    if (!khachHangPhong.quocGia.maQuocGia) {
      return addToast(exampleToast('⚠️ Chưa chọn Quốc Tịch'))
    }

    if (!khachHangPhong.diaChi) {
      return addToast(exampleToast('⚠️ Chưa Nhập Địa Chỉ'))
    }

    // Kiểm tra tỉnh/thành phố
    if (!khachHangPhong.tinhThanh?.maTinh || khachHangPhong.tinhThanh.maTinh === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn Tỉnh/Thành phố'))
    }

    // Kiểm tra quận/huyện
    if (!khachHangPhong.huyen?.maHuyen || khachHangPhong.huyen.maHuyen === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn Quận/Huyện'))
    }

    // Kiểm tra phường/xã
    if (!khachHangPhong.phuongXa?.maPhuongXa || khachHangPhong.phuongXa.maPhuongXa === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn Phường/Xã'))
    }

    if (khachHangPhong.soTuoiTre === 0) {
      if (!khachHangPhong.loaiGiayTo.maLoaiGiayTo) {
        return addToast(exampleToast('⚠️ Chưa chọn Loại giấy tờ'))
      }

      if (!khachHangPhong.soGiayTo) {
        return addToast(exampleToast('⚠️ Chưa Nhập Số giấy tờ'))
      }
    }
    try {
      setTrangthaiload(true)

      console.log('gui', khachHangPhong)
      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await createKhachHangPhong(ma_xepphong_booking, khachHangPhong, navigate)

      console.log('Booking created successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast('❌ ' + response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))
        setKhachHangPhong(initialFormState)
        setDisplayDate('')
        setValueTinh(null)
        setValueHuyen(null)
        setValuePhungXa(null)
        setDataQR(null)
        setAn(true)
        LoadDanhSachKhachHangPhong(ma_xepphong_booking)
      }
    } catch (error) {
      console.error('Error:', error)

      setTrangthaiload(false)
      // 6. Xử lý lỗi khi gọi API
      if (error.response) {
        setTrangthaiload(false)
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

  const handleUpdate = async () => {
    console.log(khachHangPhong)

    if (
      ma_xepphong_booking === '' ||
      ma_xepphong_booking === null ||
      ma_xepphong_booking === undefined
    ) {
      return addToast(exampleToast('⚠️ Mã Xếp Phòng hiện tại đang không hợp lệ'))
    }

    if (!khachHangPhong.maKhachHangPhong) {
      return addToast(exampleToast('⚠️ Mã Khách Hàng trong Phòng hiện tại đang không hợp lệ'))
    }

    // 1. Kiểm tra các điều kiện form trước khi gọi API
    if (!khachHangPhong?.danhXung?.maDanhXung) {
      return addToast(exampleToast('⚠️ Chưa chọn danh xưng'))
    }

    // Cải thiện validation cho ngày sinh
    if (
      !khachHangPhong?.ngaySinh ||
      khachHangPhong?.ngaySinh === '' ||
      khachHangPhong?.ngaySinh === null
    ) {
      return addToast(exampleToast('⚠️ Vui lòng nhập ngày sinh'))
    }

    // Kiểm tra xem ngày sinh có hợp lệ không
    try {
      const testDate = parse(khachHangPhong.ngaySinh, 'yyyy-MM-dd', new Date())
      if (!isValid(testDate)) {
        return addToast(
          exampleToast('⚠️ Ngày sinh không hợp lệ. Vui lòng nhập đúng định dạng dd/MM/yyyy'),
        )
      }
    } catch (error) {
      return addToast(
        exampleToast('⚠️ Ngày sinh không hợp lệ. Vui lòng nhập đúng định dạng dd/MM/yyyy'),
      )
    }

    if (!khachHangPhong?.ho?.trim()) {
      return addToast(exampleToast('⚠️ Chưa nhập Họ và Tên đệm'))
    }

    if (!khachHangPhong?.ten?.trim()) {
      return addToast(exampleToast('⚠️ Chưa nhập Tên'))
    }

    if (!khachHangPhong.quocGia.maQuocGia) {
      return addToast(exampleToast('⚠️ Chưa chọn Quốc Tịch'))
    }

    if (!khachHangPhong.diaChi) {
      return addToast(exampleToast('⚠️ Chưa Nhập Địa Chỉ'))
    }

    // Kiểm tra tỉnh/thành phố
    if (!khachHangPhong.tinhThanh?.maTinh || khachHangPhong.tinhThanh.maTinh === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn Tỉnh/Thành phố'))
    }

    // Kiểm tra quận/huyện
    if (!khachHangPhong.huyen?.maHuyen || khachHangPhong.huyen.maHuyen === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn Quận/Huyện'))
    }

    // Kiểm tra phường/xã
    if (!khachHangPhong.phuongXa?.maPhuongXa || khachHangPhong.phuongXa.maPhuongXa === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn Phường/Xã'))
    }

    if (khachHangPhong.soTuoiTre === 0) {
      if (!khachHangPhong.loaiGiayTo.maLoaiGiayTo) {
        return addToast(exampleToast('⚠️ Chưa chọn Loại giấy tờ'))
      }

      if (!khachHangPhong.soGiayTo) {
        return addToast(exampleToast('⚠️ Chưa Nhập Số giấy tờ'))
      }
    }
    try {
      setTrangthaiload(true)

      console.log('gui', khachHangPhong)
      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await updateKhachHangPhong(ma_xepphong_booking, khachHangPhong, navigate)

      console.log('khachangphong update successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))
        LoadDanhSachKhachHangPhong(ma_xepphong_booking)
      }
    } catch (error) {
      console.error('Error:', error)

      setTrangthaiload(false)
      // 6. Xử lý lỗi khi gọi API
      if (error.response) {
        setTrangthaiload(false)
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

  const [thongtinKhachHangPhong, setThongtinKhachHangPhong] = useState({})
  const [valueTinh, setValueTinh] = useState(null)
  const [valueHuyen, setValueHuyen] = useState(null)
  const [valuePhuongXa, setValuePhungXa] = useState(null)
  const getKhachHang_PhongById = async (maKhachHangPhong) => {
    try {
      // Gọi API lấy thông tin booking
      const thongtin = await getKhachHangPhongById(maKhachHangPhong, navigate)

      console.log('thongtin', thongtin)
      if (thongtin) {
        // Gọi API lấy chi tiết booking

        if (thongtin.danhXung.maDanhXung === 'Children') {
          setAn(false)
        } else {
          setAn(true)
        }

        setThongtinKhachHangPhong(thongtin)
        setKhachHangPhong(thongtin)

        // Cập nhật displayDate nếu có ngày sinh
        if (thongtin.ngaySinh) {
          try {
            const displayDateValue = format(
              parse(thongtin.ngaySinh, 'yyyy-MM-dd', new Date()),
              'dd/MM/yyyy',
            )
            setDisplayDate(displayDateValue)
          } catch (error) {
            console.error('Error formatting display date:', error)
            setDisplayDate('')
          }
        } else {
          setDisplayDate('')
        }

        setIscheck(thongtin.gioiTinh.toString())
        setValueTinh({
          maTinh: thongtin.tinhThanh.maTinh,
          tenTinh: thongtin.tinhThanh.tenTinh,
        })

        const huyen = await getHuyenByMaTinh(thongtin.tinhThanh.maTinh, navigate)
        setDanhSachHuyen(huyen)
        huyen.forEach((h) => {
          if (h.maHuyen === thongtin.huyen.maHuyen) {
            setValueHuyen({
              maHuyen: thongtin.huyen.maHuyen,
              tenhuyen: thongtin.huyen.tenhuyen,
            })
          }
        })

        const phuongxa = await getlPhuongXaByMaHuyen(thongtin.huyen.maHuyen, navigate)
        setDanhSachPhuongXa(phuongxa)

        phuongxa.forEach((px) => {
          if (px.maPhuongXa === thongtin.phuongXa.maPhuongXa) {
            setValuePhungXa({
              maPhuongXa: thongtin.phuongXa.maPhuongXa,
              tenPhuongXa: thongtin.phuongXa.tenPhuongXa,
            })
          }
        })
      } else {
        addToast(
          exampleToast(
            '⚠️ Không thể tải chi tiết thông tin khách hàng trong phòng. Vui lòng thử lại sau!',
          ),
        )
      }
    } catch (error) {
      console.error('Lỗi khi tải  thông tin khách hàng trong phòng:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [tt_update, setTT_update] = useState(false)

  const handleClickHienThiThongTinKhacHangPhong = (maKhachHangPhong) => {
    console.log(maKhachHangPhong)
    if (maKhachHangPhong === '' || maKhachHangPhong === null || maKhachHangPhong === undefined) {
      addToast(exampleToast('⚠️ Mã thông tin không hợp lệ. Vui lòng thử lại sau!'))
    } else {
      getKhachHang_PhongById(maKhachHangPhong)

      setTT_update(true)
    }
  }

  const handleReSet = () => {
    setTT_update(false)
    setKhachHangPhong(initialFormState)
    setDisplayDate('')
    setValueTinh(null)
    setValueHuyen(null)
    setValuePhungXa(null)
  }

  const [visibleXoaThongTinKhachPhong, setVisibleXoaThongTinKhachPhong] = useState(false)
  const [ma_khachang_phong, setma_khachang_phong] = useState('')
  const handleClickHienThiXoa = (ma_khachang_phong) => {
    setVisibleXoaThongTinKhachPhong(true)
    setma_khachang_phong(ma_khachang_phong)
  }

  const ChoXuLyXoaThongTin = (data) => {
    if (data) {
      setVisibleXoaThongTinKhachPhong(false)
      LoadDanhSachKhachHangPhong(ma_xepphong_booking)
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

  const fileInputRef = useRef(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Hiển thị preview ảnh
    const imageUrl = URL.createObjectURL(file)
    setPreviewImage(imageUrl)

    // Reset form về trạng thái mặc định trước khi xử lý ảnh mới
    setKhachHangPhong(initialFormState)
    setDisplayDate('')
    setIscheck('0')
    setValueTinh(null)
    setValueHuyen(null)
    setValuePhungXa(null)
    setDataQR(null)
    setAn(true)

    setFileUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axiosInstance.post('/cccd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      })

      const data = response.data
      if (data && data.soCccd) {
        addToast(exampleToast('✔️ Đã đọc thành công thông tin từ CCCD'))
        await fillFormFromCCCDApi(data)
      } else {
        addToast(exampleToast('❌ Không nhận diện được thông tin CCCD từ ảnh.'))
      }
    } catch (err) {
      console.warn('Lỗi gọi API CCCD:', err)
      const msg = err.response?.data?.message || 'Không thể đọc thông tin từ ảnh CCCD.'
      addToast(exampleToast('❌ ' + msg))
    } finally {
      setFileUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const fillFormFromCCCDApi = async (data) => {
    try {
      const hoVaTen = data.hoVaTen || ''
      const nameParts = hoVaTen.trim().split(/\s+/)
      const ten = nameParts.pop() || ''
      const ho = nameParts.join(' ')

      let ngaySinhFormatted = ''
      if (data.ngaySinh) {
        const parts = data.ngaySinh.split('/')
        if (parts.length === 3) {
          ngaySinhFormatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }

      const cccdType = loaiGiayTo.find((type) =>
        type.tenLoaiGiaTo.toLowerCase().includes('cccd'),
      )

      const queQuan = data.queQuan || ''
      const queQuanParts = queQuan.split(',').map((p) => p.trim())
      const tenTinh = queQuanParts[queQuanParts.length - 1] || ''
      const rawHuyen = queQuanParts[queQuanParts.length - 2] || ''
      const tenHuyen = rawHuyen
        .replace(/^(H\.|Q\.|Huyện|Quận|TX\.|Thị xã|TP\.|Thành phố)\s*/i, '')
        .trim()
      const rawXa = queQuanParts[queQuanParts.length - 3] || ''
      const tenXa = rawXa
        .replace(/^(X\.|P\.|Xã|Phường|TT\.|Thị trấn)\s*/i, '')
        .trim()

      const isNam = data.gioiTinh === 'Nam'

      setKhachHangPhong((prev) => ({
        ...prev,
        ho: ho,
        ten: ten,
        ngaySinh: ngaySinhFormatted || prev.ngaySinh,
        diaChi: queQuan,
        soGiayTo: data.soCccd || '',
        gioiTinh: isNam ? '1' : '2',
        loaiGiayTo: cccdType || prev.loaiGiayTo,
        danhXung: {
          maDanhXung: isNam ? 'Mr' : 'Miss',
        },
      }))

      setIscheck(isNam ? '1' : '2')

      if (ngaySinhFormatted) {
        const dateObj = new Date(ngaySinhFormatted)
        if (!isNaN(dateObj.getTime())) {
          setDisplayDate(format(dateObj, 'dd/MM/yyyy'))
        }
      }

      if (tenTinh) {
        const tinhResult = await findAndSelectTinh(tenTinh)
        if (tinhResult?.tinh && tenHuyen) {
          const huyenResult = await findAndSelectHuyen(tenHuyen, tinhResult.tinh.maTinh)
          if (huyenResult?.huyen && tenXa) {
            await findAndSelectPhuongXa(tenXa, huyenResult.huyen.maHuyen)
          }
        }
      }

      addToast(exampleToast('✔️ Đã điền thành công thông tin từ CCCD'))
      setDataQR('')
    } catch (error) {
      console.error('Lỗi xử lý dữ liệu CCCD từ API:', error)
      addToast(exampleToast('❌ Lỗi khi điền dữ liệu CCCD vào form.'))
    }
  }

  const formatDate = (dateStr) => {
    try {
      // Kiểm tra định dạng ngày hợp lệ
      if (!dateStr || typeof dateStr !== 'string') {
        console.error('Ngày không hợp lệ:', dateStr)
        return null
      }

      // Xử lý cho định dạng DDMMYYYY
      if (dateStr.length === 8) {
        const day = dateStr.substring(0, 2)
        const month = dateStr.substring(2, 4)
        const year = dateStr.substring(4, 8)

        // Kiểm tra tính hợp lệ của ngày tháng
        const dayNum = parseInt(day, 10)
        const monthNum = parseInt(month, 10)
        const yearNum = parseInt(year, 10)

        if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
          console.error('Ngày tháng không phải số hợp lệ:', dateStr)
          return null
        }

        if (monthNum < 1 || monthNum > 12) {
          console.error('Tháng không hợp lệ:', monthNum)
          return null
        }

        if (dayNum < 1 || dayNum > 31) {
          console.error('Ngày không hợp lệ:', dayNum)
          return null
        }

        // Tạo chuỗi ngày theo định dạng YYYY-MM-DD
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

        // Kiểm tra xem ngày có hợp lệ không bằng cách parse
        const testDate = new Date(formattedDate)
        if (isNaN(testDate.getTime())) {
          console.error('Ngày không hợp lệ sau khi format:', formattedDate)
          return null
        }

        console.log('Ngày đã format:', formattedDate)
        return formattedDate
      }

      console.error('Định dạng ngày không hợp lệ:', dateStr)
      return null
    } catch (error) {
      console.error('Lỗi xử lý ngày tháng:', error)
      return null
    }
  }

  const parseCCCDData = (qrText) => {
    try {
      const parts = qrText.split('|')
      if (parts.length < 7) {
        console.error('Định dạng QR không hợp lệ:', qrText)
        return null
      }

      // Xử lý địa chỉ (phần tử thứ 6)
      const diaChi = parts[5]

      // Tách địa chỉ thành các phần
      const diaChiParts = diaChi.split(',').map((part) => part.trim())

      // Lấy phần cuối cùng là tên tỉnh
      const tenTinh = diaChiParts[diaChiParts.length - 1]

      // Lấy phần trước tỉnh là tên huyện (bỏ các tiền tố không cần thiết)
      const rawHuyen = diaChiParts[diaChiParts.length - 2] || ''
      const tenHuyen = rawHuyen
        .replace(/^(H\.|Q\.|Huyện|Quận|TX\.|Thị xã|TP\.|Thành phố)\s*/i, '')
        .trim()

      // Lấy phần trước huyện là tên xã (bỏ các tiền tố không cần thiết)
      const rawXa = diaChiParts[diaChiParts.length - 3] || ''
      const tenXa = rawXa.replace(/^(X\.|P\.|Xã|Phường|TT\.|Thị trấn)\s*/i, '').trim()

      console.log('Dữ liệu địa chỉ đã parse:', {
        diaChi,
        tenTinh,
        tenHuyen,
        tenXa,
      })

      return {
        cccd: parts[0],
        ho: parts[2].split(' ').slice(0, -1).join(' '),
        ten: parts[2].split(' ').pop(),
        ngaySinh: formatDate(parts[3]),
        gioiTinh: parts[4],
        diaChi,
        tenTinh,
        tenHuyen,
        tenXa,
      }
    } catch (error) {
      console.error('Lỗi xử lý dữ liệu CCCD:', error)
      return null
    }
  }

  const findAndSelectTinh = async (tenTinh) => {
    try {
      // Tìm tỉnh trong danh sách dựa vào tên
      const tinh = danhSachTinh.find((t) => t.tenTinh.toLowerCase().includes(tenTinh.toLowerCase()))

      if (tinh) {
        console.log('Đã tìm thấy tỉnh:', tinh)
        // Cập nhật select tỉnh
        setValueTinh(tinh)
        // Cập nhật form
        setKhachHangPhong((prev) => ({
          ...prev,
          tinhThanh: {
            maTinh: tinh.maTinh,
            tenTinh: tinh.tenTinh,
          },
        }))

        // Lấy danh sách huyện
        const huyenList = await DanhSachHuyen(tinh.maTinh)
        return { tinh, huyenList }
      } else {
        console.log('Không tìm thấy tỉnh:', tenTinh)
        return null
      }
    } catch (error) {
      console.error('Lỗi khi tìm và chọn tỉnh:', error)
      return null
    }
  }

  const findAndSelectHuyen = async (tenHuyen, maTinh) => {
    try {
      if (!tenHuyen || !maTinh) {
        console.log('Thiếu thông tin tên huyện hoặc mã tỉnh:', { tenHuyen, maTinh })
        return null
      }

      // Lấy danh sách huyện dựa vào mã tỉnh
      const huyenList = await getHuyenByMaTinh(maTinh, navigate)
      if (!huyenList?.length) {
        console.log('Không tìm thấy danh sách huyện cho mã tỉnh:', maTinh)
        return null
      }

      setDanhSachHuyen(huyenList)

      // Tìm huyện trong danh sách dựa vào tên
      const huyen = huyenList.find((h) => h.tenhuyen.toLowerCase().includes(tenHuyen.toLowerCase()))

      if (huyen) {
        console.log('Đã tìm thấy huyện:', huyen)
        // Cập nhật select huyện
        setValueHuyen(huyen)
        // Cập nhật form
        setKhachHangPhong((prev) => ({
          ...prev,
          huyen: {
            maHuyen: huyen.maHuyen,
            tenhuyen: huyen.tenhuyen,
          },
        }))

        // Lấy danh sách phường xã
        const phuongXaList = await DanhSacPhuongXa(huyen.maHuyen)
        return { huyen, phuongXaList }
      } else {
        console.log('Không tìm thấy huyện có tên:', tenHuyen)
        return null
      }
    } catch (error) {
      console.error('Lỗi khi tìm và chọn huyện:', error)
      return null
    }
  }

  const findAndSelectPhuongXa = async (tenXa, maHuyen) => {
    try {
      if (!tenXa || !maHuyen) {
        console.log('Thiếu thông tin tên xã hoặc mã huyện:', { tenXa, maHuyen })
        return null
      }

      // Lấy danh sách phường xã dựa vào mã huyện
      const phuongXaList = await getlPhuongXaByMaHuyen(maHuyen, navigate)
      if (!phuongXaList?.length) {
        console.log('Không tìm thấy danh sách phường xã cho mã huyện:', maHuyen)
        return null
      }

      setDanhSachPhuongXa(phuongXaList)

      // Tìm phường/xã trong danh sách dựa vào tên
      const phuongXa = phuongXaList.find((px) =>
        px.tenPhuongXa.toLowerCase().includes(tenXa.toLowerCase()),
      )

      if (phuongXa) {
        console.log('Đã tìm thấy phường/xã:', phuongXa)
        // Cập nhật select phường xã
        setValuePhungXa(phuongXa)
        // Cập nhật form
        setKhachHangPhong((prev) => ({
          ...prev,
          phuongXa: {
            maPhuongXa: phuongXa.maPhuongXa,
            tenPhuongXa: phuongXa.tenPhuongXa,
          },
        }))
        return phuongXa
      } else {
        console.log('Không tìm thấy phường/xã có tên:', tenXa)
        return null
      }
    } catch (error) {
      console.error('Lỗi khi tìm và chọn phường/xã:', error)
      return null
    }
  }

  const [dataQR, setDataQR] = useState(null)
  const inputRef = useRef(null) // Tạo tham chiếu đến ô input

  const handleScanInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onScanSuccessDataQR(dataQR)
    }
  }

  const onScanSuccessDataQR = async (decodedText) => {
    try {
      // Phân tích chuỗi QR từ CCCD
      const cccdData = parseCCCDData(decodedText)

      if (!cccdData) {
        addToast(exampleToast('❌ Không thể đọc dữ liệu từ mã QR. Vui lòng thử lại!'))
        return
      }

      // Kiểm tra ngày sinh hợp lệ
      const formattedDate = cccdData.ngaySinh
      if (!formattedDate) {
        addToast(exampleToast('⚠️ Ngày sinh không hợp lệ. Vui lòng kiểm tra lại!'))
      }

      // Tự động chọn loại giấy tờ CCCD nếu có trong danh sách
      const cccdType = loaiGiayTo.find((type) => type.tenLoaiGiaTo.toLowerCase().includes('cccd'))

      // Cập nhật form với dữ liệu từ CCCD
      setKhachHangPhong((prev) => ({
        ...prev,
        ho: cccdData.ho || '',
        ten: cccdData.ten || '',
        ngaySinh: formattedDate || prev.ngaySinh,
        diaChi: cccdData.diaChi || '',
        soGiayTo: cccdData.cccd || '',
        gioiTinh: cccdData.gioiTinh === 'Nam' ? '1' : '2',
        loaiGiayTo: cccdType || prev.loaiGiayTo,
      }))

      // Cập nhật giới tính radio button
      setIscheck(cccdData.gioiTinh === 'Nam' ? '1' : '2')

      // Tự động chọn tỉnh, huyện và phường xã
      if (cccdData.tenTinh) {
        const tinhResult = await findAndSelectTinh(cccdData.tenTinh)
        if (tinhResult?.tinh && cccdData.tenHuyen) {
          const huyenResult = await findAndSelectHuyen(cccdData.tenHuyen, tinhResult.tinh.maTinh)
          if (huyenResult?.huyen && cccdData.tenXa) {
            await findAndSelectPhuongXa(cccdData.tenXa, huyenResult.huyen.maHuyen)
          }
        }
      }

      addToast(exampleToast('✔️ Đã format thành công thông tin từ CCCD'))
      setDataQR('') // Xóa dữ liệu input sau khi xử lý thành công
    } catch (error) {
      console.error('Lỗi xử lý dữ liệu CCCD:', error)
      addToast(exampleToast('❌ Không thể đọc dữ liệu từ mã QR. Vui lòng thử lại!'))
    }
  }

  const onInputChangeSoTuoiTre = (e) => {
    const value = parseInt(e.target.value, 10)

    if (value === 0 || value < 0) {
      addToast(exampleToast('⚠️ Độ tuổi không hợp lệ. Vui lòng kiểm tra lại!'))
      return
    }
    if (value > 17) {
      addToast(exampleToast('⚠️ Độ tuổi không hợp lệ. Vui lòng kiểm tra lại!'))
      return
    }

    // Cập nhật mã loại trẻ em dựa vào độ tuổi
    let maLoaiTreEm = ''
    if (value >= 0 && value <= 5) {
      maLoaiTreEm = '2'
    } else if (value >= 6 && value <= 10) {
      maLoaiTreEm = '3'
    } else if (value >= 11 && value <= 17) {
      maLoaiTreEm = '4'
    }

    setKhachHangPhong((prev) => ({
      ...prev,
      soTuoiTre: e.target.value,
      loaiTreEm: {
        ...prev.loaiTreEm,
        maLoaiTreEm: maLoaiTreEm,
      },
    }))
  }

  const onInputChangeDanhXung = (e) => {
    const value = e.target.value
    console.log('value', value)
    if (value !== 'Children') {
      setAn(true)
      setKhachHangPhong((prev) => ({
        ...prev,
        soTuoiTre: '0',
        loaiTreEm: {
          maLoaiTreEm: 1,
        },
        loaiGiayTo: {
          maLoaiGiayTo: 'CCCD',
        },
      }))
    } else {
      setAn(false)
      setKhachHangPhong((prev) => ({
        ...prev,
        soTuoiTre: '',
        loaiGiayTo: {
          maLoaiGiayTo: 'KHONG',
        },
      }))
    }

    setKhachHangPhong((prev) => ({
      ...prev,
      danhXung: { ...prev.danhXung, maDanhXung: e.target.value },
    }))
  }

  const [an, setAn] = useState(true)

  const [visiblePhuongXaModal, setVisiblePhuongXaModal] = useState(false)

  const handleSubmitPhuongXa = async (data) => {
    if (data === true) {
      // Nếu đã chọn huyện thì load lại danh sách phường xã
      if (valueHuyen?.maHuyen) {
        await DanhSacPhuongXa(valueHuyen.maHuyen)
      }
    }
  }

  return (
    <CRow className="px-2">
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      <CCard>
        <CCardBody>
          <CRow>
            <CForm className=" needs-validation" onSubmit={handleSubmit}>
              <div className="relative mb-3">
                <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                  Thêm thông tin khách lưu trú{' '}
                  <span className="text-red-500">Phòng: {tenPhong}</span>
                </span>
                <div className="border-2 border-gray-500 rounded-md p-4">
                  <div className="mb-4 flex flex-wrap justify-start gap-2 items-center">
                    <CButton
                      color="primary"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={fileUploading}
                    >
                      <FontAwesomeIcon icon={faImage} className="me-2" />
                      {fileUploading ? 'Đang xử lý...' : 'Chọn ảnh CCCD'}
                    </CButton>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={fileUploading}
                    />

                    <CInputGroup className="max-w-4xl">
                      <CFormInput
                        type="text"
                        placeholder="Dữ liệu QR CCCD (nhập thủ công)"
                        value={dataQR}
                        ref={inputRef}
                        onChange={(e) => setDataQR(e.target.value)}
                        onKeyDown={handleScanInputKeyPress}
                        className="peer border border-gray-300 hover:!border-green-500 transition-colors duration-300"
                      />
                    </CInputGroup>
                  </div>

                  {(fileUploading || previewImage) && (
                    <div className="mb-4 flex gap-4 items-start">
                      {previewImage && (
                        <div className="relative">
                          <img
                            src={previewImage}
                            alt="Ảnh CCCD"
                            className="rounded-lg border shadow-sm"
                            style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'contain' }}
                          />
                          {!fileUploading && (
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              onClick={() => setPreviewImage(null)}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                      {fileUploading && (
                        <div className="flex items-center gap-2 py-4">
                          <CSpinner color="primary" size="sm" />
                          <span className="text-sm text-gray-600">
                            Đang nhận diện thông tin CCCD...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <CRow>
                    <CCol md={6}>
                      <CRow className="mb-3">
                        <CFormLabel className="col-sm-3 col-form-label labelcustome">
                          Tiêu đề <span className="text-danger"> *</span>
                        </CFormLabel>
                        <CCol sm={9}>
                          <CInputGroup>
                            <CFormSelect
                              className="w-4"
                              name="danhXung.maDanhXung"
                              value={khachHangPhong.danhXung.maDanhXung}
                              onChange={onInputChangeDanhXung}
                            >
                              <option value="0">Chọn </option>
                              {danhXung.map((item) => (
                                <option key={item.maDanhXung} value={item.maDanhXung}>
                                  {item.maDanhXung} - {item.tenDanhXung}
                                </option>
                              ))}
                            </CFormSelect>

                            <CFormInput
                              type="number"
                              className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                              name="soTuoiTre"
                              placeholder="Số tuổi trẻ"
                              value={khachHangPhong.soTuoiTre}
                              onChange={onInputChangeSoTuoiTre}
                              disabled={an}
                            />

                            <CFormSelect
                              className="w-4"
                              name="loaiTreEm.maLoaiTreEm"
                              value={khachHangPhong.loaiTreEm.maLoaiTreEm}
                              onChange={onInputChange}
                              disabled={an}
                            >
                              {loaiTreEm.map((item) => (
                                <option key={item.maLoaiTreEm} value={item.maLoaiTreEm}>
                                  {item.tenLoaiTreEm}
                                </option>
                              ))}
                            </CFormSelect>
                          </CInputGroup>
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-sm-3 col-form-label labelcustome"
                        >
                          Họ và tên <span className="text-danger"> *</span>
                        </CFormLabel>
                        <CCol sm={9}>
                          <CInputGroup>
                            <CFormInput
                              type="text"
                              className="peer border border-gray-300 hover:!border-green-500 transition-colors duration-300 !w-[140px]"
                              placeholder="Nhập họ và chữ đệm"
                              name="ho"
                              value={khachHangPhong.ho}
                              onChange={(e) => {
                                const formattedText = e.target.value
                                  .toLowerCase()
                                  .split(' ') // Tách thành từng từ
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu mỗi từ
                                  .join(' ') // Ghép lại thành chuỗi

                                onInputChange({ target: { name: 'ho', value: formattedText } })
                              }}
                            />

                            <CFormInput
                              type="text"
                              className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                              placeholder="Nhập tên"
                              name="ten"
                              value={khachHangPhong.ten}
                              onChange={(e) => {
                                const formattedText = e.target.value
                                  .toLowerCase()
                                  .split(' ') // Tách thành từng từ
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu mỗi từ
                                  .join(' ') // Ghép lại thành chuỗi

                                onInputChange({ target: { name: 'ten', value: formattedText } })
                              }}
                            />
                          </CInputGroup>
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-sm-3 col-form-label labelcustome"
                        >
                          Ngày sinh <span className="text-danger"> *</span>
                        </CFormLabel>
                        <CCol sm={9}>
                          <CFormInput
                            type="text"
                            placeholder="dd/MM/yyyy"
                            className="peer border border-gray-300 hover:!border-green-500 transition-colors duration-300 rounded-lg"
                            value={displayDate}
                            onChange={handleDateInputChange}
                            onBlur={(e) => {
                              // Validate khi blur
                              const inputValue = e.target.value
                              if (inputValue && inputValue.trim() !== '') {
                                try {
                                  const parsedDate = parse(inputValue, 'dd/MM/yyyy', new Date())
                                  if (!isValid(parsedDate)) {
                                    addToast(
                                      exampleToast(
                                        '⚠️ Định dạng ngày không hợp lệ. Vui lòng nhập dd/MM/yyyy',
                                      ),
                                    )
                                  }
                                } catch (error) {
                                  addToast(
                                    exampleToast(
                                      '⚠️ Định dạng ngày không hợp lệ. Vui lòng nhập dd/MM/yyyy',
                                    ),
                                  )
                                }
                              }
                            }}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CFormLabel htmlFor="inputPassword" className="col-sm-3  labelcustome">
                          Giới tính
                        </CFormLabel>
                        <CCol sm={9}>
                          <CFormCheck
                            inline
                            style={{ cursor: 'pointer' }}
                            type="radio"
                            name="inlineRadioOptions"
                            id="inlineCheckbox1"
                            label="Nam"
                            value={'1'}
                            checked={ischeck === '1'}
                            onChange={handleChangeGioTinh}
                          />
                          <CFormCheck
                            inline
                            type="radio"
                            style={{ cursor: 'pointer' }}
                            name="inlineRadioOptions"
                            id="inlineCheckbox2"
                            label="Nữ"
                            value={'2'}
                            checked={ischeck === '2'}
                            onChange={handleChangeGioTinh}
                          />
                          <CFormCheck
                            inline
                            type="radio"
                            style={{ cursor: 'pointer' }}
                            name="inlineRadioOptions"
                            id="inlineCheckbox2"
                            label="Khác"
                            value={'3'}
                            checked={ischeck === '3'}
                            onChange={handleChangeGioTinh}
                          />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CFormLabel className="col-sm-3 col-form-label labelcustome">
                          Điện thoại
                        </CFormLabel>
                        <CCol sm={9}>
                          <CFormInput
                            type="text"
                            placeholder="0912345678"
                            className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                            name="sdt"
                            value={khachHangPhong.sdt}
                            onChange={(e) => onInputChange(e)}
                          />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CFormLabel className="col-sm-3 col-form-label labelcustome">
                          Quốc tịch <span className="text-danger"> *</span>
                        </CFormLabel>
                        <CCol sm={9}>
                          <Select
                            getOptionValue={(option) => option.maQuocGia}
                            getOptionLabel={(option) => option.tenQuocGia}
                            options={quocGia}
                            name="quocGia.maQuocGia"
                            value={
                              quocGia.find(
                                (qg) => qg.maQuocGia === khachHangPhong?.quocGia?.maQuocGia,
                              ) || {
                                maQuocGia: '704',
                                tenQuocGia: 'Việt Nam',
                              }
                            }
                            onChange={(selectedOption) => {
                              setKhachHangPhong((prev) => ({
                                ...prev,
                                quocGia: selectedOption || {
                                  maQuocGia: '',
                                  tenQuocGia: '',
                                },
                              }))
                            }}
                          />
                        </CCol>
                      </CRow>
                    </CCol>
                    <CCol md={6}>
                      <CRow className="mb-3">
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-sm-3 col-form-label labelcustome"
                        >
                          Địa chỉ <span className="text-danger"> *</span>
                        </CFormLabel>
                        <CCol sm={9}>
                          <CFormInput
                            type="text"
                            className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                            name="diaChi"
                            value={khachHangPhong.diaChi}
                            onChange={(e) => onInputChange(e)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CFormLabel className="col-sm-3 col-form-label labelcustome">
                          Loại giấy tờ{' '}
                          {khachHangPhong.soTuoiTre === '0' ? (
                            <span className="text-danger"> *</span>
                          ) : (
                            ''
                          )}
                        </CFormLabel>
                        <CCol sm={9}>
                          <Select
                            getOptionValue={(option) => option.maLoaiGiayTo}
                            getOptionLabel={(option) => option.tenLoaiGiaTo}
                            options={loaiGiayTo}
                            placeholder={'Chọn loại giấy tờ'}
                            value={
                              loaiGiayTo.find(
                                (qg) => qg.maLoaiGiayTo === khachHangPhong.loaiGiayTo.maLoaiGiayTo,
                              ) || null
                            }
                            onChange={(selectedOption) => {
                              setKhachHangPhong((prev) => ({
                                ...prev,
                                loaiGiayTo: selectedOption || {
                                  maLoaiGiayTo: '',
                                  tenLoaiGiaTo: '',
                                },
                              }))
                            }}
                          />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-sm-3 col-form-label labelcustome"
                        >
                          Số giấy tờ{' '}
                          {khachHangPhong.soTuoiTre === '0' ? (
                            <span className="text-danger"> *</span>
                          ) : (
                            ''
                          )}
                        </CFormLabel>
                        <CCol sm={9}>
                          <CFormInput
                            type="text"
                            className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                            name="soGiayTo"
                            value={khachHangPhong.soGiayTo}
                            onChange={(e) => {
                              // Giới hạn tối đa 12 ký tự
                              const value = e.target.value.slice(0, 12)
                              onInputChange({ target: { name: 'soGiayTo', value } })
                            }}
                            maxLength={12}
                          />
                        </CCol>
                      </CRow>

                      <CRow className="mb-3">
                        <CFormLabel
                          htmlFor="inputPassword"
                          className="col-sm-3 col-form-label labelcustome"
                        >
                          Ghi chú
                        </CFormLabel>
                        <CCol sm={9}>
                          <CFormTextarea
                            className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300 mb-3"
                            placeholder="Nhập ghi chú ..."
                            aria-label="Disabled textarea example"
                            name="ghiChu"
                            value={khachHangPhong.ghiChu}
                            onChange={(e) => onInputChange(e)}
                          ></CFormTextarea>
                        </CCol>
                      </CRow>
                    </CCol>
                  </CRow>
                  <CRow className="mb-4">
                    <CCol sm={4}>
                      <CFormLabel
                        htmlFor="inputPassword"
                        className="col-sm-4 col-form-label labelcustome"
                      >
                        TP/Tỉnh <span className="text-danger"> *</span>
                      </CFormLabel>
                      <Select
                        getOptionValue={(option) => option.maTinh}
                        getOptionLabel={(option) => option.tenTinh}
                        // value={nhomKhachHang.find(
                        //   (option) =>
                        //     option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                        // )}
                        options={danhSachTinh}
                        onChange={handleChangeTinhThanh}
                        placeholder={'Chọn TP/Tỉnh'}
                        value={valueTinh}
                      />
                    </CCol>
                    <CCol sm={4}>
                      <CFormLabel
                        htmlFor="inputPassword"
                        className="col-sm-4 col-form-label labelcustome"
                      >
                        Quận/Huyện <span className="text-danger"> *</span>
                      </CFormLabel>
                      <Select
                        getOptionValue={(option) => option.maHuyen}
                        getOptionLabel={(option) => option.tenhuyen}
                        // value={nhomKhachHang.find(
                        //   (option) =>
                        //     option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                        // )}
                        options={danhSachHuyen}
                        onChange={handleChangeHuyen}
                        placeholder={'Chọn Quận/Huyện'}
                        value={valueHuyen}
                      />
                    </CCol>
                    <CCol sm={4}>
                      <CRow>
                        <CCol md={8}>
                          <CFormLabel
                            htmlFor="inputPassword"
                            className="col-sm-6 col-form-label labelcustome"
                          >
                            Phường xã <span className="text-danger"> *</span>
                          </CFormLabel>
                        </CCol>
                        <CCol className="text-end " onClick={() => setVisiblePhuongXaModal(true)}>
                          <CTooltip content="Thêm phường xã" placement="left">
                            <FontAwesomeIcon
                              icon={faPlus}
                              className="text-blue-500 font-bold cursor-pointer"
                            />
                          </CTooltip>
                        </CCol>
                      </CRow>

                      <Select
                        getOptionValue={(option) => option.maPhuongXa}
                        getOptionLabel={(option) => option.tenPhuongXa}
                        options={danhSachPhuongXa}
                        placeholder={'Chọn Phường xã'}
                        onChange={(selectedOption) => {
                          // Cập nhật giá trị cho Select
                          //setValueNhomKH(selectedOption)
                          setValuePhungXa(selectedOption)

                          // Cập nhật booKing với thông tin nhóm khách hàng mới
                          setKhachHangPhong((prev) => ({
                            ...prev,
                            phuongXa: {
                              maPhuongXa: selectedOption?.maPhuongXa || '',
                              tenPhuongXa: selectedOption?.tenPhuongXa || '',
                            },
                          }))
                        }}
                        value={valuePhuongXa}
                      />
                    </CCol>
                  </CRow>
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
                            onClick={handleUpdate}
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
                  {/* <CCol className=" d-md-flex justify-content-md-end">
                    <CButton
                      color="success"
                      // onClick={handleAddRow}
                      variant="outline"
                      className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
                    >
                      <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                      Thêm khách hàng
                    </CButton>
                  </CCol> */}
                </div>
              </div>

              <div className="relative mb-3">
                <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                  Dach sách khách hàng <span className="text-red-500">Phòng: {tenPhong}</span>
                </span>
                <div className="border-2 border-gray-500 rounded-md p-4 ">
                  <CTable align="middle" responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell scope="col">Mã khách</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tiêu đề</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Họ</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Tên</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Trẻ em</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Ngày sinh</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Quốc tịch</CTableHeaderCell>
                        <CTableHeaderCell scope="col"></CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {loading ? (
                        <CTableRow>
                          <CTableDataCell colSpan="9">Đang tải...</CTableDataCell>
                        </CTableRow>
                      ) : danhSachKhacHangPhong.length > 0 ? (
                        danhSachKhacHangPhong.map((item) => (
                          <CTableRow key={item.maKhachHangPhong}>
                            <CTableDataCell>{item.maKhachHangPhong}</CTableDataCell>
                            <CTableDataCell>{item.danhXung.maDanhXung}</CTableDataCell>
                            <CTableDataCell>{item.ho}</CTableDataCell>
                            <CTableDataCell>{item.ten}</CTableDataCell>
                            <CTableDataCell>{item.soTuoiTre}</CTableDataCell>
                            <CTableDataCell>
                              {' '}
                              {item.ngaySinh
                                ? format(parseISO(item.ngaySinh), 'dd/MM/yyyy')
                                : 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>{item.quocGia.tenQuocGia}</CTableDataCell>
                            <CTableDataCell>
                              <FontAwesomeIcon
                                icon={faPenToSquare}
                                className="me-3 text-warning cursor-pointer"
                                onClick={() =>
                                  handleClickHienThiThongTinKhacHangPhong(item.maKhachHangPhong)
                                }
                              />
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="text-danger cursor-pointer"
                                onClick={() => handleClickHienThiXoa(item.maKhachHangPhong)}
                              />
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      ) : (
                        <CTableRow>
                          <CTableDataCell colSpan="9">
                            <h4>Chưa có thông tin khách</h4>
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                </div>
              </div>
            </CForm>
          </CRow>
        </CCardBody>
      </CCard>

      <XoaThongTinKhach_Phong
        visible={visibleXoaThongTinKhachPhong}
        onClose={() => setVisibleXoaThongTinKhachPhong(false)}
        ma_khachhang_phong={ma_khachang_phong}
        onSubmit={ChoXuLyXoaThongTin}
      />

      <PhuongXaModal
        visible={visiblePhuongXaModal}
        onClose={() => setVisiblePhuongXaModal(false)}
        onSubmit={handleSubmitPhuongXa}
      />
    </CRow>
  )
}

export default AddGuestToRoom
