import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CSpinner,
  CFormLabel,
  CFormTextarea,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileInvoiceDollar,
  faPrint,
  faChevronRight,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  AllThongTinKhachHang,
  AllThongTinThanhToan,
  getPhuThuKhiCreateBooking,
} from 'src/service/ThanhToanService'
import { useNavigate, useParams } from 'react-router-dom'
import CurrencyInput from 'react-currency-input-field'
import { CFormCheck, CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react-pro/dist/esm'

import { createAllThongTinThanhToan } from 'src/service/HoaDonService'
import ReportRegistration from './ReportRegistration'
import { getAllHinhThucThanhToanByMa } from 'src/service/APIService'

const AllThanhToan = () => {
  const { ma_booking } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [thongTinKhachHang, setThongTinKhachHang] = useState(null)
  const [thongTinThanhToan, setThongTinThanhToan] = useState(null)

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedPhong, setSelectedPhong] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [phuThu, setPhuThu] = useState([])
  const [giamGia, setGiamGia] = useState(0)
  const [ngayDiMoi, setNgayDiMoi] = useState(null)
  const [showReport, setShowReport] = useState(false)

  const [phuThuTreEm, setPhuThuTreEm] = useState([])
  const [maxNgayDi, setMaxNgayDi] = useState(null)

  const [hinhThucThanhToan, setHinhThucThanhToan] = useState([])
  // Lưu phụ thu check-in trễ theo từng phòng (key = maXepPhongBooking)
  const [phuThuCheckInTreByPhong, setPhuThuCheckInTreByPhong] = useState({})
  const tinhTongGiaPhongTheoNgay = (danhSachGiaPhongTheoNgay, daThanhToanPhong) =>
    Array.isArray(danhSachGiaPhongTheoNgay) && daThanhToanPhong !== true
      ? danhSachGiaPhongTheoNgay.reduce(
          (sum, item) => (item.daThanhToan !== true ? sum + (item.gia || 0) : sum),
          0,
        )
      : 0

  const fetchData = async () => {
    try {
      setLoading(true)
      const [khachHangData, thanhToanData, hinhThucThanhToanData, phuThuData] = await Promise.all([
        AllThongTinKhachHang(ma_booking),
        AllThongTinThanhToan(ma_booking),

        getAllHinhThucThanhToanByMa(),
        getPhuThuKhiCreateBooking(ma_booking),
      ])

      if (khachHangData) {
        console.log('khachHangData', khachHangData)
        setThongTinKhachHang(khachHangData)
      }
      if (thanhToanData && Array.isArray(thanhToanData) && thanhToanData.length > 0) {
        // Tìm dòng có ngày đi lớn nhất
        const maxNgayDiData = thanhToanData.reduce((max, curr) => {
          if (!max) return curr
          const maxDate = new Date(max.ngay_di || max.ngayDi || 0)
          const currDate = new Date(curr.ngay_di || curr.ngayDi || 0)
          return currDate > maxDate ? curr : max
        }, null)
        console.log('thanhToanData (max ngay_di)', maxNgayDiData.ngayDi)
        setMaxNgayDi(maxNgayDiData.ngayDi)
        setThongTinThanhToan(thanhToanData)
      }
      if (
        hinhThucThanhToanData &&
        Array.isArray(hinhThucThanhToanData) &&
        hinhThucThanhToanData.length > 0
      ) {
        console.log('hinhThucThanhToanData', hinhThucThanhToanData)
        setHinhThucThanhToan(hinhThucThanhToanData)
      }
      if (phuThuData && Array.isArray(phuThuData)) {
        console.log('phuThuTreEmData', phuThuData)
        setPhuThu(phuThuData)
      } else {
        setPhuThu([])
      }

      const sumTongTien = thanhToanData.reduce((total, item) => {
        const tienPhong = item.giaPhong * item.soNgayO
        const tienDichVu = item.danhSachDichVu.reduce((sum, dv) => sum + dv.thanhTien, 0)
        const tienPhuThu =
          item.phuThuTienGiuong * item.soGiuong +
          item.phThuTreEm * item.soTre +
          item.phuThuNguoiLon * item.soNguoiLon
        return total + tienPhong + tienDichVu + tienPhuThu * item.soNgayO
      }, 0)

      // Tự động hiển thị chi tiết thanh toán khi load data
      if (khachHangData && thanhToanData) {
        setSelectedBooking({
          ...khachHangData,
          danhSachPhong: thanhToanData,
        })
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  console.log('setSelectedBooking', selectedBooking)

  useEffect(() => {
    if (ma_booking) {
      fetchData()
    }
  }, [ma_booking])

  const handleSelectBooking = (booking) => {
    if (selectedBooking?.ma_booking === booking.ma_booking) {
      setSelectedBooking(null)
      return
    }
    setSelectedBooking(booking)
  }

  const handleViewPhongDetail = (phong) => {
    setSelectedPhong(phong)
    setShowModal(true)
  }

  const formatCurrency = (amount) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    return formattedNumber
  }

  const formatDate = (date) => {
    if (!date) return ''
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
    } catch (error) {
      console.error('Lỗi khi format ngày:', error)
      return date
    }
  }

  const tinhTongTienDichVu = (danhSachDichVu) =>
    Array.isArray(danhSachDichVu)
      ? danhSachDichVu.reduce((total, dichVu) => total + (dichVu.thanhTien || 0), 0)
      : 0

  const tinhTongTienPhuThuCuaPhong = (phong) => {
    const soDem = phong.soNgayO || 1
    return (
      (phong.phuThuTienGiuong || 0) * (phong.soGiuong || 0) * soDem +
      (phong.phThuTreEm || 0) * (phong.soTre || 0) * soDem +
      (phong.phuThuNguoiLon || 0) * (phong.soNguoiLon || 0) * soDem +
      (phong.phuThuCheckinSom || 0) +
      (getPhuThuCheckInTre(phong) || 0)
    )
  }

  // Lấy phụ thu check-in trễ cho phòng từ state
  const getPhuThuCheckInTre = (phong) => {
    if (!phong) return 0
    const raw = phuThuCheckInTreByPhong[phong.maXepPhongBooking]
    if (!raw) return 0
    const num = Number(String(raw).replace(/,/g, ''))
    return isNaN(num) ? 0 : num
  }

  // Tổng phụ thu check-in trễ toàn bộ booking
  const tinhTongPhuThuCheckInTreBooking = (danhSachPhong) => {
    if (!Array.isArray(danhSachPhong)) return 0
    return danhSachPhong.reduce((sum, p) => sum + getPhuThuCheckInTre(p), 0)
  }

  const tinhTongPhuThuCheckInSomBooking = (danhSachPhong) => {
    if (!Array.isArray(danhSachPhong)) return 0
    return danhSachPhong.reduce((sum, p) => sum + p.phuThuCheckinSom, 0)
  }

  const tinhTongTienPhong = (phong) => {
    if (!phong) return 0
    const tienPhong = tinhTongGiaPhongTheoNgay(phong.danhSachGiaPhongTheoNgay)
    const tienDichVu = tinhTongTienDichVu(phong.danhSachDichVu)
    const tienPhuThuGiuong = phong.phuThuTienGiuong * phong.soGiuong * phong.soNgayO
    const tienPhuThuTreEm = phong.phThuTreEm * phong.soTre * phong.soNgayO
    const tienPhuThuNguoiLon = phong.phuThuNguoiLon * phong.soNguoiLon * phong.soNgayO
    const phuThuCheckInTre = getPhuThuCheckInTre(phong)
    const phuThuCheckInSom = phong.phuThuCheckinSom
    return (
      tienPhong +
      tienDichVu +
      tienPhuThuGiuong +
      tienPhuThuTreEm +
      tienPhuThuNguoiLon +
      phuThuCheckInTre +
      (phuThuCheckInSom || 0)
    )
  }

  const tinhTongTienPhongBooking = (danhSachPhong) =>
    Array.isArray(danhSachPhong)
      ? danhSachPhong.reduce(
          (total, phong) =>
            phong.daThanhToan !== true
              ? total + tinhTongGiaPhongTheoNgay(phong.danhSachGiaPhongTheoNgay)
              : total,
          0,
        )
      : 0

  const tinhTongTienDichVuBooking = (danhSachPhong) =>
    Array.isArray(danhSachPhong)
      ? danhSachPhong.reduce(
          (total, phong) =>
            phong.daThanhToan !== true ? total + tinhTongTienDichVu(phong.danhSachDichVu) : total,
          0,
        )
      : 0

  const tinhTongTienPhuThu = (phuThu) =>
    Array.isArray(phuThu)
      ? phuThu.reduce(
          (total, item) =>
            total + (item.thanhtienphuthutreem || 0) + (item.thanhtienphuthuansang || 0),
          0,
        )
      : 0

  const tinhTongTienPhuThuBooking = (danhSachPhong, phuThu) => {
    if (!Array.isArray(danhSachPhong)) return 0

    // Tính tổng phụ thu từ các phòng
    const tongPhuThuPhong = danhSachPhong.reduce(
      (tong, phong) =>
        phong.daThanhToan !== true ? tong + tinhTongTienPhuThuCuaPhong(phong) : tong,
      0,
    )

    // Tính tổng phụ thu trẻ em (chỉ tính 1 lần)
    const tongPhuThu = tinhTongTienPhuThu(phuThu)

    return tongPhuThuPhong + tongPhuThu
  }

  const tinhTongTienBooking = (danhSachPhong, tienCoc, phuThu, giamGia) => {
    const tongTienGoc =
      tinhTongTienPhongBooking(danhSachPhong) +
      tinhTongTienPhuThuBooking(danhSachPhong, phuThu) +
      tinhTongTienDichVuBooking(danhSachPhong) -
      (tienCoc || 0)

    return tongTienGoc - (giamGia || 0)
  }

  const [ghiChu, setGhiChu] = useState('')

  console.log(ghiChu)

  const [selectedOption, setSelectedOption] = useState('1') // Mặc định là "Tiền mặt"
  const [selectedOptionPhu, setSelectedOptionPhu] = useState('0') // Mặc định là "Không"
  const [giaTriThanhToanPhu, setGiaTriThanhToanPhu] = useState(0) // Giá trị thanh toán phụ
  const [ghiChuThanhToanPhu, setGhiChuThanhToanPhu] = useState('') // Ghi chú thanh toán phụ
  const [hoaDonDichVuMienPhi, setHoaDonDichVuMienPhi] = useState([]) // Danh sách hóa đơn dịch vụ miễn phí

  const [loadSubmit, setLoadSubmit] = useState(false)

  // Hàm khởi tạo hoaDonDichVuMienPhi cho một maXepPhongBooking
  const initHoaDonDichVuMienPhi = (maXepPhongBooking) => {
    return [
      {
        dichVuMienPhi: { maDichVuMienPhi: 'NUOC_SUOI' },
        tongSoLuong: 0,
        tongSoLuongConLai: 0,
        ghiChu: '',
        xepPhongBooKing: {
          maXepPhongBooking: maXepPhongBooking,
        },
      },
      {
        dichVuMienPhi: { maDichVuMienPhi: 'TRA' },
        tongSoLuong: 0,
        tongSoLuongConLai: 0,
        ghiChu: '',
        xepPhongBooKing: {
          maXepPhongBooking: maXepPhongBooking,
        },
      },
      {
        dichVuMienPhi: { maDichVuMienPhi: 'CAPHE' },
        tongSoLuong: 0,
        tongSoLuongConLai: 0,
        ghiChu: '',
        xepPhongBooKing: {
          maXepPhongBooking: maXepPhongBooking,
        },
      },
    ]
  }

  // Cập nhật useEffect để khởi tạo hoaDonDichVuMienPhi khi có dữ liệu
  useEffect(() => {
    if (selectedBooking?.danhSachPhong) {
      const allHoaDonDichVuMienPhi = selectedBooking.danhSachPhong.flatMap((phong) => {
        if (!phong.daThanhToan) {
          return initHoaDonDichVuMienPhi(phong.maXepPhongBooking)
        }
        return []
      })
      setHoaDonDichVuMienPhi(allHoaDonDichVuMienPhi)
    }
  }, [selectedBooking])

  const handleSubmit = async () => {
    try {
      setLoadSubmit(true)

      // Kiểm tra nếu chọn phương thức thanh toán là "Khác" thì bắt buộc phải có ghi chú
      const selectedHinhThuc = hinhThucThanhToan.find(
        (ht) => ht.maHinhThucThanhToan.toString() === selectedOption,
      )
      if (selectedHinhThuc?.tenHinhThucThanhToan === 'Khác' && (!ghiChu || ghiChu.trim() === '')) {
        addToast(exampleToast('❌ Vui lòng nhập ghi chú cho phương thức thanh toán Khác!'))
        setLoadSubmit(false)
        return
      }

      // Kiểm tra phương thức thanh toán phụ
      if (selectedOptionPhu !== '0') {
        if (giaTriThanhToanPhu <= 0) {
          addToast(exampleToast('❌ Vui lòng nhập giá trị thanh toán phụ lớn hơn 0!'))
          setLoadSubmit(false)
          return
        }

        // Kiểm tra nếu chọn phương thức thanh toán phụ là "Khác" thì bắt buộc phải có ghi chú
        const selectedHinhThucPhu = hinhThucThanhToan.find(
          (ht) => ht.maHinhThucThanhToan.toString() === selectedOptionPhu,
        )
        if (
          selectedHinhThucPhu?.tenHinhThucThanhToan === 'Khác' &&
          (!ghiChuThanhToanPhu || ghiChuThanhToanPhu.trim() === '')
        ) {
          addToast(exampleToast('❌ Vui lòng nhập ghi chú cho phương thức thanh toán phụ Khác!'))
          setLoadSubmit(false)
          return
        }
      }

      // Tính toán các khoản tiền
      const tongTienPhong = tinhTongTienPhongBooking(selectedBooking.danhSachPhong)
      const tongTienDichVu = tinhTongTienDichVuBooking(selectedBooking.danhSachPhong)
      const tongTienPhuThu = tinhTongTienPhuThuBooking(selectedBooking.danhSachPhong, phuThu)
      const tongThanhToan = tinhTongTienBooking(
        selectedBooking.danhSachPhong,
        thongTinKhachHang.tien_coc,
        phuThu,
        giamGia,
      )

      // Tạo danh sách chi tiết hóa đơn
      const chiTietHoaDon = []

      // Thêm chi tiết hóa đơn cho từng phòng
      selectedBooking.danhSachPhong.forEach((phong) => {
        // Chỉ xử lý những phòng chưa thanh toán
        if (phong.daThanhToan !== true) {
          // Thêm từng ngày từ danhSachGiaPhongTheoNgay
          phong.danhSachGiaPhongTheoNgay?.forEach((item) => {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'TIEN_PHONG',
              moTa: `Tiền phòng ${phong.maPhong} - ${phong.tenLoaiPhong} (${format(
                parseISO(item.ngay),
                'dd/MM/yyyy',
              )})`,
              soLuong: 1,
              donGia: item.gia || 0,
              thanhTien: item.gia || 0,
              donViTinh: 'Đêm',
              ghiChu: 'Dịch vụ cho thuê phòng',
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          })

          if (phong.phuThuCheckinSom > 0) {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'PHU_THU_CHECK_IN_SOM',
              moTa: `Phụ thu check-in sớm - Phòng ${phong.maPhong}`,
              soLuong: 1,
              donGia: phong.phuThuCheckinSom,
              thanhTien: phong.phuThuCheckinSom,
              donViTinh: 'Lần',
              ghiChu: 'Phụ thu check-in sớm',
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          }

          // Chi tiết tiền dịch vụ của phòng
          phong.danhSachDichVu.forEach((dichVu) => {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'DICH_VU',
              moTa: `${dichVu.tenDichVu} - Phòng ${phong.maPhong}`,
              soLuong: dichVu.soLuong,
              donGia: dichVu.donGia,
              thanhTien: dichVu.thanhTien,
              donViTinh: dichVu.donViTinh,
              ghiChu: dichVu.tenDichVu,
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          })

          // Phụ thu tiền giường
          if (phong.phuThuTienGiuong > 0) {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'PHU_THU_TIEN_GIUONG',
              moTa: `Phụ thu tiền giường  - Phòng ${phong.maPhong}`,
              soLuong: phong.soGiuong,
              donGia: phong.phuThuTienGiuong,
              thanhTien: phong.phuThuTienGiuong * phong.soGiuong,
              donViTinh: 'Cái',
              ghiChu: 'Phụ thu tiền giường',
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          }
          if (phong.phuThuNguoiLon > 0) {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'PHU_THU_NGUOI_LON',
              moTa: `Phụ thu người lớn - Phòng ${phong.maPhong}`,
              soLuong: phong.soNguoiLon,
              donGia: phong.phuThuNguoiLon,
              thanhTien: phong.phuThuNguoiLon * phong.soNguoiLon,
              donViTinh: 'Người',
              ghiChu: 'Phụ thu tiền người lớn',
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          }
          if (phong.phThuTreEm > 0) {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'PHU_THU_TRE_EM',
              moTa: `Phụ thu trẻ em - Phòng ${phong.maPhong}`,
              soLuong: phong.soTre,
              donGia: phong.phThuTreEm,
              thanhTien: phong.phThuTreEm * phong.soTre,
              donViTinh: 'Người',
              ghiChu: 'Phụ thu tiền trẻ em',
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          }
          // Phụ thu check-in trễ theo phòng
          const phuThuCheckInTre = getPhuThuCheckInTre(phong)
          if (phuThuCheckInTre > 0) {
            chiTietHoaDon.push({
              loaiKhoanMuc: 'PHU_THU_CHECK_IN_TRE',
              moTa: `Phụ thu check-in trễ  - Phòng ${phong.maPhong}`,
              soLuong: 1,
              donGia: phuThuCheckInTre,
              thanhTien: phuThuCheckInTre,
              donViTinh: 'Lần',
              ghiChu: 'Phụ thu check-in trễ',
              xepPhongBooKing: {
                maXepPhongBooking: phong.maXepPhongBooking,
              },
            })
          }
        }
      })

      // Thêm chi tiết phụ thu nếu có
      if (phuThu > 0) {
        chiTietHoaDon.push({
          loaiKhoanMuc: 'PHU_THU_KHAC',
          moTa: 'Phụ thu',
          soLuong: 1,
          donGia: phuThu,
          thanhTien: phuThu,
          xepPhongBooKing: {
            maXepPhongBooking: selectedBooking.danhSachPhong[0].maXepPhongBooking,
          },
        })
      }

      if (phuThuTreEm.length > 0) {
        phuThuTreEm.forEach((item) => {
          chiTietHoaDon.push({
            loaiKhoanMuc: 'PHU_THU_TRE_EM',
            moTa: 'Phụ thu trẻ em',
            soLuong: item.so_luong_phu_thu_tre_em,
            donGia: item.gia_phu_thu_tre_em,
            thanhTien: item.thanhtien,
            donViTinh: 'Người',
            ghiChu: 'Phụ thu tiền trẻ em',
            xepPhongBooKing: {
              maXepPhongBooking: selectedBooking.danhSachPhong[0].maXepPhongBooking,
            },
          })
        })
      }

      // Thêm chi tiết giảm giá nếu có
      if (giamGia > 0) {
        chiTietHoaDon.push({
          loaiKhoanMuc: 'GIAM_GIA',
          moTa: 'Giảm giá',
          soLuong: 1,
          donGia: giamGia,
          thanhTien: giamGia,
          xepPhongBooKing: {
            maXepPhongBooking: selectedBooking.danhSachPhong[0].maXepPhongBooking,
          },
        })
      }

      // Tạo object request
      const thanhToanRequest = {
        tongTienPhong,
        tongTienDichVu,
        tongTienPhuThu,
        tongPhuThuCheckOutTre: tinhTongPhuThuCheckInTreBooking(selectedBooking.danhSachPhong),
        tongPhuThuCheckInSom: tinhTongPhuThuCheckInSomBooking(selectedBooking.danhSachPhong),
        giamGia,
        phuThu: 0,
        ngayDi: format(selectedBooking.ngay_di, 'yyyy-MM-dd'),
        tongThanhToan,
        ghiChu: ghiChu,
        hinhThucThanhToan: {
          maHinhThucThanhToan: selectedOption,
        },
        chiTietHoaDon,
        hoaDonDichVuMienPhi,

        maHinhThucThanhToanPhu: parseInt(selectedOptionPhu),
        ...(selectedOptionPhu !== '0' && {
          giaTriThanhToanPhu: giaTriThanhToanPhu,
          ghiChuThanhToanPhu: ghiChuThanhToanPhu,
        }),
      }

      console.log('Dữ liệu gửi đi:', thanhToanRequest)

      try {
        setLoadSubmit(true)
        // 5. Gọi API nếu dữ liệu hợp lệ
        const response = await createAllThongTinThanhToan(ma_booking, thanhToanRequest, navigate)
        // const response = []
        console.log('createHoaDon successfully:', response)
        // setLoadSubmit(false)
        // 6. Kiểm tra mã phản hồi từ server
        if ([400, 500].includes(response.code)) {
          setLoadSubmit(false)
          return addToast(exampleToast(response.message))
        }

        if (response.code === 200) {
          addToast(exampleToast(response.message))
          setTimeout(() => {
            setLoadSubmit(false)
            navigate('/dashboard/pos/danh-sach-booking')
          }, 1500)
        }
      } catch (error) {
        console.error('Error:', error)
        setLoadSubmit(false)
        // 7. Xử lý lỗi khi gọi API
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
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error)
      // toast.error('Có lỗi xảy ra khi thanh toán!')
    } finally {
      setLoadSubmit(false)
    }
  }

  const [toast, addToast] = useState()
  const toaster = useRef(null)

  const exampleToast = (message) => (
    <CToast autohide={true} delay={3000}>
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
        <small>Thông báo biến mất sau 3 giây</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  const tinhSoDem = (ngayDen, ngayDi) => {
    const den = new Date(ngayDen)
    const di = new Date(ngayDi)

    // Reset giờ, phút, giây để chỉ so sánh ngày
    den.setHours(0, 0, 0, 0)
    di.setHours(0, 0, 0, 0)

    // Nếu cùng ngày thì trả về 1
    if (den.getTime() === di.getTime()) {
      return 1
    }

    // Tính số đêm nếu khác ngày
    return Math.ceil((di - den) / (1000 * 60 * 60 * 24))
  }

  const handleNgayDiChange = (date) => {
    if (date !== null) {
      // Chuyển đổi ngày đến và ngày đi về cùng định dạng để so sánh
      const ngayDenDate = new Date(thongTinKhachHang.ngay_den)
      const ngayDiDate = new Date(date)

      // Reset giờ, phút, giây để chỉ so sánh ngày
      ngayDenDate.setHours(0, 0, 0, 0)
      ngayDiDate.setHours(0, 0, 0, 0)

      // Kiểm tra nếu ngày đi nhỏ hơn ngày đến
      if (ngayDiDate < ngayDenDate) {
        addToast(exampleToast('❌ Ngày đi không được nhỏ hơn ngày đến!'))
        // Set lại ngày đi về giá trị cũ
        const oldDate = ngayDiMoi || thongTinKhachHang.ngay_di
        setNgayDiMoi(oldDate)
        return
      }

      // Chỉ set giá trị mới và tính toán khi ngày đi hợp lệ
      setNgayDiMoi(date)

      // Tính số đêm
      let soDem = 1 // Mặc định là 1 đêm
      if (ngayDiDate > ngayDenDate) {
        soDem = Math.ceil((ngayDiDate - ngayDenDate) / (1000 * 60 * 60 * 24))
      }
      if (ngayDiDate === ngayDenDate) soDem = 1

      // Cập nhật lại danh sách phòng với số ngày mới
      if (selectedBooking && selectedBooking.danhSachPhong) {
        const updatedDanhSachPhong = selectedBooking.danhSachPhong.map((phong) => ({
          ...phong,
          soNgayO: soDem,
        }))
        setSelectedBooking({
          ...selectedBooking,
          danhSachPhong: updatedDanhSachPhong,
          ngay_di: date,
        })

        // Tính lại tổng tiền
        const sumTongTien = updatedDanhSachPhong.reduce((total, item) => {
          const tienPhong = item.giaPhong * item.soNgayO
          const tienDichVu = item.danhSachDichVu.reduce((sum, dv) => sum + dv.thanhTien, 0)
          const tienPhuThu =
            item.phuThuTienGiuong * item.soGiuong +
            item.phThuTreEm * item.soTre +
            item.phuThuNguoiLon * item.soNguoiLon
          return total + tienPhong + tienDichVu + tienPhuThu * item.soNgayO
        }, 0)
        // setTongTien(sumTongTien)

        // Tính lại tổng phụ thu
        const tongPhuThu = updatedDanhSachPhong.reduce((total, item) => {
          const tienPhuThu =
            item.phuThuTienGiuong * item.soGiuong +
            item.phThuTreEm * item.soTre +
            item.phuThuNguoiLon * item.soNguoiLon
          return total + tienPhuThu * item.soNgayO
        }, 0)
        // setTongPhuThu(tongPhuThu)
      }
    }
  }

  const handlePrint = () => {
    setShowReport(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const getReportData = () => {
    if (!selectedBooking) return null

    return {
      bookingId: selectedBooking.ma_booking,
      guestName: selectedBooking.tenkhachhang,
      phone: selectedBooking?.khachHangBooKing?.sdtBooking || '',
      company: selectedBooking?.nhomKhachHang?.tenNhomKhachHang || '',
      email: selectedBooking?.khachHangBooKing?.email || '',
      arrivalDate: formatDate(selectedBooking.ngay_den),
      departureDate: formatDate(ngayDiMoi || selectedBooking.ngay_di),
      rooms: selectedBooking.danhSachPhong.map((phong) => ({
        roomType: phong.tenLoaiPhong,
        quantity: 1,
        nights: phong.soNgayO,
        ratePerNight: phong.giaPhong,
        total: phong.giaPhong * phong.soNgayO,
        note: phong.maPhong,
      })),
      totalAmount: tinhTongTienBooking(
        selectedBooking.danhSachPhong,
        thongTinKhachHang.tien_coc,
        phuThu,
        giamGia,
      ),
      deposit: formatCurrency(thongTinKhachHang.tien_coc),
      payment: formatCurrency(
        tinhTongTienBooking(
          selectedBooking.danhSachPhong,
          thongTinKhachHang.tien_coc,
          phuThu,
          giamGia,
        ),
      ),
    }
  }

  const handlePhuThuChange = (value) => {
    const phuThuValue = value ? parseFloat(value.replace(/,/g, '')) : 0
    setPhuThu(phuThuValue)
  }

  const handleGiamGiaChange = (value) => {
    const giamGiaValue = value ? parseFloat(value.replace(/,/g, '')) : 0
    setGiamGia(giamGiaValue)
  }

  const handleGiaTriThanhToanPhuChange = (value) => {
    const giaTriValue = value ? parseFloat(value.replace(/,/g, '')) : 0
    setGiaTriThanhToanPhu(giaTriValue)
  }

  // Cập nhật phụ thu check-in trễ theo phòng
  const handlePhuThuCheckInTreChange = (phong, value) => {
    setPhuThuCheckInTreByPhong((prev) => ({
      ...prev,
      [phong.maXepPhongBooking]: value || '',
    }))
  }

  // Thêm state để lưu danh sách dịch vụ miễn phí
  const [danhSachDichVuMienPhi, setDanhSachDichVuMienPhi] = useState([])

  // Cập nhật useEffect để lấy danh sách dịch vụ miễn phí
  useEffect(() => {
    if (selectedBooking?.danhSachPhong) {
      const allDichVuMienPhi = selectedBooking.danhSachPhong.flatMap((phong) =>
        (phong.danhSachDichVuMienPhi || []).map((dv) => ({
          ...dv,
          maPhong: phong.maPhong,
          tenLoaiPhong: phong.tenLoaiPhong,
        })),
      )
      setDanhSachDichVuMienPhi(allDichVuMienPhi)
    }
  }, [selectedBooking])

  // Sửa lại hàm tinhTongSoLuong
  const tinhTongSoLuong = (maDichVu, maXepPhongBooking) => {
    if (!maXepPhongBooking) return 0

    return danhSachDichVuMienPhi
      .filter(
        (item) => item.maDichVuMienPhi === maDichVu && item.maXepPhongBooking === maXepPhongBooking,
      )
      .reduce((total, item) => total + (item.soLuong || 0), 0)
  }

  // State cho số lượng còn lại và ghi chú dịch vụ miễn phí
  const [soLuongConLai, setSoLuongConLai] = useState({})
  const [ghiChuDichVu, setGhiChuDichVu] = useState({})

  const handleChangeSoLuongConLai = (maDichVu, value) => {
    if (!selectedPhong) return

    // Cập nhật soLuongConLai
    setSoLuongConLai((prev) => ({
      ...prev,
      [selectedPhong.maXepPhongBooking]: {
        ...(prev[selectedPhong.maXepPhongBooking] || {}),
        [maDichVu]: Number(value) || 0,
      },
    }))

    // Cập nhật hoaDonDichVuMienPhi
    setHoaDonDichVuMienPhi((prev) => {
      return prev.map((item) => {
        if (
          item.xepPhongBooKing.maXepPhongBooking === selectedPhong.maXepPhongBooking &&
          item.dichVuMienPhi.maDichVuMienPhi === maDichVu
        ) {
          return {
            ...item,
            tongSoLuongConLai: Number(value) || 0,
          }
        }
        return item
      })
    })
  }

  const handleChangeGhiChu = (maDichVu, value) => {
    if (!selectedPhong) return

    // Cập nhật ghiChuDichVu
    setGhiChuDichVu((prev) => ({
      ...prev,
      [selectedPhong.maXepPhongBooking]: {
        ...(prev[selectedPhong.maXepPhongBooking] || {}),
        [maDichVu]: value,
      },
    }))

    // Cập nhật hoaDonDichVuMienPhi
    setHoaDonDichVuMienPhi((prev) => {
      return prev.map((item) => {
        if (
          item.xepPhongBooKing.maXepPhongBooking === selectedPhong.maXepPhongBooking &&
          item.dichVuMienPhi.maDichVuMienPhi === maDichVu
        ) {
          return {
            ...item,
            ghiChu: value,
          }
        }
        return item
      })
    })
  }

  return (
    <CRow className="px-2">
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      <CCol xs={12}>
        <CCard>
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0 text-blue-500 font-bold">Quản lý thanh toán</h4>
              {/* <CInputGroup className="w-25">
                <CInputGroupText>
                  <FontAwesomeIcon icon={faFileInvoiceDollar} />
                </CInputGroupText>
                <CFormInput
                  placeholder="Tìm kiếm theo mã booking hoặc tên khách hàng"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </CInputGroup> */}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <CSpinner />
              </div>
            ) : thongTinKhachHang && thongTinThanhToan ? (
              <div className="table-responsive">
                <CTable align="middle" responsive borderless>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Mã Booking</CTableHeaderCell>
                      <CTableHeaderCell>Khách hàng</CTableHeaderCell>
                      <CTableHeaderCell>Check-in</CTableHeaderCell>
                      <CTableHeaderCell>Check-out</CTableHeaderCell>
                      <CTableHeaderCell>Số phòng</CTableHeaderCell>
                      <CTableHeaderCell>Tiền phòng</CTableHeaderCell>
                      <CTableHeaderCell>Tiền cọc</CTableHeaderCell>
                      <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell>{thongTinKhachHang.ma_booking}</CTableDataCell>
                      <CTableDataCell>{thongTinKhachHang.tenkhachhang}</CTableDataCell>
                      <CTableDataCell>{formatDate(thongTinKhachHang.ngay_den)}</CTableDataCell>
                      <CTableDataCell>
                        {formatDate(thongTinKhachHang.ngay_di)}
                        {/* <CDatePicker
                          locale="en-GB"
                          date={ngayDiMoi || maxNgayDi}
                          onDateChange={handleNgayDiChange}
                          className="w-full"
                          minDate={
                            new Date(
                              new Date(thongTinKhachHang.ngay_den).setDate(
                                new Date(thongTinKhachHang.ngay_den).getDate() - 1,
                              ),
                            )
                          }
                        /> */}
                      </CTableDataCell>
                      <CTableDataCell>{thongTinThanhToan.length}</CTableDataCell>
                      <CTableDataCell>
                        {formatCurrency(tinhTongTienPhongBooking(thongTinThanhToan))}
                      </CTableDataCell>
                      <CTableDataCell>{formatCurrency(thongTinKhachHang.tien_coc)}</CTableDataCell>
                      <CTableDataCell>
                        <span className="badge bg-warning">Chờ thanh toán</span>
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>
            ) : (
              <div className="text-center py-4">
                <CAlert color="warning">Không tìm thấy thông tin thanh toán</CAlert>
              </div>
            )}

            {selectedBooking && (
              <div className="mt-4">
                <div className="relative mb-3">
                  <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                    Chi tiết thanh toán
                  </span>
                  <div className="border-2 border-gay-500 rounded-md p-4 ">
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <p>
                          <strong>Mã Booking:</strong> {selectedBooking.ma_booking}
                        </p>
                        <p>
                          <strong>Khách hàng:</strong> {selectedBooking.tenkhachhang}
                        </p>
                        <p>
                          <strong>Check-in:</strong> {formatDate(selectedBooking.ngay_den)}
                        </p>
                        <p>
                          <strong>Check-out:</strong> {formatDate(maxNgayDi)}
                        </p>
                      </div>
                      <div className="col-md-6 text-end">
                        <p>
                          <strong>Ngày thanh toán:</strong> {formatDate(new Date())}
                        </p>
                        {/* <p>
                          <strong>Trạng thái:</strong>{' '}
                          <span className="badge bg-warning">Chờ thanh toán</span>
                        </p> */}
                      </div>
                    </div>

                    <div className="table-responsive">
                      <CTable>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Phòng</CTableHeaderCell>
                            <CTableHeaderCell>Loại phòng</CTableHeaderCell>
                            <CTableHeaderCell>Ngày đến</CTableHeaderCell>
                            <CTableHeaderCell>Ngày đi</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Số đêm</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Tiền phòng</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Tiền dịch vụ</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">Phụ thu</CTableHeaderCell>
                            <CTableHeaderCell className="text-end">
                              Phụ thu check-out trễ
                            </CTableHeaderCell>
                            <CTableHeaderCell className="text-end ">Tổng cộng</CTableHeaderCell>
                            <CTableHeaderCell>Thao tác</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {selectedBooking.danhSachPhong.map((phong) => (
                            <CTableRow
                              key={phong.maPhong}
                              color={phong.daThanhToan === true ? 'success' : ''}
                            >
                              <CTableDataCell>{phong.maPhong}</CTableDataCell>
                              <CTableDataCell>{phong.tenLoaiPhong}</CTableDataCell>
                              <CTableDataCell>{formatDate(phong.ngayDen)}</CTableDataCell>
                              <CTableDataCell>{formatDate(phong.ngayDi)}</CTableDataCell>
                              <CTableDataCell className="text-end">{phong.soNgayO}</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(
                                  tinhTongGiaPhongTheoNgay(phong.danhSachGiaPhongTheoNgay),
                                )}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(tinhTongTienDichVu(phong.danhSachDichVu))}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(tinhTongTienPhuThuCuaPhong(phong))}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                <CurrencyInput
                                  id={`phuThuCheckInTre-${phong.maXepPhongBooking}`}
                                  name="phuThuCheckInTre"
                                  placeholder="Nhập phụ thu..."
                                  value={phuThuCheckInTreByPhong[phong.maXepPhongBooking] || ''}
                                  onValueChange={(val) => handlePhuThuCheckInTreChange(phong, val)}
                                  prefix=""
                                  groupSeparator=","
                                  decimalsLimit={0}
                                  allowNegativeValue={false}
                                  className="outline-none w-32 border-b border-gray-500 rounded-none"
                                />
                              </CTableDataCell>
                              <CTableDataCell className="text-end ">
                                {formatCurrency(tinhTongTienPhong(phong))}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton
                                  color="info"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewPhongDetail(phong)}
                                >
                                  <FontAwesomeIcon icon={faChevronRight} />
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>

                    <div className="row mt-4">
                      <div className="col-md-6">
                        <div className="relative mb-3">
                          <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                            Phụ thu khác
                          </span>
                          <div className="border-2 border-green-500 rounded-md p-4 ">
                            <CTable align="middle" responsive>
                              <CTableBody>
                                <CTableRow>
                                  <CTableHeaderCell>STT</CTableHeaderCell>
                                  <CTableHeaderCell>Tên phụ thu</CTableHeaderCell>
                                  <CTableHeaderCell>Số lượng</CTableHeaderCell>

                                  <CTableHeaderCell>Số đêm</CTableHeaderCell>
                                  <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                                  <CTableHeaderCell>Thành tiền</CTableHeaderCell>
                                </CTableRow>
                                {Array.isArray(phuThu) && phuThu.length > 0
                                  ? phuThu.map((item, index) => (
                                      <CTableRow key={index}>
                                        <CTableDataCell>{index + 1}</CTableDataCell>
                                        <CTableDataCell>
                                          {' '}
                                          {(item.so_luong_phu_thu_tre_em > 0 && 'Phụ thu trẻ em') ||
                                            (item.so_luong_phu_thu_an_sang > 0 &&
                                              'Phụ thu ăn sáng') ||
                                            'Phụ thu khác'}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          {item.so_luong_phu_thu_tre_em ||
                                            item.so_luong_phu_thu_an_sang}
                                        </CTableDataCell>

                                        <CTableDataCell>{item.so_dem}</CTableDataCell>
                                        <CTableDataCell>
                                          {formatCurrency(
                                            item.gia_phu_thu_tre_em || item.gia_phu_thu_an_sang,
                                          )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                          {formatCurrency(
                                            item.thanhtien ||
                                              item.gia_phu_thu_an_sang *
                                                item.so_luong_phu_thu_an_sang *
                                                item.so_dem,
                                          )}
                                        </CTableDataCell>
                                      </CTableRow>
                                    ))
                                  : null}
                              </CTableBody>
                            </CTable>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="relative mb-3">
                          <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                            Thông tin thanh toán
                          </span>
                          <div className="border-2 border-green-500 rounded-md p-4 ">
                            <CTable align="middle" responsive borderless>
                              <CTableBody>
                                <CTableRow>
                                  <CTableHeaderCell>Tổng tiền phòng</CTableHeaderCell>
                                  <CTableDataCell className="font-semibold text-right">
                                    {formatCurrency(
                                      tinhTongTienPhongBooking(selectedBooking.danhSachPhong),
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                  <CTableHeaderCell>Tổng phụ thu check-in sớm</CTableHeaderCell>
                                  <CTableDataCell className="font-semibold text-right">
                                    {formatCurrency(
                                      tinhTongPhuThuCheckInSomBooking(
                                        selectedBooking.danhSachPhong,
                                      ),
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                  <CTableHeaderCell>Tổng phụ thu check-out trễ</CTableHeaderCell>
                                  <CTableDataCell className="font-semibold text-right">
                                    {formatCurrency(
                                      tinhTongPhuThuCheckInTreBooking(
                                        selectedBooking.danhSachPhong,
                                      ),
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                  <CTableDataCell scope="row">
                                    Tổng tiền tất cả phụ thu
                                  </CTableDataCell>
                                  <CTableDataCell className="font-semibold text-right">
                                    {formatCurrency(
                                      tinhTongTienPhuThuBooking(
                                        selectedBooking.danhSachPhong,
                                        phuThu,
                                      ),
                                    )}
                                  </CTableDataCell>
                                </CTableRow>

                                <CTableRow>
                                  <CTableDataCell scope="row">Tổng tiền dịch vụ</CTableDataCell>
                                  <CTableDataCell className="font-semibold text-right">
                                    {formatCurrency(
                                      tinhTongTienDichVuBooking(selectedBooking.danhSachPhong),
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                  <CTableHeaderCell>Tiền khách cọc</CTableHeaderCell>
                                  <CTableDataCell className="font-semibold text-right">
                                    {formatCurrency(thongTinKhachHang.tien_coc)}
                                  </CTableDataCell>
                                </CTableRow>
                                {/* <CTableRow>
                                  <CTableDataCell scope="row">Giảm giá</CTableDataCell>
                                  <CTableDataCell className="text-right ">
                                    <CurrencyInput
                                      className="outline-none w-32 border-b border-gray-500 rounded-none text-right"
                                      name="input-name"
                                      decimalsLimit={2}
                                      onValueChange={handleGiamGiaChange}
                                      value={giamGia}
                                      groupSeparator=","
                                      decimalSeparator="."
                                    />
                                  </CTableDataCell>
                                </CTableRow>
                                <CTableRow>
                                  <CTableDataCell scope="row">Phụ thu khác</CTableDataCell>
                                  <CTableDataCell className="text-right ">
                                    <CurrencyInput
                                      className="outline-none w-32 border-b border-gray-500 rounded-none text-right"
                                      name="input-name"
                                      decimalsLimit={2}
                                      onValueChange={handlePhuThuChange}
                                      value={phuThu}
                                      groupSeparator=","
                                      decimalSeparator="."
                                    />
                                  </CTableDataCell>
                                </CTableRow> */}
                                <CTableRow>
                                  <CTableHeaderCell scope="row" className="!text-green-500 ">
                                    Khách cần trả
                                  </CTableHeaderCell>

                                  <CTableDataCell className="font-bold !text-green-500 text-right">
                                    {formatCurrency(
                                      tinhTongTienBooking(
                                        selectedBooking.danhSachPhong,
                                        thongTinKhachHang.tien_coc,
                                        phuThu,
                                        giamGia,
                                      ),
                                    )}
                                  </CTableDataCell>
                                </CTableRow>
                              </CTableBody>
                            </CTable>
                            <hr />
                            <CCol className="mt-3 mb-20">
                              <CCol>
                                <CFormLabel
                                  htmlFor="inputPassword"
                                  className="col-form-label labelcustome"
                                >
                                  Phương thức thanh toán
                                </CFormLabel>
                              </CCol>
                              {hinhThucThanhToan.map((hinhThuc) => (
                                <CFormCheck
                                  key={hinhThuc.maHinhThucThanhToan}
                                  inline
                                  type="radio"
                                  name="inlineRadioOptions"
                                  id={`inlineCheckbox${hinhThuc.maHinhThucThanhToan}`}
                                  value={hinhThuc.maHinhThucThanhToan}
                                  label={hinhThuc.tenHinhThucThanhToan}
                                  checked={
                                    selectedOption === hinhThuc.maHinhThucThanhToan.toString()
                                  }
                                  onChange={(e) => setSelectedOption(e.target.value)}
                                  disabled={
                                    selectedOptionPhu === hinhThuc.maHinhThucThanhToan.toString()
                                  }
                                />
                              ))}

                              <div className="mb-3 mt-3">
                                <CFormTextarea
                                  placeholder="Ghi chú phương thức thanh toán"
                                  rows={3}
                                  onChange={(e) => setGhiChu(e.target.value)}
                                ></CFormTextarea>
                              </div>

                              <CCol className="mt-4">
                                <CCol>
                                  <CFormLabel
                                    htmlFor="inputPassword"
                                    className="col-form-label labelcustome"
                                  >
                                    Phương thức thanh toán phụ
                                  </CFormLabel>
                                  <CCol>
                                    <CFormCheck
                                      inline
                                      type="radio"
                                      name="inlineRadioOptionsPhu"
                                      id="inlineCheckboxPhu0"
                                      value="0"
                                      label="Không"
                                      checked={selectedOptionPhu === '0'}
                                      onChange={(e) => setSelectedOptionPhu(e.target.value)}
                                    />
                                    {hinhThucThanhToan.map((hinhThuc) => (
                                      <CFormCheck
                                        key={`phu-${hinhThuc.maHinhThucThanhToan}`}
                                        inline
                                        type="radio"
                                        name="inlineRadioOptionsPhu"
                                        id={`inlineCheckboxPhu${hinhThuc.maHinhThucThanhToan}`}
                                        value={hinhThuc.maHinhThucThanhToan}
                                        label={hinhThuc.tenHinhThucThanhToan}
                                        checked={
                                          selectedOptionPhu ===
                                          hinhThuc.maHinhThucThanhToan.toString()
                                        }
                                        onChange={(e) => setSelectedOptionPhu(e.target.value)}
                                        disabled={
                                          selectedOption === hinhThuc.maHinhThucThanhToan.toString()
                                        }
                                      />
                                    ))}
                                  </CCol>
                                  {selectedOptionPhu && selectedOptionPhu !== '0' && (
                                    <>
                                      <div className="mt-3">
                                        <CFormLabel>Giá trị thanh toán phụ</CFormLabel>
                                        <CurrencyInput
                                          className="form-control"
                                          name="input-name"
                                          decimalsLimit={2}
                                          onValueChange={handleGiaTriThanhToanPhuChange}
                                          value={giaTriThanhToanPhu}
                                          groupSeparator=","
                                          decimalSeparator="."
                                        />
                                      </div>
                                      <div className="mt-3">
                                        <CFormLabel>Ghi chú thanh toán phụ</CFormLabel>
                                        <CFormTextarea
                                          placeholder="Ghi chú cho phương thức thanh toán phụ"
                                          rows={3}
                                          onChange={(e) => setGhiChuThanhToanPhu(e.target.value)}
                                        ></CFormTextarea>
                                      </div>
                                    </>
                                  )}
                                </CCol>
                              </CCol>
                            </CCol>

                            {loadSubmit ? (
                              <CButton
                                color="success"
                                className="w-full text-white font-bold"
                                disabled
                              >
                                <CSpinner as="span" size="sm" aria-hidden="true" />
                                Đang xử lý...
                              </CButton>
                            ) : (
                              <CButton
                                className="w-full text-white font-bold"
                                color="success"
                                onClick={handleSubmit}
                              >
                                <FontAwesomeIcon icon={faCheck} /> Hoàn thành thanh toán
                              </CButton>
                            )}
                          </div>
                        </div>

                        {/* <div className="d-flex justify-content-end mt-3">
                          <CButton
                            color="primary"
                            variant="outline"
                            onClick={handlePrint}
                            className="me-2"
                          >
                            <FontAwesomeIcon icon={faPrint} className="me-2" />
                            In phiếu đăng ký
                          </CButton>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal chi tiết phòng */}
            <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
              <CModalHeader>
                <CModalTitle>
                  Chi tiết phòng {selectedPhong?.maPhong} - {selectedPhong?.tenLoaiPhong}
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedPhong && (
                  <div>
                    <CTable bordered>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Mục</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Đơn giá</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Số lượng</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Thành tiền</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {/* Tiền phòng theo từng ngày */}
                        {selectedPhong?.danhSachGiaPhongTheoNgay?.map((item, idx) => (
                          <CTableRow key={idx}>
                            <CTableDataCell>
                              Tiền phòng ({format(parseISO(item.ngay), 'dd/MM/yyyy')})
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {item.gia?.toLocaleString('en-US') || 0}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">1</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {item.gia?.toLocaleString('en-US') || 0}
                            </CTableDataCell>
                          </CTableRow>
                        ))}

                        {selectedPhong.danhSachDichVu.map((dichVu, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{dichVu.tenDichVu}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(dichVu.donGia)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">{dichVu.soLuong}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(dichVu.thanhTien)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}

                        {selectedPhong.danhSachPhuThu.map((phThu, index) => (
                          <CTableRow key={index}>
                            <CTableDataCell>{phThu.moTa}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(phThu.donGia)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">{phThu.soLuong}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(phThu.thanhTien)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}

                        {selectedPhong?.phuThuCheckinSom ? (
                          <CTableRow>
                            <CTableDataCell>Phụ thu check-in sớm</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(selectedPhong.phuThuCheckinSom)}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">1</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(
                                tinhTongPhuThuCheckInTreBooking(selectedBooking.danhSachPhong),
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          ''
                        )}

                        <CTableRow>
                          <CTableDataCell colSpan="3" className="text-end">
                            <strong>Tổng cộng</strong>
                          </CTableDataCell>
                          <CTableDataCell className="text-end ">
                            <strong className="text-green-500 ">
                              {formatCurrency(tinhTongTienPhong(selectedPhong))}
                            </strong>
                          </CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>

                    {/* <div className="relative mb-3 mt-4">
                      <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                        Phụ thu check-out trễ
                      </span>
                      <div className="border-2 border-gray-500 rounded-md p-2 mb-3">
                        <CCol md={6} className="mb-3 mt-3">
                          <CurrencyInput
                            id="phuPhiCheckInSom"
                            name="phuPhiCheckInSom"
                            placeholder="Nhập số tiền phụ thu..."
                            // value={phuPhiCheckInSom}
                            // onValueChange={(value) => setPhuPhiCheckInSom(value || '')}
                            prefix=""
                            // suffix=" VNĐ"
                            decimalsLimit={0}
                            allowNegativeValue={false}
                            className="form-control"
                            style={{
                              fontSize: '14px',
                              padding: '8px 12px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                            }}
                          />
                          <small className="text-muted">
                            Nhập số tiền phụ phí nếu khách check-in trễ (tùy chọn)
                          </small>
                        </CCol>
                      </div>
                    </div> */}

                    {/* Danh sách dịch vụ miễn phí */}
                    {!selectedPhong.daThanhToan && (
                      <div className="relative mb-3 mt-4">
                        <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                          Danh sách dịch vụ miễn phí
                        </span>
                        <div className="border-2 border-gray-500 rounded-md p-2 mb-3">
                          <CTable align="middle" responsive>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  Tên dịch vụ
                                </CTableHeaderCell>
                                <CTableHeaderCell
                                  scope="col"
                                  className="!text-blue-600 text-center"
                                >
                                  Tổng số lượng
                                </CTableHeaderCell>
                                <CTableHeaderCell
                                  scope="col"
                                  className="!text-blue-600 text-center"
                                >
                                  Số lượng còn lại
                                </CTableHeaderCell>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  Ghi chú
                                </CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {['NUOC_SUOI', 'TRA', 'CAPHE'].map((ma) => {
                                const tongSoLuong =
                                  selectedPhong.danhSachDichVuMienPhi
                                    ?.filter((dv) => dv.maDichVuMienPhi === ma)
                                    .reduce((total, dv) => total + (dv.soLuong || 0), 0) || 0

                                return (
                                  <CTableRow key={ma}>
                                    <CTableDataCell>
                                      {ma === 'NUOC_SUOI'
                                        ? 'Nước suối (350ml)'
                                        : ma === 'TRA'
                                          ? 'Trà'
                                          : 'Cà phê'}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                      {tongSoLuong}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                      <input
                                        type="number"
                                        className="outline-none w-24 border-b border-gray-500 rounded-none text-center"
                                        min={0}
                                        value={
                                          soLuongConLai[selectedPhong?.maXepPhongBooking]?.[ma] ||
                                          ''
                                        }
                                        onChange={(e) => {
                                          const value =
                                            e.target.value === ''
                                              ? ''
                                              : Math.abs(parseInt(e.target.value))
                                          handleChangeSoLuongConLai(ma, value)
                                        }}
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <input
                                        type="text"
                                        className="outline-none w-full border-b border-gray-500 rounded-none"
                                        placeholder="Nhập ghi chú"
                                        value={
                                          ghiChuDichVu[selectedPhong?.maXepPhongBooking]?.[ma] || ''
                                        }
                                        onChange={(e) => handleChangeGhiChu(ma, e.target.value)}
                                      />
                                    </CTableDataCell>
                                  </CTableRow>
                                )
                              })}
                            </CTableBody>
                          </CTable>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowModal(false)}>
                  Đóng
                </CButton>
              </CModalFooter>
            </CModal>

            <CModal visible={showReport} onClose={() => setShowReport(false)} size="xl" fullscreen>
              <CModalHeader>
                <CModalTitle>Phiếu đăng ký khách sạn</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <ReportRegistration data={getReportData()} />
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowReport(false)}>
                  Đóng
                </CButton>
                <CButton color="primary" onClick={handlePrint}>
                  <FontAwesomeIcon icon={faPrint} className="me-2" />
                  In
                </CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AllThanhToan
