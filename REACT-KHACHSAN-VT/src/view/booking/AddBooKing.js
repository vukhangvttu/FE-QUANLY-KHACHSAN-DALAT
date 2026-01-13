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
  CPopover,
} from '@coreui/react-pro'
import { faCirclePlus, faDeleteLeft, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import {
  getAllDanhXung,
  getAllGiamGia,
  getAllHinhThucThanhToan,
  getAllKhuVuc,
  getAllLoaiThe,
  getAllMucDichDen,
  getAllNguonKhach,
  getAllThiTruong,
  getAllTrangThaiBooKing,
  getAllYeuCau,
} from 'src/service/APIService'

import { getAllLoaiPhongTrongTrongKhoanThoiGian } from 'src/service/LoaiPhongService'
import { getAllNhomKhachHang } from 'src/service/NhomKhachHang'
import { createBooking } from 'src/service/BooKingService'
import CurrencyInput from 'react-currency-input-field'
import { getAllGiaPhongTheoThoiGian } from 'src/service/GiaPhongService'
import { getListPhongTrongTheoKhoanThoiGian } from 'src/service/PhongService'

const ThemDatPhong = () => {
  const [rows, setRows] = useState([])

  // Thêm dòng mới
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        index: rows.length + 1,
        ngayDen: format(valueNgayDen, 'dd/MM/yyyy'), // Chuyển Date thành chuỗi YYYY-MM-DD
        gioDen: '14:00',
        ngayDi: format(valueNgayDi, 'dd/MM/yyyy'),
        gioDi: '12:00',
        loaiPhong: '0',
        soLuongDuBaoPhong: 0,
        tongSoLuongExtraBed: 0,
        tongSoLuongExtraBedDaSuDung: 0,
        soLuongExtraBed: 0,
        soLuong: 1,
        nguoiLon: 1,
        treEm: 0,
        giaPhuThuTreEm: 0, // Thêm phụ thu trẻ em
        soLuongPhuThuTreEm: 0, // Thêm số lượng trẻ em
        soLuongPhuThuAnSang: 0, // Thêm số lượng ăn sáng
        giaPhuThuAnSang: 0, // Thêm giá ăn sáng
        danhSachPhongChiTiets: [],
        maGia: '0',
        maGiaPhong: 0,
        gia: 0,
        giaPhongTheoNgays: [],
        giaExtraBed: 0,
        ghiChu: '',
      },
    ])
    setTongSoLuong(tongSoLuong + 1)
    setTongNguoiLon(tongNguoiLon + 1)

    kiemTraPhongTrong(valueNgayDen, valueNgayDi)
  }

  // Xóa dòng theo index và cập nhật lại các giá trị tổng
  const handleRemoveRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)

    // Tính tổng số lượng, người lớn, trẻ em và tổng tiền sau khi xóa
    const tongSoLuong = updatedRows.reduce((sum, row) => sum + (row.soLuong || 0), 0)
    const tongNguoiLon = updatedRows.reduce((sum, row) => sum + (row.nguoiLon || 0), 0)
    const tongTreEm = updatedRows.reduce((sum, row) => sum + (row.treEm || 0), 0)
    const tongTienTatCa = updatedRows.reduce(
      (sum, row) => sum + (row.gia || 0) * (row.soLuong || 0),
      0,
    )

    // Tính số tiền của dòng bị xóa
    const rowToDelete = rows[index]
    const tienDongXoa = (rowToDelete.gia || 0) * (rowToDelete.soLuong || 0)

    // Cập nhật tongTienKhachCanTra bằng cách trừ đi số tiền của dòng bị xóa
    const newTongTienKhachCanTra = Math.max(tongTienKhachCanTra - tienDongXoa, 0)

    console.log('Tổng số lượng:', tongSoLuong)
    console.log('Tổng người lớn:', tongNguoiLon)
    console.log('Tổng trẻ em:', tongTreEm)
    console.log('Tổng tiền tất cả:', tongTienTatCa)
    console.log('Tiền dòng xóa:', tienDongXoa)
    console.log('Tổng tiền khách cần trả mới:', newTongTienKhachCanTra)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật các state
    setTongSoLuong(tongSoLuong)
    setTongNguoiLon(tongNguoiLon)
    setTongTreEm(tongTreEm)
    setTongTien(tongTienTatCa)
    setTongTienKhachCanTra(newTongTienKhachCanTra)
  }

  // 1. Các hàm xử lý ngày tháng
  const getTomorrowAtNoon = (date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 1)
    newDate.setHours(12, 0, 0, 0)
    return newDate
  }

  // Hàm helper để chuyển đổi định dạng ngày tháng
  const formatDateToISO = (dateInput) => {
    if (!dateInput) return null

    // Nếu đã là Date object
    if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0] // YYYY-MM-DD
    }

    // Nếu là chuỗi dd/MM/yyyy
    if (typeof dateInput === 'string' && dateInput.includes('/')) {
      const [day, month, year] = dateInput.split('/')
      if (!day || !month || !year) return null
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // Nếu đã là YYYY-MM-DD
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      return dateInput
    }

    return null
  }

  const formatDateToDisplay = (dateInput) => {
    if (!dateInput) return ''

    // Nếu đã là Date object
    if (dateInput instanceof Date) {
      return format(dateInput, 'dd/MM/yyyy')
    }

    // Nếu là chuỗi YYYY-MM-DD
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const [year, month, day] = dateInput.split('-')
      return `${day}/${month}/${year}`
    }

    // Nếu đã là dd/MM/yyyy
    if (typeof dateInput === 'string' && dateInput.includes('/')) {
      return dateInput
    }

    return ''
  }

  const createDateFromInput = (dateInput) => {
    if (!dateInput) return new Date()

    // Nếu đã là Date object
    if (dateInput instanceof Date) {
      return new Date(dateInput)
    }

    // Chuyển về ISO format trước khi tạo Date
    const isoDate = formatDateToISO(dateInput)
    if (isoDate) {
      return new Date(isoDate)
    }

    return new Date()
  }

  const formatDate = (dateString) => {
    return formatDateToISO(dateString)
  }

  const date = new Date()
  const [valueNgayDen, setValueNgayDen] = useState(new Date())

  // set mặc định ngày tiếp theo
  const [valueNgayDi, setValueNgayDi] = useState(getTomorrowAtNoon(date))

  const handleDateChangeNgayDen = (date, index) => {
    if (date !== null) {
      setValueNgayDen(date)

      setBooKing((prev) => ({
        ...prev,
        ngayDen: formatDateToISO(date),
      }))

      const updatedRows = rows.map((row, i) => {
        if (i === index) {
          const ngayDen = new Date(date)
          const ngayDi = createDateFromInput(row.ngayDi)

          ngayDen.setHours(0, 0, 0, 0)
          ngayDi.setHours(0, 0, 0, 0)

          let adjustedNgayDi = ngayDi
          if (ngayDen.getTime() >= ngayDi.getTime()) {
            adjustedNgayDi = new Date(ngayDen)
            adjustedNgayDi.setDate(adjustedNgayDi.getDate() + 1)
            adjustedNgayDi.setHours(12, 0, 0, 0)
            // addToast(exampleToast('⚠️ Tự động điều chỉnh ngày đi thành ngày đến + 1'))
          }

          // Luôn trả về object mới, cập nhật cả ngày đến và ngày đi
          return {
            ...row,
            ngayDen: formatDateToISO(date),
            ngayDi: formatDateToISO(adjustedNgayDi),
          }
        }
        return { ...row } // Trả về object mới cho các row khác để đảm bảo re-render
      })

      setRows(updatedRows)
      updateChiTietBooKings(updatedRows)
      updateTongTien(updatedRows)

      // Kiểm tra phòng trống với ngày mới
      const currentRow = updatedRows[index]
      if (currentRow) {
        const ngayDen = createDateFromInput(currentRow.ngayDen)
        const ngayDi = createDateFromInput(currentRow.ngayDi)

        kiemTraPhongTrong(ngayDen, ngayDi)
      }
    }
  }

  const handleDateChangeNgayDi = (date, index) => {
    console.log('Ngày được chọn:', date, index)
    if (date !== null) {
      setValueNgayDi(date)
      setBooKing((prev) => ({
        ...prev,
        ngayDi: formatDateToISO(date), // Sử dụng helper function
      }))

      console.log('rows trước khi update', rows)

      const updatedRows = rows.map((row, i) => {
        if (i === index) {
          const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
          const ngayDi = new Date(date)
          const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

          let giaPhongTheoNgays = []

          // for (let i = 0; i < soDem; i++) {
          //   const currentDate = new Date(ngayDen)
          //   currentDate.setDate(currentDate.getDate() + i)
          //   const ngayStr = currentDate.toISOString().split('T')[0]

          //   const giaDaSet = row.giaPhongTheoNgays?.find((g) => g.ngay === ngayStr)?.gia
          //   const giaNgay = giaDaSet || getGiaTheoLoaiNgay(row.loaiPhong, currentDate)

          //   giaPhongTheoNgays.push({
          //     maLoaiPhong: row.loaiPhong,
          //     ngay: ngayStr,
          //     gia: giaNgay,
          //   })
          // }

          return {
            ...row,
            ngayDi: formatDateToDisplay(date), // Sử dụng helper function
            giaPhongTheoNgays: giaPhongTheoNgays,
          }
        }
        console.log('row sau khi update', row)
        return row
      })

      setRows(updatedRows)
      updateTongTien(updatedRows)

      if (valueNgayDen) {
        kiemTraPhongTrong(valueNgayDen, date)
      }
    }
  }

  // 2. Các hàm xử lý giá và tính toán
  const getGiaOptions = (maLoaiPhong) => {
    return giaPhong
      .filter((giaPhong) => giaPhong.maLoaiPhong === maLoaiPhong)
      .map((giaPhong) => ({
        maLoaiGia: giaPhong.maLoaiGia,
        tenLoaiGia: giaPhong.tenLoaiGia,
        maGiaPhong: giaPhong.maGiaPhong,
        gia: giaPhong.gia,
        giaNgayThuong: giaPhong.giaNgayThuong,
        giaCuoiTuan: giaPhong.giaCuoiTuan,
        giaGiuong: giaPhong.giaGiuong,
        giaNgayLe: giaPhong.giaNgayLe,
      }))
  }

  const getDefaultGia = (maLoaiPhong) => {
    const options = getGiaOptions(maLoaiPhong)
    const isSaturday = new Date().getDay() === 6

    if (isSaturday) {
      const weekendPrice = options.find((option) => option.giaCuoiTuan)
      return weekendPrice
        ? {
            maLoaiGia: weekendPrice.maLoaiGia,
            gia: weekendPrice.gia,
            maGiaPhong: weekendPrice.maGiaPhong,
          }
        : { maLoaiGia: '0', gia: 0, maGiaPhong: 0 }
    }
    const weekdayPrice = options.find((option) => option.giaNgayThuong)
    return weekdayPrice
      ? {
          maLoaiGia: weekdayPrice.maLoaiGia,
          gia: weekdayPrice.gia,
          maGiaPhong: weekdayPrice.maGiaPhong,
        }
      : { maLoaiGia: '0', gia: 0, maGiaPhong: 0 }
  }

  const handleGiaExtraChange = (value, index) => {
    const row = rows[index]
    if (!row) return

    // Nếu giá trị không thay đổi, không cần cập nhật
    if (value === row.giaExtraBed) return

    if (!value) {
      value = '0'
    }
    const rawValue = value.toString().replace(/[^\d]/g, '')
    if (!isNaN(rawValue)) {
      const numericValue = Math.max(0, Number(rawValue))
      const updatedRows = [...rows]
      const row = updatedRows[index]

      const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
      const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
      const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

      // Chỉ kiểm tra số lượng extra bed khi giá trị thực sự thay đổi
      if (numericValue !== Number(row.giaExtraBed) && row.soLuongExtraBed === 0) {
        addToast(exampleToast('⚠️ Số lượng Extra Bed không được nhỏ hơn 0!'))
        return
      }

      const tienPhongThuong = (row.gia || 0) * (row.soLuong || 0) * soDem
      const tienExtraBed = numericValue * (row.soLuongExtraBed || 0) * soDem
      const tongTienDong = tienPhongThuong + tienExtraBed

      updatedRows[index] = {
        ...updatedRows[index],
        giaExtraBed: numericValue.toString(),
        tongTienDong,
      }
      updateTongTien(updatedRows)
    }
  }

  // 4. Các hàm xử lý thay đổi số lượng
  const handleSoLuongChange = (event, index) => {
    let value = event.target.value
    const row = rows[index]
    if (row.loaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    const selectedLoaiPhong = listLoaiPhongTrong.find((item) => item.maLoaiPhong === row.loaiPhong)
    if (!selectedLoaiPhong) return

    // Tính tổng số phòng đã chọn của tất cả các dòng cùng loại phòng
    const tongSoPhongDaChon = rows.reduce((total, r) => {
      if (r.loaiPhong === row.loaiPhong) {
        return total + (r.soPhongDaChon?.length || 0)
      }
      return total
    }, 0)

    // Tính số phòng đã chọn của các dòng khác (trừ dòng hiện tại)
    const soPhongDaChonKhac = tongSoPhongDaChon - (row.soPhongDaChon?.length || 0)

    // Kiểm tra nếu số lượng mới nhỏ hơn số phòng đã chọn
    if (value < (row.soPhongDaChon?.length || 0)) {
      addToast(
        exampleToast(
          `⚠️ Đang có ${row.soPhongDaChon?.length} phòng được chọn. Vui lòng bỏ chọn phòng trước khi giảm số lượng!`,
        ),
      )
      event.target.value = row.soLuong
      return
    }

    // Tính tổng số lượng của tất cả các dòng cùng loại phòng (trừ dòng hiện tại)
    const tongSoLuongKhac = rows.reduce((total, r) => {
      if (r.loaiPhong === row.loaiPhong && r.index !== row.index) {
        return total + (r.soLuong || 0)
      }
      return total
    }, 0)

    // Kiểm tra tổng số lượng không vượt quá dự báo
    const tongSoLuongMoi = tongSoLuongKhac + Number(value)
    if (tongSoLuongMoi > selectedLoaiPhong.soPhongTrong) {
      addToast(
        exampleToast(
          `⚠️ Tổng số lượng của loại phòng ${selectedLoaiPhong.tenLoaiPhong} không được vượt quá ${selectedLoaiPhong.soPhongTrong} phòng!`,
        ),
      )
      event.target.value = row.soLuong
      return
    }

    // Kiểm tra tổng số phòng đã chọn không vượt quá số phòng trống
    const maxSoLuong = selectedLoaiPhong.soPhongTrong - soPhongDaChonKhac
    if (value > maxSoLuong) {
      addToast(exampleToast(`⚠️ Chỉ còn ${maxSoLuong} phòng trống. Không thể đặt nhiều hơn!`))
      value = maxSoLuong
    }

    value = isNaN(value) || value < 0 ? 0 : Number(value)
    const updatedRows = [...rows]
    const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
    const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
    const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))
    const tongTienDong = (row.gia || 0) * value * soDem

    updatedRows[index] = {
      ...updatedRows[index],
      soLuong: value,
      tongTienDong,
    }

    const tongSoLuongTatCa = updatedRows.reduce((sum, row) => sum + (row.soLuong || 0), 0)
    setTongSoLuong(tongSoLuongTatCa)
    updateTongTien(updatedRows)
  }

  const handleSoLuongExtraBedChange = (event, index, tongSoLuongExtraBed, soLuong) => {
    let value = event.target.value
    if (rows[index].loaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    const selectedLoaiPhong = listLoaiPhongTrong.find(
      (item) => item.maLoaiPhong === rows[index].loaiPhong,
    )
    if (!selectedLoaiPhong) return

    if (value > tongSoLuongExtraBed) {
      addToast(
        exampleToast(`⚠️ Chỉ còn ${tongSoLuongExtraBed} phòng trống. Không thể đặt nhiều hơn!`),
      )
      value = tongSoLuongExtraBed
    }
    if (value < 0) {
      addToast(exampleToast('⚠️ Số lượng không được âm!'))
      value = 0
    }
    if (value > soLuong) {
      addToast(exampleToast('⚠️ Số lượng không được lớn hơn số phòng!'))
      value = soLuong
    }

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      soLuongExtraBed: parseInt(value),
    }
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // 5. Các hàm xử lý thay đổi người lớn và trẻ em
  const handleSLNguoiLonChange = (event, index) => {
    let value = event.target.value
    const row = rows[index]
    if (row.loaiPhong === '0') {
      return addToast(exampleToast('Vui lòng chọn loại phòng trước khi thay đổi'))
    }
    value = isNaN(value) || value < 0 ? 0 : Number(value)

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      nguoiLon: value,
    }

    const tongSoNguoiLonTatCa = updatedRows.reduce((sum, row) => sum + (row.nguoiLon || 0), 0)
    setTongNguoiLon(tongSoNguoiLonTatCa)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  const handleSLTreEmChange = (event, index) => {
    let value = event.target.value
    const row = rows[index]
    if (row.loaiPhong === '0') {
      return addToast(exampleToast('Vui lòng chọn loại phòng trước khi thay đổi'))
    }
    value = isNaN(value) || value < 0 ? 0 : Number(value)

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      treEm: value,
    }

    const tongSoTreEmTatCa = updatedRows.reduce((sum, row) => sum + (row.treEm || 0), 0)
    setTongTreEm(tongSoTreEmTatCa)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // Hàm xử lý thay đổi phụ thu trẻ em
  const handlegiaPhuThuTreEmChange = (input, index) => {
    let value
    const row = rows[index]

    // Xử lý input có thể là event hoặc value trực tiếp
    if (input && input.target) {
      // Nếu là event từ CFormInput
      value = input.target.value
    } else {
      // Nếu là value trực tiếp từ CurrencyInput
      value = input
    }

    if (row.loaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    value = isNaN(value) || value < 0 ? 0 : Number(value)

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      giaPhuThuTreEm: value,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // Hàm xử lý thay đổi số lượng trẻ em
  const handlesoLuongPhuThuTreEmChange = (input, index) => {
    let value
    const row = rows[index]

    // Xử lý input có thể là event hoặc value trực tiếp
    if (input && input.target) {
      // Nếu là event từ CFormInput
      value = input.target.value
    } else {
      // Nếu là value trực tiếp từ CurrencyInput
      value = input
    }

    if (row.loaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    value = isNaN(value) || value < 0 ? 0 : Number(value)

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      soLuongPhuThuTreEm: value,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // Hàm xử lý thay đổi số lượng ăn sáng
  const handlesoLuongPhuThuAnSangChange = (input, index) => {
    let value
    const row = rows[index]

    // Xử lý input có thể là event hoặc value trực tiếp
    if (input && input.target) {
      // Nếu là event từ CFormInput
      value = input.target.value
    } else {
      // Nếu là value trực tiếp từ CurrencyInput
      value = input
    }

    if (row.loaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    value = isNaN(value) || value < 0 ? 0 : Number(value)

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      soLuongPhuThuAnSang: value,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // Hàm xử lý thay đổi giá phụ thu ăn sáng
  const handlegiaPhuThuAnSangChange = (input, index) => {
    let value
    const row = rows[index]

    // Xử lý input có thể là event hoặc value trực tiếp
    if (input && input.target) {
      // Nếu là event từ CFormInput
      value = input.target.value
    } else {
      // Nếu là value trực tiếp từ CurrencyInput
      value = input
    }

    if (row.loaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    value = isNaN(value) || value < 0 ? 0 : Number(value)

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      giaPhuThuAnSang: value,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // 6. Các hàm xử lý thay đổi loại phòng và giá
  const handleLoaiPhongChange = (event, index) => {
    const newLoaiPhong = event.target.value

    const defaultGia = getDefaultGia(newLoaiPhong)
    const selectedLoaiPhong = listLoaiPhongTrong.find((item) => item.maLoaiPhong === newLoaiPhong)

    const updatedRows = [...rows]
    const row = updatedRows[index]

    // Tính toán giaPhongTheoNgays
    const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
    const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
    const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

    let giaPhongTheoNgays = []
    let tongTienPhong = 0

    for (let i = 0; i < soDem; i++) {
      const currentDate = new Date(ngayDen)
      currentDate.setDate(currentDate.getDate() + i)
      const ngayStr = currentDate.toISOString().split('T')[0]
      const giaNgay = getGiaTheoLoaiNgay(newLoaiPhong, currentDate)
      tongTienPhong += giaNgay

      giaPhongTheoNgays.push({
        maLoaiPhong: newLoaiPhong,
        ngay: ngayStr,
        gia: giaNgay,
      })
    }

    updatedRows[index] = {
      ...updatedRows[index],
      loaiPhong: newLoaiPhong,
      soLuongDuBaoPhong: selectedLoaiPhong ? selectedLoaiPhong.soPhongTrong : 0,
      tongSoLuongExtraBed: selectedLoaiPhong ? selectedLoaiPhong.tongSoGiuongThem : 0,
      tongSoLuongExtraBedDaSuDung: selectedLoaiPhong ? selectedLoaiPhong.tongSoGiuongDaSuDung : 0,
      maGia: defaultGia.maLoaiGia,
      gia: tongTienPhong,
      maGiaPhong: defaultGia.maGiaPhong,
      soPhongDaChon: [],
      giaPhongTheoNgays: giaPhongTheoNgays,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
    updateTongTien(updatedRows)
    fetchPhongOptions(newLoaiPhong)
  }

  const handleLoaiGiaChange = (event, index) => {
    const selectedMaGiaPhong = event.target.value
    const selectedGia =
      getGiaOptions(rows[index].loaiPhong).find(
        (option) => option.maLoaiGia.toString() === selectedMaGiaPhong,
      )?.gia || 0

    const maGiaPhong =
      getGiaOptions(rows[index].loaiPhong).find(
        (option) => option.maLoaiGia.toString() === selectedMaGiaPhong,
      )?.maGiaPhong || 0

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      maGia: selectedMaGiaPhong,
      gia: selectedGia.toString(),
      maGiaPhong: maGiaPhong,
    }

    updateTongTien(updatedRows)
  }

  // 7. Các hàm xử lý phòng
  const handleSoPhongChange = (selectedOptions, index) => {
    const row = rows[index]
    if (!row) return

    // Kiểm tra trùng phòng với tất cả các dòng khác (không phân biệt loại phòng)
    const selectedPhongIds = selectedOptions.map((option) => option.maPhong)
    const isDuplicatePhong = rows.some((otherRow, otherIndex) => {
      // Bỏ qua dòng hiện tại
      if (otherIndex === index) return false

      // Kiểm tra xem có phòng nào trùng với dòng khác không
      return otherRow.soPhongDaChon?.some((phong) => selectedPhongIds.includes(phong.maPhong))
    })

    if (isDuplicatePhong) {
      addToast(exampleToast('⚠️ Phòng đã được chọn ở dòng khác! Vui lòng chọn phòng khác.'))
      return
    }

    // Tính số phòng thường và extra chỉ cho dòng hiện tại

    const soPhongExtra = selectedOptions.filter((opt) => opt.soGiuongThem === 1).length

    if (selectedOptions.length > row.soLuong) {
      addToast(exampleToast('⚠️ Số phòng chọn không được vượt quá số lượng!'))
      return
    }

    // Kiểm tra số lượng phòng extra chỉ khi đang thêm phòng mới
    if (selectedOptions.length > (row.danhSachPhongChiTiets?.length || 0)) {
      if (soPhongExtra < row.soLuongExtraBed && row.soLuongExtraBed > 0) {
        addToast(exampleToast('⚠️ Số phòng Extra chọn không được nhỏ quá số lượng Extra Bed!'))
        return
      }
    }

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      soPhongDaChon: selectedOptions,
    }
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  // 8. Các hàm xử lý tổng tiền và cập nhật
  const updateTongTien = (updatedRows) => {
    const tongTienTatCa = updatedRows.reduce((sum, row) => sum + (row.tongTienDong || 0), 0)
    setTongTien(tongTienTatCa)
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

  const updateChiTietBooKings = (updatedRows) => {
    let tongTien = 0
    const chiTietBooKings = updatedRows.map((row) => {
      const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
      const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
      const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

      // Tính tổng tiền từ giaPhongTheoNgays
      tongTien +=
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

      // Tính tiền extra bed
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      tongTien += tienExtraBed

      // Tính tiền phụ thu trẻ em
      const tiengiaPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      tongTien += tiengiaPhuThuTreEm

      // Tính tiền phụ thu ăn sáng
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      tongTien += tienPhuThuAnSang

      const tongTienDong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0) +
        tienExtraBed +
        tiengiaPhuThuTreEm +
        tienPhuThuAnSang

      const phong = Array.isArray(row.soPhongDaChon)
        ? row.soPhongDaChon.map((phong) => ({
            maPhong: phong.maPhong || '',
            soGiuongThem: phong.soGiuongThem || 0,
          }))
        : []

      return {
        index: row.index,
        ngayDen: row.ngayDen ? formatDate(row.ngayDen) : null,
        ngayDi: row.ngayDi ? formatDate(row.ngayDi) : null,
        gioDen: row.gioDen,
        gioDi: row.gioDi,
        soDem: soDem,
        soLuong: row.soLuong,
        soLuongDuBaoPhong: row.soLuongDuBaoPhong,
        soLuongExtraBed: row.soLuongExtraBed,
        giaExtraBed: row.giaExtraBed ? parseFloat(row.giaExtraBed) : 0,
        nguoiLon: row.nguoiLon,
        treEm: row.treEm,
        giaPhuThuTreEm: row.giaPhuThuTreEm ? parseFloat(row.giaPhuThuTreEm) : 0,
        soLuongPhuThuTreEm: row.soLuongPhuThuTreEm || 0,
        giaPhuThuAnSang: row.giaPhuThuAnSang ? parseFloat(row.giaPhuThuAnSang) : 0,
        soLuongPhuThuAnSang: row.soLuongPhuThuAnSang || 0,
        gia: tongTienDong,
        tienPhong: tongTienDong,
        loaiPhong: { maLoaiPhong: row.loaiPhong },
        loaiGia: { maLoaiGia: row.maGia },
        giaPhong: { maGiaPhong: row.maGiaPhong },
        ghiChu: row.ghiChu,
        danhSachPhongChiTiets: phong,
        giaPhongTheoNgays: row.giaPhongTheoNgays || [],
      }
    })

    setBooKing((prev) => ({ ...prev, chiTietBooKings, tongTien: tongTien - prev.tienCoc }))
  }

  const [tongSoLuong, setTongSoLuong] = useState(0)
  const [tongTien, setTongTien] = useState(0)
  const [tongNguoiLon, setTongNguoiLon] = useState(0)
  const [tongTreEm, setTongTreEm] = useState(0)
  const [tongTienKhachCanTra, setTongTienKhachCanTra] = useState(0)

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
  const [yeuCau, setYeuCau] = useState([])

  // const [loaiPhong, setLoaiPhong] = useState([])
  const [giaPhong, setGiaPhong] = useState([])
  const [valueNhomKH, setValueNhomKH] = useState([])
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
        // loaiPhong,
        // loaiGia,
        giaPhong,
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
        // getAllLoaiPhongBooKing(navigate),
        // getAllLoaiGia(navigate),
        getAllGiaPhongTheoThoiGian(navigate),
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
        // loaiPhong &&
        // loaiGia &&
        giaPhong
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
        setYeuCau(yeuCau)
        // setLoaiPhong(loaiPhong)
        // setLoaiGia(loaiGia)
        setGiaPhong(giaPhong)
        const formatonpitonlanhdao = {
          maNhomKhachHang: 'NKH2024040306',
          tenNhomKhachHang: 'NONE',
        }

        setValueNhomKH(formatonpitonlanhdao)
      } else {
        addToast(exampleToast('Không thể tải danh sách. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      addToast(exampleToast('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!'))
    }
  }

  useEffect(() => {
    DanhSach()
  }, [])

  // save thông tin đặt phòng

  const [booKing, setBooKing] = useState({
    ngayDen: formatDateToISO(valueNgayDen), // Sử dụng helper function
    ngayDi: formatDateToISO(valueNgayDi), // Sử dụng helper function
    gioDen: '14:00',
    gioDi: '12:00',
    soLuongDuBaoPhong: 0,
    soNguoiLon: 0,
    soTreEm: 0,
    tiLeChietKhau: 0,
    tienCoc: 0,
    ngayCoc: '',
    tongSoLuong: 0,
    tongTien: 0,
    ghiChu: '',
    loaiNguonKhach: '',

    danhXung: {
      maDanhXung: 0,
    },

    khachHangBooKing: {
      hoKhachHangBooking: '',
      tenKhachHangBooking: '',
      diaChiBooking: '',
      emailBooking: '',
      sdtBooking: '',
      faxBooking: '',
      maSoThue: '',
    },
    thongTinLienHeBooKing: {
      tenThongTinLienHeBooKing: '',
      emailThongTinLienHeBooKing: '',
      sdtThongTinLienHeBooKing: '',
      faxThongTinLienHeBooKing: '',
      tourCode: '',
    },

    nhomKhachHang: {
      maNhomKhachHang: 'NKH2024040306',
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

    if (type === 'checkbox') {
      setBooKing((prev) => {
        const selectedYeuCau = yeuCau.find((item) => item.maYeuCau.toString() === value)
        const yeuCauList = checked
          ? [...prev.yeuCaus, selectedYeuCau] // Thêm object đầy đủ
          : prev.yeuCaus.filter((item) => item.maYeuCau.toString() !== value) // Xóa object
        return { ...prev, yeuCaus: yeuCauList }
      })
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.')

      setBooKing((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]:
            child === 'hoKhachHangBooking' || child === 'tenKhachHangBooking'
              ? value.toUpperCase()
              : value,
        },
      }))
    } else {
      const processedValue = name === 'loaiNguonKhach' ? value.toUpperCase() : value

      setBooKing((prev) => ({ ...prev, [name]: processedValue }))
    }
  }

  const [listLoaiPhongTrong, setListLoaiPhongTrong] = useState([])
  const kiemTraPhongTrong = async (ngayDen, ngayDi) => {
    // Kiểm tra và điều chỉnh ngày đi nếu cần
    let adjustedNgayDi = ngayDi

    // So sánh ngày tháng chính xác (bỏ qua giờ phút giây)
    const ngayDenDate = new Date(ngayDen)
    const ngayDiDate = new Date(ngayDi)
    ngayDenDate.setHours(0, 0, 0, 0)
    ngayDiDate.setHours(0, 0, 0, 0)

    if (ngayDenDate.getTime() >= ngayDiDate.getTime()) {
      // Nếu ngày đến >= ngày đi, tự động đặt ngày đi = ngày đến + 1
      adjustedNgayDi = new Date(ngayDen)
      adjustedNgayDi.setDate(adjustedNgayDi.getDate() + 1)
      adjustedNgayDi.setHours(12, 0, 0, 0) // Đặt giờ 12:00

      console.log('⚠️ Ngày đến >= ngày đi, tự động điều chỉnh ngày đi thành:', adjustedNgayDi)
      addToast(exampleToast('⚠️ Tự động điều chỉnh ngày đi thành ngày đến + 1'))

      // Cập nhật state valueNgayDi
      setValueNgayDi(adjustedNgayDi)

      // Cập nhật state booKing
      setBooKing((prev) => ({
        ...prev,
        ngayDi: formatDateToISO(adjustedNgayDi),
      }))

      // Cập nhật tất cả các dòng trong rows
      const updatedRows = rows.map((row) => ({
        ...row,
        ngayDi: formatDateToDisplay(adjustedNgayDi),
      }))
      setRows(updatedRows)
      updateChiTietBooKings(updatedRows)
    }

    const ngay_den = format(ngayDen, 'yyyy-MM-dd')
    const ngay_di = format(adjustedNgayDi, 'yyyy-MM-dd')
    console.log('ngay_den', ngay_den)
    console.log('ngay_di (đã điều chỉnh)', ngay_di)

    try {
      setLoadKiemTra(true)

      const listloaiphong = await getAllLoaiPhongTrongTrongKhoanThoiGian(ngay_den, ngay_di)
      if (listloaiphong) {
        setListLoaiPhongTrong(listloaiphong)
        addToast(exampleToast('✔️ Tải danh sách thành công'))
      } else {
        addToast(exampleToast('❌ Không thể tải danh sách loại phòng trống. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại phòng trống:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoadKiemTra(false)
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

  const [loadKiemTra, setLoadKiemTra] = useState(false)

  const [phongOptions, setPhongOptions] = useState({})
  const fetchPhongOptions = async (maloaiphong) => {
    if (!valueNgayDen || !valueNgayDi) {
      console.warn('Dữ liệu chưa sẵn sàng, không gọi API.')
      return
    }

    try {
      // Kiểm tra và điều chỉnh ngày đi nếu cần
      let adjustedNgayDi = valueNgayDi

      // So sánh ngày tháng chính xác (bỏ qua giờ phút giây)
      const ngayDenDate = new Date(valueNgayDen)
      const ngayDiDate = new Date(valueNgayDi)
      ngayDenDate.setHours(0, 0, 0, 0)
      ngayDiDate.setHours(0, 0, 0, 0)

      if (ngayDenDate.getTime() >= ngayDiDate.getTime()) {
        // Nếu ngày đến >= ngày đi, tự động đặt ngày đi = ngày đến + 1
        adjustedNgayDi = new Date(valueNgayDen)
        adjustedNgayDi.setDate(adjustedNgayDi.getDate() + 1)
        adjustedNgayDi.setHours(12, 0, 0, 0) // Đặt giờ 12:00

        console.log('⚠️ fetchPhongOptions: Tự động điều chỉnh ngày đi thành:', adjustedNgayDi)
      }

      const ngayDenFormatted = format(new Date(valueNgayDen), 'yyyy-MM-dd')
      const ngayDiFormatted = format(adjustedNgayDi, 'yyyy-MM-dd')

      const phong = await getListPhongTrongTheoKhoanThoiGian(
        maloaiphong,
        ngayDenFormatted,
        ngayDiFormatted,
        navigate,
      )
      console.log('phong', phong)

      if (phong) {
        setPhongOptions((prevOptions) => ({
          ...prevOptions,
          [maloaiphong]: phong,
        }))
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const handleOnValueChange = (value) => {
    setBooKing((prev) => {
      // Nếu giá trị không thay đổi, không cần cập nhật
      if (value === prev.tienCoc) {
        return prev
      }

      const newTienCoc = value || 0 // Nếu giá trị rỗng, set về 0

      // Tính tổng tiền tất cả các hàng từ giaPhongTheoNgays và giaExtraBed
      const tongTienTatCa = rows.reduce((sum, row) => {
        const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
        const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
        const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

        // Tính tiền phòng từ giaPhongTheoNgays
        const tienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tiengiaPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

        return sum + tienPhong + tienExtraBed + tiengiaPhuThuTreEm + tienPhuThuAnSang
      }, 0)

      // Tính tổng tiền khách cần trả sau khi trừ tiền cọc
      const tongTienKhachTra = Math.max(tongTienTatCa - parseFloat(newTienCoc), 0) // Đảm bảo không âm

      // Cập nhật state tổng tiền khách trả
      setTongTienKhachCanTra(tongTienKhachTra)

      return { ...prev, tienCoc: parseFloat(newTienCoc), tongTien: tongTienKhachTra }
    })
  }

  console.log('row', rows)

  const handleLyChange = (event, index) => {
    const value = event.target.value

    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      ghiChu: value,
    }

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
  }

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

    // Kiểm tra giá từng ngày trong giaPhongTheoNgays
    const isInvalidGiaNgay = booKing.chiTietBooKings.some((item) =>
      (item.giaPhongTheoNgays || []).some((g) => !g.gia || Number(g.gia) <= 0),
    )
    if (isInvalidGiaNgay) {
      addToast(exampleToast('⚠️ Có ngày trong giá phòng bị thiếu hoặc <= 0!'))
      return
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

      // if (item?.gia === '' || item.gia <= 0) {
      //   addToast(exampleToast('⚠️ Chưa nhập giá hợp lệ'))
      //   return true
      // }

      if (item.soLuongExtraBed > 0) {
        if (item.giaExtraBed === 0) {
          addToast(exampleToast('⚠️ Chưa nhập giá extra bed'))
          return true
        }
      }

      if (item.giaExtraBed !== 0) {
        if (item.soLuongExtraBed === 0) {
          addToast(exampleToast('⚠️ Chưa nhập số lượng extra bed'))
          return true
        }
      }

      if (item.soLuongPhuThuTreEm > 0) {
        if (item.giaPhuThuTreEm === 0 || item.giaPhuThuTreEm === null) {
          addToast(exampleToast('⚠️ Chưa nhập giá phụ thu trẻ em'))
          return true
        }
      }

      if (item.giaPhuThuTreEm !== 0) {
        if (item.soLuongPhuThuTreEm === 0 || item.soLuongPhuThuTreEm === null) {
          addToast(exampleToast('⚠️ Chưa nhập số lượng phụ thu trẻ em'))
          return true
        }
      }

      if (item.soLuongPhuThuAnSang > 0) {
        if (item.giaPhuThuAnSang === 0 || item.giaPhuThuAnSang === null) {
          addToast(exampleToast('⚠️ Chưa nhập giá phụ thu ăn sáng'))
          return true
        }
      }

      if (item.giaPhuThuAnSang !== 0) {
        if (item.soLuongPhuThuAnSang === 0 || item.soLuongPhuThuAnSang === null) {
          addToast(exampleToast('⚠️ Chưa nhập số lượng phụ thu ăn sáng'))
          return true
        }
      }

      // Kiểm tra số lượng phòng
      const tongSoPhongDaChon = item.danhSachPhongChiTiets.length
      const soPhongExtraDaChon = item.danhSachPhongChiTiets.filter(
        (p) => p.soGiuongThem === 1,
      ).length

      if (tongSoPhongDaChon !== 0) {
        // Kiểm tra tổng số phòng đã chọn có khớp với số lượng không
        if (tongSoPhongDaChon !== item.soLuong) {
          addToast(
            exampleToast(
              `⚠️ Loại phòng ${item.loaiPhong.maLoaiPhong} cần chọn đúng ${item.soLuong} phòng (đã chọn ${tongSoPhongDaChon} phòng)`,
            ),
          )
          return true
        }

        // Nếu có extra bed, kiểm tra số lượng phòng extra
        if (item.soLuongExtraBed > 0) {
          if (soPhongExtraDaChon < item.soLuongExtraBed) {
            addToast(
              exampleToast(
                `⚠️ Loại phòng ${item.loaiPhong.maLoaiPhong} cần chọn đúng ${item.soLuongExtraBed} phòng extra (đã chọn ${soPhongExtraDaChon} phòng)`,
              ),
            )
            return true
          }
        }
      }

      return false
    })

    // 3. Nếu có lỗi, dừng không gọi API
    if (isInvalidDetail) return

    try {
      setTrangthaiload(true)

      const updateBooking = {
        ...booKing,
        tongSoLuong: tongSoLuong,
        // tongTien: tongTien,
        soTreEm: tongTreEm,
        soNguoiLon: tongNguoiLon,
        ngayDen: formatDateToISO(booKing.ngayDen),
        ngayDi: formatDateToISO(booKing.ngayDi),
      }

      console.log('gui', updateBooking)
      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await createBooking(updateBooking)
      // const response = ''
      console.log('Booking created successfully:', response)

      // setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast('❌ ' + response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))
        setTimeout(() => {
          navigate('/dashboard/pos/danh-sach-booking')
        }, 1500)
      }
    } catch (error) {
      console.error('Error:', error)

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
    } finally {
      setTrangthaiload(false)
    }
  }

  const [trangthaiload, setTrangthaiload] = useState(false)

  // Thêm state mới sau các state hiện có
  const [giaTheoNgay, setGiaTheoNgay] = useState({})

  // Thêm hàm xử lý thay đổi giá theo ngày
  const handleGiaTheoNgayChange = (index, maLoaiPhong, ngay, gia) => {
    setGiaTheoNgay((prev) => {
      const newGiaTheoNgay = {
        ...prev,
        [maLoaiPhong]: {
          ...prev[maLoaiPhong],
          [ngay]: gia,
        },
      }

      // Cập nhật tổng tiền cho dòng
      const updatedRows = rows.map((row) => {
        if (row.index === index) {
          const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
          const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
          const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

          // Tính tổng tiền từ giá theo ngày
          let tongTienPhong = 0
          let giaPhongTheoNgays = []

          for (let i = 0; i < soDem; i++) {
            const currentDate = new Date(ngayDen)
            currentDate.setDate(currentDate.getDate() + i)
            const ngayStr = currentDate.toISOString().split('T')[0]

            // Ưu tiên giá mới chỉnh, sau đó đến giá đã lưu, cuối cùng là giá mặc định
            let giaNgay = Number(newGiaTheoNgay[maLoaiPhong]?.[ngayStr])
            if (!giaNgay) {
              giaNgay = row.giaPhongTheoNgays?.find((g) => g.ngay === ngayStr)?.gia
            }
            if (!giaNgay) {
              giaNgay = getGiaTheoLoaiNgay(maLoaiPhong, currentDate)
            }

            tongTienPhong += giaNgay * (row.soLuong || 0)
            giaPhongTheoNgays.push({
              maLoaiPhong: maLoaiPhong,
              ngay: ngayStr,
              gia: giaNgay,
            })
          }

          // Tính tiền extra bed
          const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
          tongTienPhong += tienExtraBed

          // Tính tiền phụ thu trẻ em
          const tiengiaPhuThuTreEm =
            (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
          tongTienPhong += tiengiaPhuThuTreEm

          // Tính tiền phụ thu ăn sáng
          const tienPhuThuAnSang =
            (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
          tongTienPhong += tienPhuThuAnSang

          return {
            ...row,
            gia: 0,
            giaPhongTheoNgays: giaPhongTheoNgays,
            tongTienDong: tongTienPhong,
          }
        }
        return row
      })

      console.log('updatedRows ngay', updatedRows)
      setRows(updatedRows)
      updateTongTien(updatedRows)

      return newGiaTheoNgay
    })
  }

  // Thêm hàm lấy danh sách ngày giữa 2 ngày
  const getDatesBetween = (startDate, endDate) => {
    const dates = []
    const currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  // Thêm hàm format ngày thứ
  const formatNgayThu = (date) => {
    const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return thu[date.getDay()]
  }

  // Thêm hàm lấy giá theo loại ngày
  const getGiaTheoLoaiNgay = (maLoaiPhong, date) => {
    const options = getGiaOptions(maLoaiPhong)
    const isSaturday = date.getDay() === 6 // 6 là thứ 7

    if (isSaturday) {
      const weekendPrice = options.find((option) => option.giaCuoiTuan)
      return weekendPrice ? weekendPrice.gia : 0
    }

    const weekdayPrice = options.find((option) => option.giaNgayThuong)
    return weekdayPrice ? weekdayPrice.gia : 0
  }

  console.log('updatebooKing', booKing)

  // Hàm lấy danh sách loại phòng đã chọn (trừ dòng hiện tại)
  const getSelectedLoaiPhongs = (excludeIndex) =>
    rows
      .filter((_, idx) => idx !== excludeIndex)
      .map((row) => row.loaiPhong)
      .filter((maLoaiPhong) => maLoaiPhong && maLoaiPhong !== '0')

  // Hàm tính toán ngày đến gần nhất từ tất cả các dòng
  const getEarliestNgayDen = () => {
    if (!rows || rows.length === 0) return null
    const ngayDenDates = rows
      .map((row) => createDateFromInput(row.ngayDen))
      .filter((date) => date && !isNaN(date.getTime()))
    if (ngayDenDates.length === 0) return null
    const earliestNgayDen = new Date(Math.min(...ngayDenDates.map((date) => date.getTime())))
    return formatDateToDisplay(earliestNgayDen)
  }

  // Hàm tính toán ngày đi xa nhất từ tất cả các dòng
  const getLatestNgayDi = () => {
    if (rows.length === 0) return null

    const ngayDiDates = rows
      .map((row) => createDateFromInput(row.ngayDi))
      .filter((date) => date && !isNaN(date.getTime()))

    if (ngayDiDates.length === 0) return null

    // Tìm ngày đi xa nhất (lớn nhất trong các ngày đi)
    const latestDate = new Date(Math.max(...ngayDiDates.map((date) => date.getTime())))
    return formatDateToDisplay(latestDate)
  }

  // Đồng bộ ngày đến/đi tổng vào booking khi rows thay đổi
  React.useEffect(() => {
    const earliest = getEarliestNgayDen()
    const latest = getLatestNgayDi()
    setBooKing((prev) => {
      // Chỉ cập nhật nếu khác giá trị cũ
      if (earliest && latest && (prev.ngayDen !== earliest || prev.ngayDi !== latest)) {
        return {
          ...prev,
          ngayDen: earliest,
          ngayDi: latest,
        }
      }
      return prev
    })
  }, [rows])

  // Thêm biến yesterday để lấy ngày hôm qua
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

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
                          name="khachHangBooKing.sdtBooking"
                          value={booKing.khachHangBooKing.sdtBooking}
                          onChange={onInputChange}
                        />
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="khachHangBooKing.faxBooking"
                          value={booKing.khachHangBooKing.faxBooking}
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
                      Type Source
                    </CFormLabel>
                    <CCol sm={8}>
                      <Select
                        getOptionValue={(option) => option.maNhomKhachHang}
                        getOptionLabel={(option) => option.tenNhomKhachHang}
                        // value={nhomKhachHang.find(
                        //   (option) =>
                        //     option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                        // )}
                        options={nhomKhachHang}
                        onChange={(selectedOption) => {
                          // Cập nhật giá trị cho Select
                          setValueNhomKH(selectedOption)

                          // Cập nhật booKing với thông tin nhóm khách hàng mới
                          setBooKing((prev) => ({
                            ...prev,
                            nhomKhachHang: {
                              maNhomKhachHang: selectedOption?.maNhomKhachHang || '',
                              tenNhomKhachHang: selectedOption?.tenNhomKhachHang || '',
                            },
                          }))
                        }}
                        value={valueNhomKH}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-1">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Name Source
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="loaiNguonKhach"
                        value={booKing.loaiNguonKhach}
                        onChange={onInputChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Code VAT
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="khachHangBooKing.maSoThue"
                        value={booKing.khachHangBooKing.maSoThue}
                        onChange={onInputChange}
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
                          name="thongTinLienHeBooKing.sdtThongTinLienHeBooKing"
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
                <div className="border-2 border-gray-500 rounded-md p-4 mb-3">
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
                      {/* <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="tienCoc"
                        value={booKing.tienCoc}
                        onChange={onInputChange}
                      /> */}
                      <CurrencyInput
                        className="form-control "
                        name="input-name"
                        placeholder="Please enter a number"
                        value={booKing.tienCoc}
                        decimalsLimit={2}
                        onValueChange={handleOnValueChange}
                      />
                    </CCol>
                  </CRow>
                </div>
                <CFormTextarea
                  className="border-2 border-gray-500"
                  rows={2}
                  value={booKing.ghiChu}
                  name="ghiChu"
                  placeholder="Nhập ghi chú"
                  onChange={onInputChange}
                ></CFormTextarea>
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
                      checked={booKing.yeuCaus.some(
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
              <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                Thông tin booking <span className="text-danger"> *</span>
              </span>
              <CRow className="border-2 border-blue-500 rounded-md p-3">
                <div className="w-full bg-white p-3 rounded-lg shadow mb-3">
                  <CCol className="mb-2 border-b" md={12}>
                    <div
                      className="overflow-auto"
                      style={{ maxHeight: '400px', minHeight: '200PX' }}
                    >
                      <div className="min-w-[2600px]">
                        <CTable align="middle" color="light" responsive borderless hover>
                          <CTableHead className="sticky top-0 bg-white z-10">
                            <CTableRow color="success">
                              <CTableHeaderCell>Ngày đến</CTableHeaderCell>
                              <CTableHeaderCell>Ngày đi</CTableHeaderCell>
                              <CTableHeaderCell>Loại phòng</CTableHeaderCell>
                              <CTableHeaderCell
                                className="text-center"
                                style={{ minWidth: '80px' }}
                              >
                                Dự báo
                              </CTableHeaderCell>

                              <CTableHeaderCell style={{ width: '100px' }}>
                                Số lượng
                              </CTableHeaderCell>

                              <CTableHeaderCell style={{ width: '100px' }}>
                                Người lớn
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '80px' }}>Trẻ em</CTableHeaderCell>

                              <CTableHeaderCell style={{ width: '100px' }}>
                                SL Extra
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '130px' }}>
                                Phụ thu Extra{' '}
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '100px' }}>
                                SL trẻ em
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '130px' }}>
                                Phụ thu trẻ em
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '100px' }}>
                                SL ăn sáng
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '130px' }}>
                                Phụ thu ăn sáng
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '400px' }}>
                                Số phòng
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '200px' }}>Mã giá</CTableHeaderCell>
                              <CTableHeaderCell>Giá</CTableHeaderCell>
                              {/* <CTableHeaderCell>Thông tin</CTableHeaderCell> */}
                              {/* <CTableHeaderCell>Số đêm</CTableHeaderCell> */}
                              <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                              <CTableHeaderCell>Lý do</CTableHeaderCell>
                              <CTableHeaderCell></CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {rows.map((row, index) => {
                              // Tính số đêm
                              const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
                              const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
                              const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))
                              const tongTienDong =
                                (row.giaPhongTheoNgays && row.giaPhongTheoNgays.length > 0
                                  ? row.giaPhongTheoNgays.reduce(
                                      (sum, giaNgay) => sum + giaNgay.gia * (row.soLuong || 0),
                                      0,
                                    )
                                  : 0) +
                                (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem +
                                (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem +
                                (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

                              row.tongTienDong = tongTienDong

                              // Lấy các loại phòng đã chọn ở dòng khác
                              //const selectedLoaiPhongs = getSelectedLoaiPhongs(index)

                              return (
                                <CTableRow key={index}>
                                  <CTableDataCell>
                                    <div className="w-36">
                                      <CDatePicker
                                        locale="en-GB"
                                        date={formatDateToISO(row.ngayDen)} // Sử dụng helper function
                                        onDateChange={(date) =>
                                          handleDateChangeNgayDen(date, index)
                                        }
                                        minDate={yesterday}
                                      />
                                    </div>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <div className="w-36">
                                      <CDatePicker
                                        locale="en-GB"
                                        date={formatDateToISO(row.ngayDi)} // Sử dụng helper function
                                        onDateChange={(date) => handleDateChangeNgayDi(date, index)}
                                      />
                                    </div>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CFormSelect
                                      value={row.loaiPhong}
                                      onChange={(event) => handleLoaiPhongChange(event, index)}
                                    >
                                      <option value="0">Chọn loại phòng</option>
                                      {listLoaiPhongTrong?.map((item) => {
                                        return (
                                          <option
                                            key={item.maLoaiPhong}
                                            value={item.maLoaiPhong}
                                            disabled={item.soPhongTrong === 0}
                                          >
                                            {item.tenLoaiPhong} Trống {item.soPhongTrong}
                                          </option>
                                        )
                                      })}
                                    </CFormSelect>
                                  </CTableDataCell>
                                  <CTableDataCell className="text-center">
                                    {row.soLuongDuBaoPhong}
                                  </CTableDataCell>

                                  <CTableDataCell className="text-center">
                                    <CFormInput
                                      type="number"
                                      value={row.soLuong}
                                      onChange={(event) => handleSoLuongChange(event, index)}
                                    />
                                  </CTableDataCell>

                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      value={row.nguoiLon}
                                      onChange={(event) => handleSLNguoiLonChange(event, index)}
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      value={row.treEm}
                                      onChange={(event) => handleSLTreEmChange(event, index)}
                                    />
                                  </CTableDataCell>

                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      value={row.soLuongExtraBed}
                                      onChange={(event) =>
                                        handleSoLuongExtraBedChange(
                                          event,
                                          index,
                                          (row.tongSoLuongExtraBed || 0) -
                                            (row.tongSoLuongExtraBedDaSuDung || 0),
                                          row.soLuong,
                                        )
                                      }
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CurrencyInput
                                      className="form-control w-24 text-right"
                                      name="input-name"
                                      placeholder="Nhập giá"
                                      value={row.giaExtraBed}
                                      decimalsLimit={2}
                                      onValueChange={(value) => {
                                        if (value !== undefined && value !== null) {
                                          handleGiaExtraChange(value, index)
                                        }
                                      }}
                                    />
                                  </CTableDataCell>

                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      value={row.soLuongPhuThuTreEm}
                                      onChange={(event) =>
                                        handlesoLuongPhuThuTreEmChange(event, index)
                                      }
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CurrencyInput
                                      className="form-control w-24 text-right"
                                      name="input-name"
                                      placeholder="Nhập giá"
                                      value={row.giaPhuThuTreEm}
                                      decimalsLimit={2}
                                      onValueChange={(input) => {
                                        if (input !== undefined && input !== '0') {
                                          handlegiaPhuThuTreEmChange(input, index)
                                        }
                                      }}
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      value={row.soLuongPhuThuAnSang}
                                      onChange={(event) =>
                                        handlesoLuongPhuThuAnSangChange(event, index)
                                      }
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CurrencyInput
                                      className="form-control w-24 text-right"
                                      name="input-name"
                                      placeholder="Nhập giá"
                                      value={row.giaPhuThuAnSang}
                                      decimalsLimit={2}
                                      onValueChange={(input) => {
                                        if (input !== undefined && input !== '0') {
                                          handlegiaPhuThuAnSangChange(input, index)
                                        }
                                      }}
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell className="text-center">
                                    <Select
                                      getOptionValue={(option) => option.maPhong}
                                      getOptionLabel={(option) => {
                                        const labels = [option.tenPhong]
                                        if (option.daDo && option.soGiuongThem === 1) {
                                          labels.push('(Dơ, Extra)')
                                        } else {
                                          if (option.daDo) labels.push('(Dơ)')
                                          if (option.soGiuongThem === 1) labels.push('(Extra)')
                                        }
                                        return labels.join(' ')
                                      }}
                                      options={phongOptions[row.loaiPhong] || []}
                                      menuPortalTarget={document.body}
                                      styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        menu: (base) => ({ ...base, zIndex: 9999 }),
                                        option: (base, state) => ({
                                          ...base,
                                          backgroundColor: state.isDisabled
                                            ? '#e2e8f0'
                                            : state.isSelected
                                              ? '#e2e8f0'
                                              : 'white',
                                          color: state.isDisabled ? '#94a3b8' : 'black',
                                          cursor: state.isDisabled ? 'not-allowed' : 'default',
                                        }),
                                      }}
                                      isMulti
                                      value={row.soPhongDaChon || []}
                                      onChange={(selected) => handleSoPhongChange(selected, index)}
                                      placeholder="Chọn phòng"
                                      className={
                                        ((row.soPhongDaChon?.length || 0) < row.soLuong
                                          ? 'border-red-500'
                                          : 'border-green-500') + ' border-2 rounded'
                                      }
                                      isOptionDisabled={(option) => {
                                        // Kiểm tra xem phòng này đã được chọn ở dòng khác chưa
                                        const isPhongDaChonOChoKhac = rows.some(
                                          (otherRow, otherIndex) => {
                                            // Bỏ qua dòng hiện tại
                                            if (otherIndex === index) return false

                                            // Kiểm tra xem phòng này có trong danh sách phòng của dòng khác không
                                            return otherRow.soPhongDaChon?.some(
                                              (phong) => phong.maPhong === option.maPhong,
                                            )
                                          },
                                        )

                                        if (isPhongDaChonOChoKhac) {
                                          return true
                                        }

                                        // Trường hợp 1: Nếu soLuong = soLuongExtraBed, chỉ cho phép chọn phòng có extra bed
                                        if (row.soLuong === row.soLuongExtraBed) {
                                          return option.soGiuongThem !== 1
                                        }

                                        return false
                                      }}
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CFormSelect
                                      value={row.maGia}
                                      onChange={(event) => handleLoaiGiaChange(event, index)}
                                    >
                                      <option value="0">Chọn giá</option>
                                      {getGiaOptions(row.loaiPhong).map((option) => (
                                        <option key={option.maGiaPhong} value={option.maLoaiGia}>
                                          {`${option.tenLoaiGia} - Giá: ${option.gia.toLocaleString(
                                            'vi-VN',
                                          )}`}
                                          {option.giaCuoiTuan ? ' (Cuối tuần)' : ''}
                                          {option.giaNgayThuong ? ' (Ngày thường)' : ''}
                                          {option.giaNgayLe ? ' (Ngày lễ)' : ''}
                                          {option.giaGiuong ? ' (Giường extra)' : ''}
                                        </option>

                                      ))}
                                        <option value="41">Giá Booking Online </option>
                                    </CFormSelect>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CPopover
                                      trigger="click"
                                      placement="right"
                                      content={
                                        <div className="p-2 min-w-[200px] max-h-[400px] overflow-y-auto">
                                          <div className="font-semibold mb-3">
                                            Thông tin giá loại phòng theo ngày
                                          </div>
                                          <div className="space-y-3">
                                            {(() => {
                                              const ngayDen = createDateFromInput(row.ngayDen) // Sử dụng helper function
                                              const ngayDi = createDateFromInput(row.ngayDi) // Sử dụng helper function
                                              ngayDi.setDate(ngayDi.getDate() - 1) // Trừ 1 ngày

                                              return getDatesBetween(ngayDen, ngayDi).map(
                                                (date, index) => {
                                                  const ngayStr = date.toISOString().split('T')[0]
                                                  const isSaturday = date.getDay() === 6
                                                  const giaMacDinh = getGiaTheoLoaiNgay(
                                                    row.loaiPhong,
                                                    date,
                                                  )
                                                  const giaHienTai =
                                                    giaTheoNgay[row.loaiPhong]?.[ngayStr] ||
                                                    giaMacDinh

                                                  return (
                                                    <div
                                                      key={index}
                                                      className="flex items-center justify-between gap-2"
                                                    >
                                                      <div
                                                        className={`text-sm ${
                                                          isSaturday
                                                            ? 'text-red-500 font-medium'
                                                            : ''
                                                        }`}
                                                      >
                                                        {formatNgayThu(date)}{' '}
                                                        {date.toLocaleDateString('vi-VN')}
                                                        {isSaturday}:
                                                      </div>
                                                      <CurrencyInput
                                                        className={`outline-none w-32 border-b-2 ${
                                                          isSaturday
                                                            ? 'border-red-500'
                                                            : 'border-gray-500'
                                                        } rounded-none text-right`}
                                                        value={giaHienTai}
                                                        decimalsLimit={2}
                                                        onValueChange={(value, _, values) => {
                                                          // Chỉ gọi handleGiaTheoNgayChange khi giá trị thực sự thay đổi
                                                          if (value !== giaHienTai) {
                                                            handleGiaTheoNgayChange(
                                                              row.index,
                                                              row.loaiPhong,
                                                              ngayStr,
                                                              value,
                                                            )
                                                          }
                                                        }}
                                                        onBlur={(e) => {
                                                          // Ngăn chặn sự kiện blur lan ra ngoài
                                                          e.stopPropagation()
                                                        }}
                                                      />
                                                    </div>
                                                  )
                                                },
                                              )
                                            })()}
                                          </div>
                                        </div>
                                      }
                                    >
                                      <i className="text-xl ml-2 cursor-pointer text-blue-500 fa-regular fa-circle-info"></i>
                                    </CPopover>
                                  </CTableDataCell>
                                  {/* <CTableDataCell className="text-center">{soDem}</CTableDataCell> */}
                                  <CTableDataCell className="text-right">
                                    {tongTienDong.toLocaleString('en-US')}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <input
                                      type="text"
                                      placeholder="Nhập lý do (nếu có)"
                                      className="bg-transparent outline-none  "
                                      onChange={(event) => handleLyChange(event, index)}
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <FontAwesomeIcon
                                      icon={faDeleteLeft}
                                      className="text-red-500 cursor-pointer"
                                      onClick={() => handleRemoveRow(index)}
                                    />
                                  </CTableDataCell>
                                </CTableRow>
                              )
                            })}
                          </CTableBody>

                          <CTableRow color="secondary">
                            <CTableDataCell className="text-center">
                              {getEarliestNgayDen() || ''}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              {getLatestNgayDi() || ''}
                            </CTableDataCell>
                            <CTableDataCell colSpan={2} className="text-center"></CTableDataCell>
                            <CTableDataCell className="text-center" scope="col">
                              {tongSoLuong}
                            </CTableDataCell>

                            <CTableDataCell scope="col" className="text-center">
                              {tongNguoiLon}
                            </CTableDataCell>
                            <CTableDataCell scope="col" className="text-center">
                              {tongTreEm}
                            </CTableDataCell>
                            <CTableDataCell colSpan={7} className="text-center"></CTableDataCell>
                            <CTableDataCell className="text-right font-bold">
                              {rows
                                .reduce((sum, row) => sum + (row.tongTienDong || 0), 0)
                                .toLocaleString('en-US')}
                            </CTableDataCell>
                          </CTableRow>
                        </CTable>
                      </div>
                    </div>
                  </CCol>
                </div>
                {/* {listLoaiPhongTrong.length > 0 && ( */}
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
                {/* )} */}
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
                    // value={rows
                    //   .reduce((sum, row) => sum + (row.tongTienDong || 0) - booKing.tienCoc, 0)
                    //   .toLocaleString('vi-VN')}
                    //   onChange={handleChange}
                    value={booKing.tongTien.toLocaleString('en-US')}
                  />
                </div>
              </div>
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              {trangthaiload && (
                <CButton color="primary" disabled>
                  <CSpinner as="span" size="sm" aria-hidden="true" className="font-semibold" />
                  Save...
                </CButton>
              )}
              {!trangthaiload && (
                <CButton color="primary" type="submit" variant="outline" className="font-semibold">
                  <FontAwesomeIcon icon={faFloppyDisk} /> Save
                </CButton>
              )}
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </CRow>
  )
}

export default ThemDatPhong
