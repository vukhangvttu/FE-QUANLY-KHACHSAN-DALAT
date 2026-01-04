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
import { useNavigate, useParams } from 'react-router-dom'
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
import {
  getBooKingByMaBooKing,
  getChiTietBooKingByMaBooKing,
  updateBooking,
} from 'src/service/BooKingService'

import CurrencyInput from 'react-currency-input-field'
import XoaLoaiPhongChiTiet from '../modal/XoaLoaiPhongChiTiet'
import { getAllGiaPhongTheoThoiGian } from 'src/service/GiaPhongService'
import XoaPhongHoiNghi from '../modal/XoaPhongHoiNghi'
import { getListPhongTrongTheoKhoanThoiGianAndBooking } from 'src/service/PhongService'

const EditBooKing = () => {
  const { ma_booking } = useParams()

  const [rows, setRows] = useState([])
  const [giaTheoNgay, setGiaTheoNgay] = useState({})

  // Thêm dòng mới
  const handleAddRow = () => {
    if (!booKing.ngayDen || !booKing.ngayDi) {
      return addToast(exampleToast('⚠️ Vui lòng chọn ngày đến và ngày đi hợp lệ!'))
    }

    // Tìm index lớn nhất hiện tại
    const maxIndex = rows.length > 0 ? Math.max(...rows.map((row) => row.index)) : -1

    // Ngày hiện tại (set giờ về 0:00:00)
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const todayStr = `${yyyy}-${mm}-${dd}`
    // Tính ngày đi là ngày hiện tại + 1
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const yyyy2 = tomorrow.getFullYear()
    const mm2 = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const dd2 = String(tomorrow.getDate()).padStart(2, '0')
    const tomorrowStr = `${yyyy2}-${mm2}-${dd2}`

    setRows([
      ...rows,
      {
        index: maxIndex + 1, // Gán index mới là maxIndex + 1
        maChiTietBooking: '',
        ngayDen: todayStr,
        gioDen: '14:00',
        ngayDi: tomorrowStr,
        gioDi: '12:00',
        soLuong: 1,
        soLuongDuBaoPhong: 0,
        nguoiLon: 1,
        treEm: 0,
        soLuongExtraBed: 0,
        giaExtraBed: 0,
        gia: 0,
        giaPhuThuTreEm: 0,
        soLuongPhuThuTreEm: 0,
        giaPhuThuAnSang: 0,
        soLuongPhuThuAnSang: 0,
        loaiPhong: {
          maLoaiPhong: '0',
          tenLoaiPhong: 'Chọn loại phòng',
        },
        ghiChu: '',
        loaiGia: {
          maLoaiGia: 0,
        },
        giaPhong: {
          maGiaPhong: 0,
        },
        danhSachPhongChiTiets: [],
        giaPhongTheoNgays: [],
        isNew: true,
      },
    ])
    setBooKing((prevState) => ({
      ...prevState,
      tongSoLuong: prevState.tongSoLuong + 1,
      soNguoiLon: prevState.soNguoiLon + 1,
    }))

    kiemTraPhongTrong(valueNgayDen, valueNgayDi)
  }

  const [valueNgayDen, setValueNgayDen] = useState()

  // set mặc định ngày tiếp theo
  const [valueNgayDi, setValueNgayDi] = useState()

  const handleDateChangeNgayDen = (date, index) => {
    if (date !== null) {
      setValueNgayDen(date)
      // Cập nhật rows chỉ cho dòng có index tương ứng
      const updatedRows = rows.map((row) => {
        if (row.index === index) {
          // Kiểm tra và điều chỉnh ngày đi nếu ngày đến >= ngày đi
          const ngayDen = new Date(date)
          const ngayDi = new Date(row.ngayDi)
          ngayDen.setHours(0, 0, 0, 0)
          ngayDi.setHours(0, 0, 0, 0)
          let adjustedNgayDi = ngayDi
          let needAdjustment = false
          if (ngayDen.getTime() >= ngayDi.getTime()) {
            adjustedNgayDi = new Date(ngayDen)
            adjustedNgayDi.setDate(adjustedNgayDi.getDate() + 1)
            adjustedNgayDi.setHours(12, 0, 0, 0)
            addToast(exampleToast('⚠️ Tự động điều chỉnh ngày đi thành ngày đến + 1'))
            needAdjustment = true
          }
          // Đồng bộ lại list giá từng ngày với ngày đi đã điều chỉnh
          const syncedRow = syncGiaPhongTheoNgays(
            [
              {
                ...row,
                ngayDen: toDateString(date),
                ngayDi: needAdjustment ? toDateString(adjustedNgayDi) : row.ngayDi,
              },
            ],
            date,
            needAdjustment ? adjustedNgayDi : row.ngayDi,
          )[0]
          return syncedRow
        }
        return row
      })
      setRows(updatedRows)
      updateChiTietBooKings(updatedRows)
      kiemTraPhongTrong(date, valueNgayDi)
    }
  }

  const handleDateChangeNgayDi = (date, index) => {
    if (!date) return
    const selectedDate = new Date(date)
    setValueNgayDi(selectedDate)
    const formattedDate = toDateString(selectedDate)
    // Cập nhật rows chỉ cho dòng có index tương ứng
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        // Đồng bộ lại list giá từng ngày
        const syncedRow = syncGiaPhongTheoNgays(
          [
            {
              ...row,
              ngayDi: formattedDate,
            },
          ],
          valueNgayDen,
          selectedDate,
        )[0]
        return syncedRow
      }
      return row
    })
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
    kiemTraPhongTrong(valueNgayDen, date)
  }

  const syncGiaPhongTheoNgays = (rows, newNgayDen, newNgayDi) => {
    return rows.map((row) => {
      const ngayDenStr = toDateString(newNgayDen || row.ngayDen)
      const ngayDiStr = toDateString(newNgayDi || row.ngayDi)
      const ngayDen = new Date(ngayDenStr)
      const ngayDi = new Date(ngayDiStr)

      // Không trừ ngày ở đây nữa
      ngayDi.setDate(ngayDi.getDate() - 1)

      const newDates = getDatesBetween(ngayDen, ngayDi)
      let newGiaPhongTheoNgays = []
      if (row.giaPhongTheoNgays && row.giaPhongTheoNgays.length > 0) {
        newGiaPhongTheoNgays = newDates.map((date) => {
          const ngayStr = date.toISOString().split('T')[0]
          const old = row.giaPhongTheoNgays.find((g) => g.ngay === ngayStr)
          return old
            ? old
            : {
                maGiaPhongTheoNgay: null,
                maLoaiPhong: row.loaiPhong.maLoaiPhong,
                ngay: ngayStr,
                gia: getGiaTheoLoaiNgay(row.loaiPhong.maLoaiPhong, date),
              }
        })
      } else {
        newGiaPhongTheoNgays = newDates.map((date) => ({
          maGiaPhongTheoNgay: null,
          maLoaiPhong: row.loaiPhong.maLoaiPhong,
          ngay: date.toISOString().split('T')[0],
          gia: getGiaTheoLoaiNgay(row.loaiPhong.maLoaiPhong, date),
        }))
      }
      return {
        ...row,
        giaPhongTheoNgays: newGiaPhongTheoNgays,
      }
    })
  }

  const handleLoaiPhongChange = (event, rowIndex) => {
    const selectedMaLoaiPhong = event.target.value

    // Tìm dòng cần cập nhật dựa trên row.index (bắt đầu từ 1)
    const rowToUpdate = rows.find((row) => row.index === rowIndex)
    if (!rowToUpdate) {
      console.error('Không tìm thấy dòng với index:', rowIndex)
      return
    }

    // Tìm kiếm thông tin đầy đủ của loại phòng
    const selectedLoaiPhong = listLoaiPhongTrong.find(
      (option) => option.maLoaiPhong === selectedMaLoaiPhong,
    )

    if (!selectedLoaiPhong) {
      addToast(exampleToast('⚠️ Không tìm thấy thông tin loại phòng. Vui lòng chọn loại khác!'))
      return
    }

    const defaultGia = getDefaultGia(selectedMaLoaiPhong)

    // Cập nhật giá trị loại phòng và số lượng phòng trống
    const updatedRows = rows.map((row) => {
      if (row.index === rowIndex) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính toán giaPhongTheoNgays
        const ngayDen = new Date(row.ngayDen.split('/').reverse().join('-'))
        const ngayDi = new Date(row.ngayDi.split('/').reverse().join('-'))
        let giaPhongTheoNgays = []
        let tongTienPhong = 0

        // Lấy ngày hiện tại để so sánh
        const homNay = new Date()
        homNay.setHours(0, 0, 0, 0)

        for (let i = 0; i < soDem; i++) {
          const currentDate = new Date(ngayDen)
          currentDate.setDate(currentDate.getDate() + i)
          const ngayStr = currentDate.toISOString().split('T')[0]

          // Kiểm tra xem ngày này có phải là ngày trong quá khứ không
          const isPastDate = currentDate < homNay

          let giaNgay
          if (isPastDate) {
            // Nếu là ngày trong quá khứ, giữ nguyên giá cũ nếu có, nếu không thì lấy giá mặc định
            const giaCu = row.giaPhongTheoNgays?.find((g) => g.ngay === ngayStr)
            giaNgay = giaCu ? giaCu.gia : getGiaTheoLoaiNgay(selectedMaLoaiPhong, currentDate)
          } else {
            // Nếu là ngày hiện tại hoặc tương lai, cập nhật giá theo loại phòng mới
            giaNgay = getGiaTheoLoaiNgay(selectedMaLoaiPhong, currentDate)
          }

          tongTienPhong += giaNgay

          giaPhongTheoNgays.push({
            maLoaiPhong: selectedMaLoaiPhong,
            ngay: ngayStr,
            gia: giaNgay,
          })
        }

        return {
          ...row,
          loaiPhong: {
            maLoaiPhong: selectedLoaiPhong.maLoaiPhong,
            tenLoaiPhong: selectedLoaiPhong.tenLoaiPhong,
          },
          soLuongDuBaoPhong: selectedLoaiPhong.soPhongTrong ?? 0,
          tongSoLuongExtraBed: selectedLoaiPhong ? selectedLoaiPhong.tongSoGiuongThem : 0,
          tongSoLuongExtraBedDaSuDung: selectedLoaiPhong
            ? selectedLoaiPhong.tongSoGiuongDaSuDung
            : 0,
          // gia: defaultGia.gia,
          gia: tongTienPhong,
          loaiGia: {
            maLoaiGia: defaultGia.maLoaiGia,
          },
          giaPhong: { maGiaPhong: defaultGia.maGiaPhong },
          tongTienDong: tongTienPhong * (row.soLuong || 0),
          giaPhongTheoNgays: giaPhongTheoNgays,
          danhSachPhongChiTiets: [], // Reset danh sách phòng khi đổi loại phòng
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các hàng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      return (
        sum +
        (row.gia || 0) * (row.soLuong || 0) * soDem +
        (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      )
    }, 0)

    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)

    setBooKing((prevState) => ({
      ...prevState,
      tongTien: tongTienTatCa,
    }))

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    fetchPhongOptions(selectedLoaiPhong.maLoaiPhong, valueNgayDen, valueNgayDi)
  }

  // Lọc giá theo mã loại phòng đã chọn
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

    // Nếu là Thứ 7, ưu tiên giá cuối tuần
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
    // Nếu không phải Thứ 7, ưu tiên giá ngày thường
    const weekdayPrice = options.find((option) => option.giaNgayThuong)
    return weekdayPrice
      ? {
          maLoaiGia: weekdayPrice.maLoaiGia,
          gia: weekdayPrice.gia,
          maGiaPhong: weekdayPrice.maGiaPhong,
        }
      : { maLoaiGia: '0', gia: 0, maGiaPhong: 0 }
  }

  const handleSoLuongChange = (event, maLoaiPhong, soLuongExtraBed) => {
    let value = event.target.value

    if (maLoaiPhong === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng trước khi thay đổi'))
    }

    // Lấy thông tin loại phòng từ danh sách
    const selectedLoaiPhong = rows.find((row) => row.loaiPhong === maLoaiPhong)

    if (!selectedLoaiPhong) return

    // Kiểm tra số phòng đã chọn
    const soPhongDaChon = selectedLoaiPhong.danhSachPhongChiTiets?.length || 0

    // Nếu số lượng mới nhỏ hơn số phòng đã chọn
    if (value < soPhongDaChon) {
      addToast(
        exampleToast(
          `⚠️ Đang có ${soPhongDaChon} phòng được chọn. Vui lòng bỏ chọn phòng trước khi giảm số lượng!`,
        ),
      )
      // Reset lại giá trị input về số lượng hiện tại
      event.target.value = selectedLoaiPhong.soLuong
      return
    }

    // Lấy số lượng phòng trống (soLuongDuBaoPhong) của loại phòng đó
    const maxSoLuong =
      listLoaiPhongTrong.find(
        (item) => item.maLoaiPhong === (maLoaiPhong.maLoaiPhong || maLoaiPhong),
      )?.soPhongTrong + selectedLoaiPhong.soLuongDuBaoPhong || 0

    // Kiểm tra nếu số lượng nhập vào vượt quá số lượng có sẵn
    if (value > maxSoLuong) {
      addToast(exampleToast(`⚠️ Chỉ còn ${maxSoLuong} phòng trống. Không thể đặt nhiều hơn!`))
      value = maxSoLuong // Giới hạn giá trị về mức tối đa có thể chọn
    }

    // Chuyển đổi về số nguyên và đảm bảo không âm
    value = isNaN(value) || value < 0 ? 0 : Number(value)

    if (value < soLuongExtraBed) {
      addToast(
        exampleToast(
          `⚠️ Đang có ${soLuongExtraBed} phòng được chọn. Vui lòng bỏ chọn extra bed trước khi giảm số lượng!`,
        ),
      )
      // Reset lại giá trị input về số lượng hiện tại
      event.target.value = selectedLoaiPhong.soLuong
      return
    }

    // Cập nhật số lượng và tính tổng tiền cho từng hàng
    const updatedRows = rows.map((row) => {
      if (row.loaiPhong === maLoaiPhong) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * value

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return { ...row, soLuong: value, tongTienDong }
      }
      return row
    })

    // Tính tổng số lượng tất cả các hàng
    const tongSoLuongTatCa = updatedRows.reduce((sum, row) => sum + (row.soLuong || 0), 0)

    // Tính tổng tiền từ tổng tiền của mỗi dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      // Nếu không có tongTienDong, tính lại dựa trên giaPhongTheoNgays
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      return sum + tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang
    }, 0)

    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    setBooKing((prevState) => ({
      ...prevState,
      tongTien: tongTienTatCa,
      tongSoLuong: tongSoLuongTatCa,
    }))
  }

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

    // console.log('Tổng số người lớn tất cả:', tongSoNguoiLonTatCa)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    setBooKing((prevState) => ({
      ...prevState,
      soNguoiLon: tongSoNguoiLonTatCa,
    }))
  }

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

    // console.log('Tổng số trẻ em tất cả:', tongSoTreEmTatCa)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    setBooKing((prevState) => ({
      ...prevState,
      soTreEm: tongSoTreEmTatCa,
    }))
  }

  const handleLoaiGiaChange = (event, maLoaiPhong) => {
    const selectedMaGiaPhong = event.target.value

    if (!selectedMaGiaPhong) {
      console.error('Không tìm thấy Mã Giá Phòng!')
      return
    }

    const selectedGia =
      getGiaOptions(maLoaiPhong).find(
        (option) => option.maLoaiGia.toString() === selectedMaGiaPhong,
      )?.gia || 0

    const maGiaPhong =
      getGiaOptions(maLoaiPhong).find(
        (option) => option.maLoaiGia.toString() === selectedMaGiaPhong,
      )?.maGiaPhong || 0

    // Cập nhật rows với giá mới
    const updatedRows = rows.map((row) => {
      if (row.loaiPhong.maLoaiPhong === maLoaiPhong) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
        const tienPhong = selectedGia * (row.soLuong || 0) * soDem
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
        const tongTienDong = tienPhong + tienExtraBed
        return {
          ...row,
          loaiGia: {
            ...row.loaiGia,
            maLoaiGia: selectedMaGiaPhong,
          },
          giaPhong: { maGiaPhong: maGiaPhong },
          gia: selectedGia,
          tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các hàng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tienPhong = (row.gia || 0) * (row.soLuong || 0) * soDem
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      return sum + tienPhong + tienExtraBed
    }, 0)

    setRows(updatedRows)
    setTongTienKhachCanTra(tongTienTatCa - (booKing.tienCoc || 0))
    updateChiTietBooKings(updatedRows)

    setBooKing((prevState) => ({
      ...prevState,
      tongTien: tongTienTatCa,
    }))
  }

  const handleGiaChange = (value, maLoaiPhong) => {
    const rawValue = value.replace(/[^0-9]/g, '')
    if (!isNaN(rawValue)) {
      const numericValue = Math.max(0, Number(rawValue))

      // Cập nhật giá trị 'gia' và tính lại tổng tiền cho từng dòng
      const updatedRows = rows.map((row) => {
        if (row.loaiPhong.maLoaiPhong === maLoaiPhong.maLoaiPhong) {
          const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
          const tienPhong = numericValue * (row.soLuong || 0) * soDem
          const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
          const tongTienDong = tienPhong + tienExtraBed
          return { ...row, gia: numericValue, tongTienDong }
        }
        return row
      })

      // Tính tổng tiền tất cả các hàng
      const tongTienTatCa = updatedRows.reduce((sum, row) => {
        if (row.tongTienDong !== undefined) {
          return sum + row.tongTienDong
        }

        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
        const tienPhong = (row.gia || 0) * (row.soLuong || 0) * soDem
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
        return sum + tienPhong + tienExtraBed
      }, 0)

      setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
      setRows(updatedRows)
      updateChiTietBooKings(updatedRows)

      setBooKing((prevState) => ({
        ...prevState,
        tongTien: tongTienTatCa,
      }))
    }
  }

  const handleLyChange = (event, maLoaiPhong) => {
    const value = event.target.value

    const updatedRows = rows.map((row) =>
      row.loaiPhong === maLoaiPhong
        ? {
            ...row,
            ghiChu: value,
          }
        : row,
    )

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)
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

  // const [loaiPhong, setLoaiPhong] = useState([])
  // const [loaiGia, setLoaiGia] = useState([])
  const [giaPhong, setGiaPhong] = useState([])

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
        setyeuCau(yeuCau)
        // setLoaiPhong(loaiPhong)
        // setLoaiGia(loaiGia)
        setGiaPhong(giaPhong)
      } else {
        addToast(exampleToast('Không thể tải danh sách. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      addToast(exampleToast('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!'))
    }
  }

  // const [chiTietBooKing, setChiTietBooKing] = useState([])

  const [loading, setLoading] = useState(false)

  const ChiTietBooKing = async (ma_booking) => {
    try {
      // Hiển thị trạng thái đang tải (loading)
      setLoading(true)

      // Gọi API lấy chi tiết đặt phòng
      const chitietbooking = await getChiTietBooKingByMaBooKing(ma_booking, navigate)

      if (chitietbooking) {
        // Cập nhật chi tiết booking
        // setChiTietBooKing(chitietbooking)

        // Cập nhật rows với dữ liệu đã kiểm tra
        setRows(chitietbooking)
        updateChiTietBooKings(chitietbooking) // <--- Thêm dòng này
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

  // Thêm state mới
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [ngayDen, setNgayDen] = useState('')
  const [ngayDi, setNgayDi] = useState('')

  const BooKing = async (ma_booking) => {
    try {
      const booking = await getBooKingByMaBooKing(ma_booking, navigate)

      if (booking) {
        const chitietbooking = await ChiTietBooKing(ma_booking)

        setRowsHoiNghi(booking?.phongHoiNghis || [])
        if (chitietbooking) {
          setRows(chitietbooking)

          setNgayDen(booking.ngayDen)
          setNgayDi(booking.ngayDi)

          setBooKing(booking)

          setValueNgayDen(booking.ngayDen)
          setValueNgayDi(booking.ngayDi)

          setBooKing((prev) => ({
            ...prev,
            ...booking,
            chiTietBooKings: chitietbooking,
          }))

          // Gọi kiemTraPhongTrong khi load lần đầu
          if (isInitialLoad) {
            kiemTraPhongTrong(booking.ngayDen, booking.ngayDi, navigate)
            setIsInitialLoad(false)
          }
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
  // Sửa lại useEffect
  useEffect(() => {
    DanhSach()
    BooKing(ma_booking)
    // Set isInitialLoad thành false sau khi component mount
    setIsInitialLoad(false)
  }, [ma_booking])
  // save thông tin đặt phòng

  const [booKing, setBooKing] = useState({
    ngayDen: '',
    ngayDi: '',
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
      maDanhXung: '',
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
    chiTietBooKings: [],
    phongHoiNghis: [],
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

  const [tongTienKhachCanTra, setTongTienKhachCanTra] = useState(0)

  const handleOnValueChange = (value) => {
    setBooKing((prev) => {
      const newTienCoc = value || 0 // Nếu giá trị rỗng, set về 0

      // Tính tổng tiền tất cả các hàng
      const tongTienTatCa = rows.reduce((sum, row) => sum + (row.gia || 0) * (row.soLuong || 0), 0)

      // Tính tổng tiền khách cần trả sau khi trừ tiền cọc
      const tongTienKhachTra = Math.max(tongTienTatCa - newTienCoc, 0) // Đảm bảo không âm

      // Cập nhật state tổng tiền khách trả
      setTongTienKhachCanTra(tongTienKhachTra)

      return { ...prev, tienCoc: newTienCoc }
    })
  }

  // Đồng bộ rows với booKing.chiTietBooKings
  const updateChiTietBooKings = (updatedRows) => {
    let tongTien = 0
    const chiTietBooKings = updatedRows.map((row) => {
      const ngayDen = new Date(row.ngayDen.split('/').reverse().join('-'))
      const ngayDi = new Date(row.ngayDi.split('/').reverse().join('-'))
      const soDem = Math.ceil((ngayDi - ngayDen) / (1000 * 60 * 60 * 24))

      // Tính tổng tiền từ giaPhongTheoNgays
      tongTien +=
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

      // Tính tiền extra bed
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      tongTien += tienExtraBed

      // Tính tiền phụ thu trẻ em
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      tongTien += tienPhuThuTreEm

      // Tính tiền phụ thu ăn sáng
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      tongTien += tienPhuThuAnSang

      const tongTienDong = row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0)

      return {
        index: row.index,
        maChiTietBooking: row.maChiTietBooking,
        ngayDen: row.ngayDen ? new Date(row.ngayDen).toLocaleDateString('en-CA') : null,
        ngayDi: row.ngayDi ? new Date(row.ngayDi).toLocaleDateString('en-CA') : null,
        gioDen: row.gioDen,
        gioDi: row.gioDi,
        soDem: soDem,
        soLuong: row.soLuong,
        soLuongDuBaoPhong: row.soLuongDuBaoPhong,
        soLuongExtraBed: row.soLuongExtraBed,
        giaExtraBed: row.giaExtraBed ? parseFloat(row.giaExtraBed) : 0,
        giaPhuThuTreEm: row.giaPhuThuTreEm ? parseFloat(row.giaPhuThuTreEm) : 0,
        soLuongPhuThuTreEm: row.soLuongPhuThuTreEm,
        giaPhuThuAnSang: row.giaPhuThuAnSang ? parseFloat(row.giaPhuThuAnSang) : 0,
        soLuongPhuThuAnSang: row.soLuongPhuThuAnSang || 0,
        nguoiLon: row.nguoiLon,
        treEm: row.treEm,
        // gia: row.gia ? parseFloat(row.gia) : null,
        // tienPhong: (row.gia || 0) * (row.soLuong || 0) * soDem,
        gia: tongTienDong,
        tienPhong: tongTienDong * row.soLuong,
        loaiPhong: row.loaiPhong, // Chỉ gửi mã loại phòng
        loaiGia: { maLoaiGia: row.loaiGia?.maLoaiGia || 0 }, // Chỉ gửi mã loại giá
        giaPhong: { maGiaPhong: row.giaPhong?.maGiaPhong },
        ghiChu: row.ghiChu,
        danhSachPhongChiTiets: row.danhSachPhongChiTiets,
        giaPhongTheoNgays: row.giaPhongTheoNgays || [],
      }
    })
    console.log('tongTien:', tongTien)
    setBooKing((prev) => ({ ...prev, chiTietBooKings, tongTien: tongTien }))
  }

  // console.log('booKing:', booKing)

  // console.log('booKing:', rows)
  const [trangthaiload, setTrangthaiload] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsTableLoading(true)
    try {
      // Kiểm tra số lượng extra bed và giá extra bed
      const hasInvalidExtraBed = rows.some((row) => {
        if (row.soLuongExtraBed === 0 && row.giaExtraBed > 0) {
          addToast(exampleToast('⚠️ Vui lòng xóa giá Extra Bed khi số lượng Extra Bed = 0!'))
          return true
        }
        return false
      })

      if (hasInvalidExtraBed) {
        return
      }

      // Kiểm tra các điều kiện form trước khi gọi API
      if (!booKing?.danhXung?.maDanhXung) {
        return addToast(exampleToast('⚠️ Chưa chọn danh xưng'))
      }

      if (!booKing?.khachHangBooKing?.hoKhachHangBooking?.trim()) {
        return addToast(exampleToast('⚠️ Chưa nhập Last Name'))
      }

      console.log('booKing:', booKing)

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

        // Kiểm tra giá từng ngày
        const ngayDen = new Date(item.ngayDen.split('/').reverse().join('-'))
        const ngayDi = new Date(item.ngayDi.split('/').reverse().join('-'))
        ngayDi.setDate(ngayDi.getDate() - 1)

        const hasInvalidPrice = getDatesBetween(ngayDen, ngayDi).some((date) => {
          const ngayStr = date.toISOString().split('T')[0]
          const giaNgay =
            giaTheoNgay[item.loaiPhong.maLoaiPhong]?.[ngayStr] ||
            getGiaTheoLoaiNgay(item.loaiPhong.maLoaiPhong, date)
          return !giaNgay || giaNgay <= 0
        })

        if (hasInvalidPrice) {
          addToast(
            exampleToast(
              `⚠️ Loại phòng ${item.loaiPhong.tenLoaiPhong} có ngày chưa nhập giá hoặc giá <= 0`,
            ),
          )
          return true
        }

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

        // Kiểm tra tổng số phòng đã chọn có khớp với số lượng không
        if (tongSoPhongDaChon !== item.soLuong) {
          addToast(
            exampleToast(
              `⚠️ Loại phòng ${item.loaiPhong.tenLoaiPhong} cần chọn đúng ${item.soLuong} phòng (đã chọn ${tongSoPhongDaChon} phòng)`,
            ),
          )
          return true
        }

        // Nếu có extra bed, kiểm tra số lượng phòng extra
        if (item.soLuongExtraBed > 0) {
          if (soPhongExtraDaChon < item.soLuongExtraBed) {
            addToast(
              exampleToast(
                `⚠️ Loại phòng ${item.loaiPhong.tenLoaiPhong} cần chọn đúng ${item.soLuongExtraBed} phòng extra (đã chọn ${soPhongExtraDaChon} phòng)`,
              ),
            )
            return true
          }
        }

        return false
      })

      // 3. Nếu có lỗi, dừng không gọi API
      if (isInvalidDetail) return

      // Chuyển đổi ngày về định dạng yyyy-MM-dd trước khi gửi
      const formatDateToISO = (dateInput) => {
        if (!dateInput) return null
        if (typeof dateInput === 'string' && dateInput.includes('/')) {
          const [day, month, year] = dateInput.split('/')
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        return dateInput
      }

      const bookingToSend = {
        ...booKing,
        ngayDen: formatDateToISO(booKing.ngayDen),
        ngayDi: formatDateToISO(booKing.ngayDi),
      }

      console.log('data gui di:', bookingToSend)

      setTrangthaiload(true)
      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await updateBooking(ma_booking, bookingToSend, navigate)
      console.log('Booking created successfully:', response)
      setTrangthaiload(false)
      setIsTableLoading(false)
      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast('❌ ' + response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))

        // Reload thông tin booking sau khi update thành công
        try {
          // Reset loading state
          setLoading(true)

          // Reload dữ liệu booking
          await BooKing(ma_booking)

          // Reset phongOptions để load lại danh sách phòng
          setPhongOptions({})
          setLoadingPhong(false)
        } catch (error) {
          console.error('Lỗi khi reload dữ liệu:', error)
          addToast(exampleToast('⚠️ Cập nhật thành công nhưng không thể tải lại dữ liệu'))
        }
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
      setIsTableLoading(false)
    }
  }

  const [listLoaiPhongTrong, setListLoaiPhongTrong] = useState([])
  const kiemTraPhongTrong = async (ngayDen, ngayDi) => {
    const ngay_den = format(ngayDen, 'yyyy-MM-dd')
    const ngay_di = format(ngayDi, 'yyyy-MM-dd')
    // console.log('dã goi jvào')
    try {
      const listloaiphong = await getAllLoaiPhongTrongTrongKhoanThoiGian(
        ngay_den,
        ngay_di,
        navigate,
      )
      if (listloaiphong) {
        setListLoaiPhongTrong(listloaiphong)
        // Đồng bộ lại rows với thông tin extra bed mới nhất
        setRows((prevRows) =>
          prevRows.map((row) => {
            const found = listloaiphong.find(
              (item) => item.maLoaiPhong === row.loaiPhong.maLoaiPhong,
            )
            return {
              ...row,
              tongSoLuongExtraBed: found?.tongSoGiuongThem || 0,
              tongSoLuongExtraBedDaSuDung: found?.tongSoGiuongDaSuDung || 0,
            }
          }),
        )
        addToast(exampleToast('✔️ Tải danh sách thành công'))
      } else {
        addToast(exampleToast('❌ Không thể tải danh sách loại phòng trống. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại phòng trống:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [visibleHuyBooKing, setVisibleHuyBooKing] = useState(false)
  const [ma_chitiet, setMa_chitiet] = useState('')
  const [tenLoaiPhongXoa, setTenLoaiPhongXoa] = useState('')
  const handleXoaLoaiPhongBooking = (ma_chitiet, tenLoaiPhong, index) => {
    console.log(ma_chitiet, tenLoaiPhong)
    if (ma_chitiet === undefined || ma_chitiet === null || ma_chitiet === '') {
      // Nếu là dòng mới thêm vào (ma_chitiet === undefined), gọi handleRemoveRow
      handleRemoveRow(index)
      return
    }
    setMa_chitiet(ma_chitiet)
    setTenLoaiPhongXoa(tenLoaiPhong)
    setVisibleHuyBooKing(true)
  }

  // Xóa dòng theo index và cập nhật lại các giá trị tổng
  const handleRemoveRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)

    // Tính tổng số lượng, người lớn, trẻ em và tổng tiền sau khi xóa
    const tongSoLuong = updatedRows.reduce((sum, row) => sum + (row.soLuong || 0), 0)
    const tongNguoiLon = updatedRows.reduce((sum, row) => sum + (row.nguoiLon || 0), 0)
    const tongTreEm = updatedRows.reduce((sum, row) => sum + (row.treEm || 0), 0)

    // Tính tổng tiền tất cả các hàng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tienPhong = (row.gia || 0) * (row.soLuong || 0) * soDem
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      return sum + tienPhong + tienExtraBed
    }, 0)

    // Cập nhật tổng tiền khách cần trả
    const newTongTienKhachCanTra = Math.max(tongTienTatCa - booKing.tienCoc, 0)
    setTongTienKhachCanTra(newTongTienKhachCanTra)

    // console.log('Tổng số lượng:', tongSoLuong)
    // console.log('Tổng người lớn:', tongNguoiLon)
    // console.log('Tổng trẻ em:', tongTreEm)
    // console.log('Tổng tiền tất cả:', tongTienTatCa)
    // console.log('Tổng tiền khách cần trả mới:', newTongTienKhachCanTra)

    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật các state
    setBooKing((prevState) => ({
      ...prevState,
      tongTien: tongTienTatCa,
      tongSoLuong: tongSoLuong,
      soNguoiLon: tongNguoiLon,
      soTreEm: tongTreEm,
    }))
  }

  const ChoXyLyXoaLoaiPhong = async (data) => {
    if (data.trangthai) {
      setVisibleHuyBooKing(false)

      // Reload thông tin booking sau khi xóa thành công
      try {
        // Reset loading state
        setLoading(true)

        // Reload dữ liệu booking
        await BooKing(ma_booking)

        // Reset phongOptions để load lại danh sách phòng
        setPhongOptions({})
        setLoadingPhong(false)

        addToast(exampleToast('✔️ Xóa loại phòng thành công và đã tải lại thông tin booking'))
      } catch (error) {
        console.error('Lỗi khi reload dữ liệu sau khi xóa:', error)
        addToast(exampleToast('⚠️ Xóa thành công nhưng không thể tải lại dữ liệu'))
      } finally {
        setLoading(false)
      }
    }
  }

  const ChoXyLyXoaPhongHoiNghi = () => {}
  const [visibleXoaHoiNghi, setVisbleXoaHoiNghi] = useState(false)
  const [maPhongHoiNghi, setMaPhongHoiNghi] = useState('')

  const handleHienThiXoaHoiNghi = (ma_phong_hoi_nghi) => {
    if (ma_phong_hoi_nghi === null || ma_phong_hoi_nghi === '' || ma_phong_hoi_nghi === undefined) {
      addToast(exampleToast('Mã hội nghị không hợp lệ vui lòng thử lại'))
      return
    }
    setMaPhongHoiNghi(maPhongHoiNghi)
    setVisbleXoaHoiNghi(true)
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

  // Hàm chuẩn hóa ngày về dạng yyyy-MM-dd
  const toDateString = (d) => {
    if (!d) return ''
    if (typeof d === 'string') {
      // Nếu đã đúng định dạng yyyy-MM-dd thì trả về luôn
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
      // Nếu là dạng dd/MM/yyyy thì chuyển về yyyy-MM-dd
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [day, month, year] = d.split('/')
        return `${year}-${month}-${day}`
      }
      // Nếu là dạng khác, cố gắng parse
      const dateObj = new Date(d)
      if (!isNaN(dateObj)) {
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      return ''
    }
    if (d instanceof Date) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return ''
  }

  // Hàm tính số đêm giữa hai ngày, luôn nhận đầu vào yyyy-MM-dd
  const tinhSoDem = (ngayDen, ngayDi) => {
    if (!ngayDen || !ngayDi) return 0
    const ngayDenStr = toDateString(ngayDen)
    const ngayDiStr = toDateString(ngayDi)
    const den = new Date(ngayDenStr)
    const di = new Date(ngayDiStr)
    return Math.ceil((di - den) / (1000 * 60 * 60 * 24))
  }

  // State cho dòng hội nghị
  const [rowsHoiNghi, setRowsHoiNghi] = useState([])

  // Thêm dòng hội nghị
  const handleAddRowHoiNghi = () => {
    if (rowsHoiNghi.length === 0) {
      setRowsHoiNghi([
        {
          tenPhongHoiNghi: 'Phòng hội nghị, phòng hợp',
          ngayBatDau: valueNgayDen.toLocaleDateString('en-CA'),
          ngayKetThuc: valueNgayDi.toLocaleDateString('en-CA'),
          soLuong: 1,
          donGia: 0,
          ghiChu: '',
        },
      ])
    }
  }

  // Xóa dòng hội nghị
  const handleRemoveRowHoiNghi = () => {
    setRowsHoiNghi([])
  }

  // Khi thay đổi trường trong hội nghị, cập nhật rowsHoiNghi và cập nhật booKing.phongHoiNghis
  const handleHoiNghiChange = (idx, field, value) => {
    setRowsHoiNghi((rows) => {
      const updated = rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
      // Đồng bộ với booking để khi Update gửi đúng dữ liệu mới nhất
      setBooKing((prev) => ({ ...prev, phongHoiNghis: updated }))
      return updated
    })
  }

  // Tính tổng tiền hội nghị
  const tongTienHoiNghi = rowsHoiNghi.reduce(
    (sum, row) => sum + (parseFloat(row.donGia) || 0) * (parseInt(row.soLuong) || 0),
    0,
  )

  // ngày 12-05-2025 bổ sung thêm cột phòng
  const [phongOptions, setPhongOptions] = useState({})
  const fetchPhongOptions = async (maloaiphong, ngayDen, ngayDi) => {
    if (!ngayDen || !ngayDi) {
      console.warn('Dữ liệu chưa sẵn sàng, không gọi API.')
      return
    }

    try {
      const ngayDenFormatted = format(new Date(ngayDen), 'yyyy-MM-dd')
      const ngayDiFormatted = format(new Date(ngayDi), 'yyyy-MM-dd')

      const phong = await getListPhongTrongTheoKhoanThoiGianAndBooking(
        maloaiphong,
        ngayDenFormatted,
        ngayDiFormatted,
        ma_booking,
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

  const [loadingPhong, setLoadingPhong] = useState(false)

  useEffect(() => {
    // Chỉ fetch khi đã có rows và ngày đến/ngày đi hợp lệ
    if (rows.length > 0 && ngayDen && ngayDi && loadingPhong === false) {
      rows.forEach((row) => {
        if (row.loaiPhong && row.loaiPhong.maLoaiPhong && row.loaiPhong.maLoaiPhong !== '0') {
          fetchPhongOptions(row.loaiPhong.maLoaiPhong, ngayDen, ngayDi)
          setLoadingPhong(true)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, ngayDen, ngayDi])

  const handleSoPhongChange = async (selectedOptions, { rowIndex, maLoaiPhong, ma_chitiet }) => {
    console.log('selectedOptions', selectedOptions)
    // Lấy dòng cần cập nhật - rowIndex bắt đầu từ 1
    const row =
      rows.find((r) => r.index === rowIndex) || rows.find((r) => r.loaiPhong === maLoaiPhong)
    if (!row) return

    // Đếm số phòng thường và extra
    // const soPhongThuong = selectedOptions.filter((opt) => opt.soGiuongThem !== 1).length
    const soPhongExtra = selectedOptions.filter((opt) => opt.soGiuongThem === 1).length

    if (selectedOptions.length > row.soLuong) {
      addToast(exampleToast('⚠️ Số phòng chọn không được vượt quá số lượng!'))
      return
    }

    // Kiểm tra trùng phòng với các dòng khác
    const selectedPhongIds = selectedOptions.map((option) => option.maPhong)
    const isDuplicatePhong = rows.some((otherRow) => {
      // Bỏ qua dòng hiện tại
      if (otherRow.index === rowIndex) return false

      // Kiểm tra xem có phòng nào trùng với dòng khác không
      return otherRow.danhSachPhongChiTiets?.some((phong) =>
        selectedPhongIds.includes(phong.maPhong),
      )
    })

    if (isDuplicatePhong) {
      addToast(exampleToast('⚠️ Phòng đã được chọn ở dòng khác! Vui lòng chọn phòng khác.'))
      return
    }

    // Kiểm tra số lượng phòng extra chỉ khi đang thêm phòng mới
    if (selectedOptions.length > (row.danhSachPhongChiTiets?.length || 0)) {
      if (soPhongExtra < row.soLuongExtraBed && row.soLuongExtraBed > 0) {
        addToast(exampleToast('⚠️ Số phòng Extra chọn không được nhỏ quá số lượng Extra Bed!'))
        return
      }
    }

    // Cập nhật lại rows
    const updatedRows = rows.map((r, idx) => {
      if (r.index === rowIndex) {
        // const soDem = tinhSoDem(r.ngayDen, r.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        // const tongTienPhong =
        //   r.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (r.soLuong || 0)

        // // Tính tiền extra bed
        // const tienExtraBed = (r.giaExtraBed || 0) * (r.soLuongExtraBed || 0) * soDem

        // Tổng tiền của dòng
        // const tongTienDong = tongTienPhong + tienExtraBed

        return {
          ...r,
          danhSachPhongChiTiets: selectedOptions,
          // tongTienDong: tongTienDong,
        }
      }
      return r
    })

    // Tính tổng tiền tất cả các dòng
    // const tongTienTatCa = updatedRows.reduce((sum, row) => sum + (row.tongTienDong || 0), 0)

    // setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // setBooKing((prev) => ({
    //   ...prev,
    //   tongTien: tongTienTatCa,
    // }))
  }

  const handleGiaExtraChange = (value, maLoaiPhong, soLuongExtraBed, index) => {
    // Xử lý trường hợp giá trị bị xóa hoàn toàn
    if (!value) {
      value = '0'
    }

    // Loại bỏ các ký tự không phải số
    const rawValue = value.toString().replace(/[^\d]/g, '')

    // Chuyển đổi về số nguyên và đảm bảo không âm
    const numericValue = Math.max(0, Number(rawValue))

    // Kiểm tra nếu nhập giá extra bed > 0 thì số lượng extra bed phải > 0
    const row = rows.find((r) => r.index === index)
    if (numericValue > 0 && (!row?.soLuongExtraBed || row.soLuongExtraBed <= 0)) {
      addToast(exampleToast('⚠️ Vui lòng nhập số lượng Extra Bed lớn hơn 0 trước khi nhập giá!'))
      return
    }

    // Cập nhật giá trị 'giaExtraBed' và tính lại tổng tiền cho từng dòng
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = numericValue * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

        // Tổng tiền của dòng = tiền phòng + tiền extra bed + tiền phụ thu trẻ em + tiền phụ thu ăn sáng
        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return {
          ...row,
          giaExtraBed: numericValue,
          tongTienDong: tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      // Nếu không có tongTienDong, tính lại dựa trên giaPhongTheoNgays
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      return sum + tongTienPhong + tienExtraBed
    }, 0)

    // Cập nhật các state
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật booKing
    setBooKing((prev) => ({
      ...prev,
      tongTien: tongTienTatCa,
    }))
  }

  const handleSoLuongExtraBedChange = (
    index,
    event,
    maLoaiPhong,
    soLuongExtraBedConLai,
    soLuongPhong,
  ) => {
    // Lấy giá trị từ input và chuyển thành số
    let value = parseInt(event.target.value) || 0

    // Kiểm tra nếu số lượng extra bed vượt quá số lượng còn lại
    if (value > soLuongExtraBedConLai) {
      addToast(exampleToast(`⚠️ Số lượng Extra Bed không được vượt quá ${soLuongExtraBedConLai}!`))
      value = soLuongExtraBedConLai
    }

    if (value < 0) {
      addToast(exampleToast('⚠️ Số lượng Extra Bed không được nhỏ hơn 0!'))
      value = 0
    }

    // Kiểm tra nếu số lượng extra bed vượt quá số lượng phòng
    if (value > soLuongPhong) {
      addToast(exampleToast('⚠️ Số lượng Extra Bed không được vượt quá số lượng phòng!'))
      value = soLuongPhong
    }

    // Cập nhật rows với số lượng extra bed mới
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * value * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

        // Tổng tiền của dòng = tiền phòng thường + tiền extra bed + tiền phụ thu trẻ em + tiền phụ thu ăn sáng
        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return {
          ...row,
          soLuongExtraBed: value,
          tongTienDong: tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      return sum + tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang
    }, 0)

    // Cập nhật các state
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật booKing
    // setBooKing((prev) => ({
    //   ...prev,
    //   tongTien: tongTienTatCa,
    // }))

    // Log để kiểm tra
    // console.log('Số lượng Extra Bed mới:', value)
    // console.log('Tổng tiền tất cả:', tongTienTatCa)
    // console.log('Tổng tiền khách cần trả:', tongTienTatCa - booKing.tienCoc)
  }

  const handlegiaPhuThuTreEmChange = (value, index) => {
    // Xử lý trường hợp giá trị bị xóa hoàn toàn
    if (!value) {
      value = '0'
    }

    // Loại bỏ các ký tự không phải số
    const rawValue = value.toString().replace(/[^\d]/g, '')

    // Chuyển đổi về số nguyên và đảm bảo không âm
    const numericValue = Math.max(0, Number(rawValue))

    // Cập nhật rows với giá phụ thu trẻ em mới
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = numericValue * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

        // Tổng tiền của dòng = tiền phòng + tiền extra bed + tiền phụ thu trẻ em + tiền phụ thu ăn sáng
        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return {
          ...row,
          giaPhuThuTreEm: numericValue,
          tongTienDong: tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      // Nếu không có tongTienDong, tính lại dựa trên giaPhongTheoNgays
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      return sum + tongTienPhong + tienExtraBed + tienPhuThuTreEm
    }, 0)

    // Cập nhật các state
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật booKing
    setBooKing((prev) => ({
      ...prev,
      tongTien: tongTienTatCa,
    }))
  }

  const handlesoLuongPhuThuTreEmChange = (event, index) => {
    // Lấy giá trị từ input và chuyển thành số
    let value = parseInt(event.target.value) || 0

    // Kiểm tra giá trị không âm
    if (value < 0) {
      addToast(exampleToast('⚠️ Số lượng phụ thu trẻ em không được nhỏ hơn 0!'))
      value = 0
    }

    // Kiểm tra nếu số lượng phụ thu trẻ em vượt quá số lượng trẻ em
    // const row = rows.find((r) => r.index === index)
    // if (row && value > (row.treEm || 0)) {
    //   addToast(
    //     exampleToast(
    //       `⚠️ Số lượng phụ thu trẻ em không được vượt quá số lượng trẻ em (${row.treEm})!`,
    //     ),
    //   )
    //   value = row.treEm || 0
    // }

    // Cập nhật rows với số lượng phụ thu trẻ em mới
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * value * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem

        // Tổng tiền của dòng = tiền phòng + tiền extra bed + tiền phụ thu trẻ em + tiền phụ thu ăn sáng
        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return {
          ...row,
          soLuongPhuThuTreEm: value,
          tongTienDong: tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      return sum + tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang
    }, 0)

    // Cập nhật các state
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật booKing
    setBooKing((prev) => ({
      ...prev,
      tongTien: tongTienTatCa,
    }))
  }

  // Hàm xử lý thay đổi số lượng phụ thu ăn sáng
  const handlesoLuongPhuThuAnSangChange = (event, index) => {
    // Lấy giá trị từ input và chuyển thành số
    let value = parseInt(event.target.value) || 0

    // Kiểm tra giá trị không âm
    if (value < 0) {
      addToast(exampleToast('⚠️ Số lượng phụ thu ăn sáng không được nhỏ hơn 0!'))
      value = 0
    }

    // Cập nhật rows với số lượng phụ thu ăn sáng mới
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * value * soDem

        // Tổng tiền của dòng = tiền phòng + tiền extra bed + tiền phụ thu trẻ em + tiền phụ thu ăn sáng
        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return {
          ...row,
          soLuongPhuThuAnSang: value,
          tongTienDong: tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      return sum + tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang
    }, 0)

    // Cập nhật các state
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật booKing
    setBooKing((prev) => ({
      ...prev,
      tongTien: tongTienTatCa,
    }))
  }

  // Hàm xử lý thay đổi giá phụ thu ăn sáng
  const handlegiaPhuThuAnSangChange = (value, index) => {
    // Xử lý trường hợp giá trị bị xóa hoàn toàn
    if (!value) {
      value = '0'
    }

    // Loại bỏ các ký tự không phải số
    const rawValue = value.toString().replace(/[^\d]/g, '')

    // Chuyển đổi về số nguyên và đảm bảo không âm
    const numericValue = Math.max(0, Number(rawValue))

    // Cập nhật rows với giá phụ thu ăn sáng mới
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)

        // Tính tổng tiền từ giaPhongTheoNgays
        const tongTienPhong =
          row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        // Tính tiền phụ thu trẻ em
        const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem

        // Tính tiền phụ thu ăn sáng
        const tienPhuThuAnSang = numericValue * (row.soLuongPhuThuAnSang || 0) * soDem

        // Tổng tiền của dòng = tiền phòng + tiền extra bed + tiền phụ thu trẻ em + tiền phụ thu ăn sáng
        const tongTienDong = tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang

        return {
          ...row,
          giaPhuThuAnSang: numericValue,
          tongTienDong: tongTienDong,
        }
      }
      return row
    })

    // Tính tổng tiền tất cả các dòng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }

      const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
      const tongTienPhong =
        row.giaPhongTheoNgays.reduce((sum, giaNgay) => sum + giaNgay.gia, 0) * (row.soLuong || 0)
      const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem
      const tienPhuThuTreEm = (row.giaPhuThuTreEm || 0) * (row.soLuongPhuThuTreEm || 0) * soDem
      const tienPhuThuAnSang = (row.giaPhuThuAnSang || 0) * (row.soLuongPhuThuAnSang || 0) * soDem
      return sum + tongTienPhong + tienExtraBed + tienPhuThuTreEm + tienPhuThuAnSang
    }, 0)

    // Cập nhật các state
    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    // Cập nhật booKing
    setBooKing((prev) => ({
      ...prev,
      tongTien: tongTienTatCa,
    }))
  }

  // Hàm lấy danh sách ngày giữa 2 ngày
  const getDatesBetween = (startDate, endDate) => {
    const dates = []
    let currentDate = new Date(startDate)
    // Thêm điều kiện <= để bao gồm cả ngày cuối
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  // Hàm format thứ của ngày
  const formatNgayThu = (date) => {
    const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return thu[date.getDay()]
  }

  // Hàm lấy giá theo loại ngày
  const getGiaTheoLoaiNgay = (maLoaiPhong, date) => {
    const options = getGiaOptions(maLoaiPhong)
    const isSaturday = date.getDay() === 6

    // Nếu là Thứ 7, ưu tiên giá cuối tuần
    if (isSaturday) {
      const weekendPrice = options.find((option) => option.giaCuoiTuan)
      return weekendPrice ? weekendPrice.gia : 0
    }
    // Nếu không phải Thứ 7, ưu tiên giá ngày thường
    const weekdayPrice = options.find((option) => option.giaNgayThuong)
    return weekdayPrice ? weekdayPrice.gia : 0
  }

  // Hàm xử lý thay đổi giá theo ngày
  const handleGiaTheoNgayChange = (index, maLoaiPhong, ngay, value) => {
    // Chuyển đổi value thành số
    const numericValue = value ? parseFloat(value.replace(/[^\d]/g, '')) : 0

    // Cập nhật giá theo ngày
    setGiaTheoNgay((prev) => ({
      ...prev,
      [maLoaiPhong]: {
        ...prev[maLoaiPhong],
        [ngay]: numericValue,
      },
    }))

    // Cập nhật lại rows với giá mới
    const updatedRows = rows.map((row) => {
      if (row.index === index) {
        const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
        const ngayDen = new Date(row.ngayDen.split('/').reverse().join('-'))
        const ngayDi = new Date(row.ngayDi.split('/').reverse().join('-'))
        ngayDi.setDate(ngayDi.getDate() - 1)

        // Cập nhật giá trong giaPhongTheoNgays
        const updatedGiaPhongTheoNgays = row.giaPhongTheoNgays.map((giaNgay) => {
          if (giaNgay.ngay === ngay) {
            return {
              ...giaNgay,
              gia: numericValue,
              giaCu: giaNgay.gia, // Lưu giá cũ
            }
          }
          return giaNgay
        })

        // Tính tổng tiền từ giá từng ngày
        const tongTien = updatedGiaPhongTheoNgays.reduce((sum, giaNgay) => {
          return sum + (giaNgay.gia || 0)
        }, 0)

        // Tính tiền extra bed
        const tienExtraBed = (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem

        return {
          ...row,
          giaPhongTheoNgays: updatedGiaPhongTheoNgays,
          tongTienDong: tongTien * (row.soLuong || 0) + tienExtraBed,
        }
      }
      return row
    })

    // Cập nhật tổng tiền tất cả các hàng
    const tongTienTatCa = updatedRows.reduce((sum, row) => {
      if (row.tongTienDong !== undefined) {
        return sum + row.tongTienDong
      }
      return sum
    }, 0)

    setTongTienKhachCanTra(tongTienTatCa - booKing.tienCoc)
    setRows(updatedRows)
    updateChiTietBooKings(updatedRows)

    setBooKing((prev) => ({
      ...prev,
      tongTien: tongTienTatCa,
    }))
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

  // Hàm helper để format ngày hiển thị từ YYYY-MM-DD sang DD/MM/YYYY
  const formatDateToDisplay = (dateInput) => {
    if (!dateInput) return ''

    // Nếu đã là định dạng DD/MM/YYYY
    if (
      typeof dateInput === 'string' &&
      dateInput.includes('/') &&
      dateInput.split('/')[0].length === 2
    ) {
      return dateInput
    }

    // Nếu là YYYY-MM-DD
    if (
      typeof dateInput === 'string' &&
      dateInput.includes('-') &&
      dateInput.split('-')[0].length === 4
    ) {
      const [year, month, day] = dateInput.split('-')
      return `${day}/${month}/${year}`
    }

    // Nếu là Date object
    if (dateInput instanceof Date) {
      const day = String(dateInput.getDate()).padStart(2, '0')
      const month = String(dateInput.getMonth() + 1).padStart(2, '0')
      const year = dateInput.getFullYear()
      return `${day}/${month}/${year}`
    }

    return ''
  }

  // Hàm lấy ngày đến gần nhất (nhỏ nhất trong các dòng)
  const getEarliestNgayDen = () => {
    if (!rows || rows.length === 0) return null
    const ngayDenDates = rows
      .map((row) => createDateFromInput(row.ngayDen))
      .filter((date) => date && !isNaN(date.getTime()))
    if (ngayDenDates.length === 0) return null
    const earliestNgayDen = new Date(Math.min(...ngayDenDates.map((date) => date.getTime())))
    return formatDateToDisplay(earliestNgayDen)
  }

  // Hàm lấy ngày đi xa nhất (lớn nhất trong các dòng)
  const getLatestNgayDi = () => {
    if (!rows || rows.length === 0) return null
    const ngayDiDates = rows
      .map((row) => new Date(row.ngayDi))
      .filter((date) => date && !isNaN(date.getTime()))
    if (ngayDiDates.length === 0) return null
    const latestNgayDi = new Date(Math.max(...ngayDiDates.map((date) => date.getTime())))
    return formatDateToDisplay(latestNgayDi)
  }

  // Đồng bộ ngày đến/đi tổng vào booking khi rows thay đổi
  React.useEffect(() => {
    const earliest = getEarliestNgayDen()
    const latest = getLatestNgayDi()
    setBooKing((prev) => {
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

  // Thêm biến today để disable ngày đến nhỏ hơn hôm nay
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Thêm hàm helper tạo Date từ input (nếu chưa có)
  const createDateFromInput = (dateInput) => {
    if (!dateInput) return new Date()
    if (dateInput instanceof Date) return new Date(dateInput)
    if (typeof dateInput === 'string' && dateInput.includes('/')) {
      const [day, month, year] = dateInput.split('/')
      return new Date(`${year}-${month}-${day}`)
    }
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      return new Date(dateInput)
    }
    return new Date(dateInput)
  }

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
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300 uppercase"
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
                <div>
                  <CFormTextarea
                    className="border-2 border-gray-500"
                    rows={2}
                    value={booKing.ghiChu}
                    name="ghiChu"
                    placeholder="Nhập ghi chú"
                    onChange={onInputChange}
                  ></CFormTextarea>
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

                {/* <div className="">
                  <div className="flex items-center ">
                    <div className="font-semibold cursor-pointer ">
                      <FontAwesomeIcon icon={faCirclePlus} className="text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500 hover:text-blue-300">
                        Thêm yêu cầu
                      </span>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            <div className="relative mb-2">
              <span className="absolute -top-3 left-6 bg-white px-1 text-sm font-semibold">
                Thông tin booking <span className="text-danger"> *</span>
              </span>
              <div className="border-2 border-blue-500 rounded-md p-3 mb-3">
                <div className="w-full bg-white p-3 rounded-lg shadow mb-3">
                  <CCol className="mb-2 border-b" md={12}>
                    <div
                      className="overflow-auto"
                      style={{ maxHeight: '500px', minHeight: '200PX' }}
                    >
                      <div className="min-w-[2600px]">
                        <CTable align="middle" color="light" responsive borderless hover>
                          <CTableHead>
                            <CTableRow color="info">
                              <CTableHeaderCell>Ngày đến</CTableHeaderCell>
                              <CTableHeaderCell>Ngày đi</CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '400px' }}>
                                Loại phòng
                              </CTableHeaderCell>
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
                              {/* <CTableHeaderCell style={{ width: '100px' }}>
                                Dự báo Extra bed
                              </CTableHeaderCell> */}
                              <CTableHeaderCell style={{ width: '110px' }}>
                                SL Extra bed
                              </CTableHeaderCell>
                              <CTableHeaderCell style={{ width: '130px' }}>
                                Phụ thu extra
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
                              <CTableHeaderCell style={{ width: '100px' }}>
                                Tổng tiền
                              </CTableHeaderCell>
                              <CTableHeaderCell>Lý do</CTableHeaderCell>
                              <CTableHeaderCell></CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {isTableLoading ? (
                              <tr>
                                <td colSpan={17} className=" py-5">
                                  <CSpinner color="primary" />
                                </td>
                              </tr>
                            ) : loading ? (
                              <tr>
                                <td colSpan={17} className="text-center py-5">
                                  Đang tải dữ liệu...
                                </td>
                              </tr>
                            ) : (
                              [...rows]
                                .sort((a, b) => a.index - b.index)
                                .map((row, index) => {
                                  const soDem = tinhSoDem(row.ngayDen, row.ngayDi)
                                  const tongTienDong =
                                    (row.giaPhongTheoNgays && row.giaPhongTheoNgays.length > 0
                                      ? row.giaPhongTheoNgays.reduce(
                                          (sum, giaNgay) => sum + giaNgay.gia * (row.soLuong || 0),
                                          0,
                                        )
                                      : 0) +
                                    (row.giaExtraBed || 0) * (row.soLuongExtraBed || 0) * soDem +
                                    (row.giaPhuThuTreEm || 0) *
                                      (row.soLuongPhuThuTreEm || 0) *
                                      soDem

                                  row.tongTienDong = tongTienDong

                                  return (
                                    <CTableRow key={index}>
                                      <CTableDataCell>
                                        <div className="w-36">
                                          <CDatePicker
                                            locale="en-GB"
                                            date={formatDateToISO(row.ngayDen)}
                                            onDateChange={(date) =>
                                              handleDateChangeNgayDen(date, row.index)
                                            }
                                            minDate={createDateFromInput(today)}
                                            disabled={(() => {
                                              const ngayDenDate = createDateFromInput(row.ngayDen)
                                              // So sánh chỉ ngày/tháng/năm, bỏ qua giờ phút giây
                                              return (
                                                ngayDenDate < createDateFromInput(today) &&
                                                ngayDenDate.toDateString() !==
                                                  createDateFromInput(today).toDateString()
                                              )
                                            })()}
                                          />
                                        </div>
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <div className="w-36">
                                          <CDatePicker
                                            locale="en-GB"
                                            date={formatDateToISO(row.ngayDi)}
                                            onDateChange={(date) =>
                                              handleDateChangeNgayDi(date, row.index)
                                            }
                                          />
                                        </div>
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <CFormSelect
                                          value={row.loaiPhong.maLoaiPhong}
                                          onChange={(event) =>
                                            handleLoaiPhongChange(event, row.index)
                                          }
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
                                      <CTableDataCell>{row.soLuongDuBaoPhong}</CTableDataCell>
                                      <CTableDataCell>
                                        <CFormInput
                                          type="number"
                                          value={row.soLuong}
                                          onChange={(event) =>
                                            handleSoLuongChange(
                                              event,
                                              row.loaiPhong,
                                              row.soLuongExtraBed,
                                            )
                                          }
                                          // disabled={daXepPhong && !row.isNew}
                                        />
                                      </CTableDataCell>

                                      <CTableDataCell>
                                        <CFormInput
                                          type="number"
                                          value={row.nguoiLon}
                                          onChange={(event) =>
                                            handleSLNguoiLonChange(event, row.loaiPhong)
                                          }
                                        />
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <CFormInput
                                          type="number"
                                          value={row.treEm}
                                          onChange={(event) =>
                                            handleSLTreEmChange(event, row.loaiPhong)
                                          }
                                        />
                                      </CTableDataCell>
                                      {/* <CTableDataCell className="text-center">
                                        {(row.tongSoLuongExtraBed || 0) -
                                          (row.tongSoLuongExtraBedDaSuDung || 0)}
                                        /{row.tongSoLuongExtraBed || 0}
                                      </CTableDataCell> */}
                                      <CTableDataCell>
                                        <CFormInput
                                          type="number"
                                          value={row.soLuongExtraBed}
                                          onChange={(event) =>
                                            handleSoLuongExtraBedChange(
                                              row.index,
                                              event,
                                              row.loaiPhong,
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
                                          onValueChange={(value) =>
                                            handleGiaExtraChange(
                                              value,
                                              row.loaiPhong,
                                              row.soLuongExtraBed,
                                              row.index,
                                            )
                                          }
                                        />
                                      </CTableDataCell>

                                      <CTableDataCell>
                                        <CFormInput
                                          type="number"
                                          value={row.soLuongPhuThuTreEm}
                                          onChange={(event) =>
                                            handlesoLuongPhuThuTreEmChange(event, row.index)
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
                                          onValueChange={(input) =>
                                            handlegiaPhuThuTreEmChange(input, row.index)
                                          }
                                        />
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <CFormInput
                                          type="number"
                                          value={row.soLuongPhuThuAnSang}
                                          onChange={(event) =>
                                            handlesoLuongPhuThuAnSangChange(event, row.index)
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
                                              handlegiaPhuThuAnSangChange(input, row.index)
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
                                          options={phongOptions[row.loaiPhong.maLoaiPhong] || []}
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
                                          value={
                                            row.danhSachPhongChiTiets &&
                                            row.danhSachPhongChiTiets.length > 0
                                              ? phongOptions[row.loaiPhong.maLoaiPhong]?.filter(
                                                  (option) =>
                                                    row.danhSachPhongChiTiets.some(
                                                      (p) => p.maPhong === option.maPhong,
                                                    ),
                                                )
                                              : []
                                          }
                                          onChange={(selected) =>
                                            handleSoPhongChange(selected, {
                                              rowIndex: row.index,
                                              maLoaiPhong: row.loaiPhong,
                                              ma_chitiet: row.maChiTietBooking,
                                            })
                                          }
                                          placeholder="Chọn phòng"
                                          className={
                                            ((row.danhSachPhongChiTiets?.length || 0) < row.soLuong
                                              ? 'border-red-500'
                                              : 'border-green-500') + ' border-2 rounded'
                                          }
                                          isOptionDisabled={(option) => {
                                            // Kiểm tra xem phòng này đã được chọn ở dòng khác chưa
                                            const isPhongDaChonOChoKhac = rows.some((otherRow) => {
                                              // Bỏ qua dòng hiện tại
                                              if (otherRow.index === row.index) return false

                                              // Kiểm tra xem phòng này có trong danh sách phòng của dòng khác không
                                              return otherRow.danhSachPhongChiTiets?.some(
                                                (phong) => phong.maPhong === option.maPhong,
                                              )
                                            })

                                            if (isPhongDaChonOChoKhac) {
                                              return true
                                            }

                                            // Trường hợp 1: Nếu soLuong = soLuongExtraBed, chỉ cho phép chọn phòng có extra bed
                                            if (row.soLuong === row.soLuongExtraBed) {
                                              return option.soGiuongThem !== 1
                                            }

                                            // Trường hợp 2: Nếu soLuong > soLuongExtraBed
                                            if (row.soLuong > row.soLuongExtraBed) {
                                              // Nếu đã chọn đủ số phòng extra, disable các phòng extra còn lại
                                              // if (soPhongExtraDaChon >= row.soLuongExtraBed) {
                                              //   return option.soGiuongThem === 1
                                              // }
                                              // Nếu chưa chọn đủ số phòng extra, cho phép chọn cả 2 loại
                                              return false
                                            }

                                            return false
                                          }}
                                        />
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <CFormSelect
                                          value={row.loaiGia?.maLoaiGia}
                                          onChange={(event) =>
                                            handleLoaiGiaChange(event, row.loaiPhong.maLoaiPhong)
                                          }
                                        >
                                          <option value="0">Chọn giá</option>
                                          {getGiaOptions(row.loaiPhong.maLoaiPhong).map(
                                            (option) => (
                                              <option
                                                key={option.maGiaPhong}
                                                value={option.maLoaiGia}
                                              >
                                                {`${
                                                  option.tenLoaiGia
                                                } - Giá: ${option.gia.toLocaleString('vi-VN')}`}
                                                {option.giaCuoiTuan ? ' (Cuối tuần)' : ''}
                                                {option.giaNgayThuong ? ' (Ngày thường)' : ''}
                                                {option.giaNgayLe ? ' (Ngày lễ)' : ''}
                                                {option.giaGiuong ? ' (Giường extra)' : ''}
                                              </option>
                                            ),
                                          )}
                                        </CFormSelect>
                                      </CTableDataCell>
                                      {/* <CTableDataCell>
                                      <CurrencyInput
                                        className=" w-28 form-control text-right"
                                        name="input-name"
                                        placeholder="Chọn loại giá"
                                        value={row.gia}
                                        decimalsLimit={2}
                                        onValueChange={(value) =>
                                          handleGiaChange(value, row.loaiPhong)
                                        }
                                      />
                                    </CTableDataCell> */}
                                      <CTableDataCell>
                                        <CPopover
                                          trigger="click"
                                          placement="right"
                                          content={
                                            <div className="p-2 min-w-[200px] max-h-[400px] overflow-y-auto">
                                              <div className="font-semibold mb-3">
                                                Giá loại phòng theo ngày
                                              </div>
                                              <div className="space-y-3">
                                                {(() => {
                                                  const ngayDen = createDateFromInput(row.ngayDen)
                                                  const ngayDi = createDateFromInput(row.ngayDi)
                                                  ngayDi.setDate(ngayDi.getDate() - 1) // Trừ 1 ngày
                                                  const homNay = createDateFromInput(today)
                                                  homNay.setHours(0, 0, 0, 0)

                                                  return getDatesBetween(ngayDen, ngayDi).map(
                                                    (date, index) => {
                                                      const ngayStr = date
                                                        .toISOString()
                                                        .split('T')[0]
                                                      const isSaturday = date.getDay() === 6
                                                      const giaMacDinh = getGiaTheoLoaiNgay(
                                                        row.loaiPhong,
                                                        date,
                                                      )
                                                      const giaPhongTheoNgay =
                                                        row.giaPhongTheoNgays?.find(
                                                          (g) => g.ngay === ngayStr,
                                                        )
                                                      const giaHienTai =
                                                        giaPhongTheoNgay?.gia || giaMacDinh
                                                      const isPastDate = date < homNay

                                                      return (
                                                        <div
                                                          key={index}
                                                          className="flex items-center justify-between gap-2"
                                                        >
                                                          <div
                                                            className={`text-sm ${
                                                              isSaturday
                                                                ? 'text-red-500 font-medium'
                                                                : isPastDate
                                                                  ? 'text-gray-400'
                                                                  : ''
                                                            }`}
                                                          >
                                                            {row.loaiPhong.maLoaiPhong},{' '}
                                                            {formatNgayThu(date)}{' '}
                                                            {date.toLocaleDateString('vi-VN')}
                                                            {isSaturday}:
                                                          </div>
                                                          <div className="relative">
                                                            <CurrencyInput
                                                              className={`outline-none w-32 border-b-2 ${
                                                                isSaturday
                                                                  ? 'border-red-500'
                                                                  : isPastDate
                                                                    ? 'border-gray-300'
                                                                    : 'border-gray-500'
                                                              } rounded-none text-right ${
                                                                isPastDate ? 'bg-gray-100' : ''
                                                              }`}
                                                              value={giaHienTai}
                                                              decimalsLimit={2}
                                                              // disabled={isPastDate}
                                                              onValueChange={(value, _, values) => {
                                                                // if (
                                                                //   !isPastDate &&
                                                                //   value !== giaHienTai
                                                                // ) {
                                                                handleGiaTheoNgayChange(
                                                                  row.index,
                                                                  row.loaiPhong,
                                                                  ngayStr,
                                                                  value,
                                                                )
                                                                // }
                                                              }}
                                                              onBlur={(e) => {
                                                                e.stopPropagation()
                                                              }}
                                                            />
                                                          </div>
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

                                      <CTableDataCell className="text-right">
                                        {tongTienDong.toLocaleString('en-US')}
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <input
                                          type="text"
                                          placeholder="Nhập lý do (nếu có)"
                                          className="bg-transparent outline-none  "
                                          value={row.ghiChu}
                                          onChange={(event) => handleLyChange(event, row.loaiPhong)}
                                        />
                                      </CTableDataCell>
                                      <CTableDataCell>
                                        <FontAwesomeIcon
                                          icon={faDeleteLeft}
                                          className="text-red-500 cursor-pointer"
                                          onClick={() =>
                                            handleXoaLoaiPhongBooking(
                                              row.maChiTietBooking,
                                              row.loaiPhong.tenLoaiPhong,
                                              index,
                                            )
                                          }
                                        />
                                      </CTableDataCell>
                                    </CTableRow>
                                  )
                                })
                            )}
                          </CTableBody>
                          <CTableRow color="secondary">
                            <CTableDataCell className="text-center">
                              {getEarliestNgayDen() || ''}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              {getLatestNgayDi() || ''}
                            </CTableDataCell>

                            <CTableDataCell
                              colSpan={2}
                              className="text-center"
                              scope="col"
                            ></CTableDataCell>

                            <CTableDataCell className="text-center" scope="col">
                              {booKing.tongSoLuong}
                            </CTableDataCell>

                            <CTableDataCell scope="col" className="text-center">
                              {booKing.soNguoiLon}
                            </CTableDataCell>
                            <CTableDataCell scope="col" className="text-center">
                              {booKing.soTreEm}
                            </CTableDataCell>

                            <CTableDataCell
                              colSpan={7}
                              scope="col"
                              className="text-center"
                            ></CTableDataCell>
                            <CTableDataCell className="text-center font-bold">
                              {booKing.tongTien.toLocaleString('en-US')}
                            </CTableDataCell>
                          </CTableRow>
                        </CTable>
                      </div>
                    </div>
                  </CCol>
                </div>

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
              </div>
            </div>
            {/* <div className="relative mb-3">
              <span className="absolute -top-3 left-6 bg-white px-1 text-sm font-semibold">
                Hội nghị
              </span>
              <div className="border-2 border-blue-500 rounded-md p-4 ">
                <CTable align="middle" responsive borderless hover>
                  <CTableHead>
                    <CTableRow color="success">
                      <CTableHeaderCell style={{ width: '300px' }}>Tên</CTableHeaderCell>

                      <CTableHeaderCell>Ngày bắt đầu</CTableHeaderCell>
                      <CTableHeaderCell>Ngày kết thúc</CTableHeaderCell>
                      <CTableHeaderCell>Số lượng</CTableHeaderCell>
                      <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                      <CTableHeaderCell>Ghi chú</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {rowsHoiNghi.map((row, idx) => (
                      <CTableRow key={idx}>
                        <CTableDataCell>
                          <CFormInput type="text" value={row.tenPhongHoiNghi} readOnly />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CDatePicker
                            locale="en-GB"
                            date={row.ngayBatDau}
                            onDateChange={(date) => handleHoiNghiChange(idx, 'ngayBatDau', date)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CDatePicker
                            locale="en-GB"
                            date={row.ngayKetThuc}
                            onDateChange={(date) => handleHoiNghiChange(idx, 'ngayKetThuc', date)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            type="number"
                            min={1}
                            value={row.soLuong}
                            onChange={(e) =>
                              handleHoiNghiChange(
                                idx,
                                'soLuong',
                                Math.max(1, parseInt(e.target.value) || 1),
                              )
                            }
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CurrencyInput
                            className=" form-control text-right"
                            name="input-name"
                            placeholder="Nhập đơn giá"
                            value={row.donGia}
                            decimalsLimit={2}
                            onValueChange={(value) => handleHoiNghiChange(idx, 'donGia', value)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <CFormInput
                            type="text"
                            value={row.ghiChu}
                            onChange={(e) => handleHoiNghiChange(idx, 'ghiChu', e.target.value)}
                          />
                        </CTableDataCell>
                        <CTableDataCell>
                          <FontAwesomeIcon
                            icon={faDeleteLeft}
                            className="text-red-500 cursor-pointer"
                            onClick={() => handleRemoveRowHoiNghi()}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                {rowsHoiNghi.length === 0 && (
                  <CCol className=" d-md-flex justify-content-md-end">
                    <CButton
                      color="success"
                      onClick={handleAddRowHoiNghi}
                      variant="outline"
                      className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
                    >
                      <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                      Thêm phòng hội nghị
                    </CButton>
                  </CCol>
                )}
              </div>
            </div> */}
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
                    value={(booKing.tongTien - booKing.tienCoc).toLocaleString('en-US')}
                  />
                </div>
              </div>
            </div>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              {/* <CButton color="danger" className="me-md-2" variant="outline">
                <FontAwesomeIcon icon={faXmark} /> Hủy Booking
              </CButton> */}
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

      {/* <ThongBaoDaXepPhongModal visible={daXepPhong} /> */}

      <XoaLoaiPhongChiTiet
        visible={visibleHuyBooKing}
        onClose={() => setVisibleHuyBooKing(false)}
        ma_chitiet={ma_chitiet}
        ma_booking={ma_booking}
        onSubmit={ChoXyLyXoaLoaiPhong}
        tenloaiphong={tenLoaiPhongXoa}
      />

      <XoaPhongHoiNghi
        visible={visibleXoaHoiNghi}
        onClose={() => setVisbleXoaHoiNghi(false)}
        ma_booking={ma_booking}
        ma_phong_hoi_nghi={maPhongHoiNghi}
        onSubmit={ChoXyLyXoaPhongHoiNghi}
      />
    </CRow>
  )
}

export default EditBooKing
