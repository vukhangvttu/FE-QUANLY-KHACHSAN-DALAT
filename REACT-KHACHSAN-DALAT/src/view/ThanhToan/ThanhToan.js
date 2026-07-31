import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormCheck,
  CFormLabel,
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
  CFormTextarea,
} from '@coreui/react-pro'
import { faCheck, faCirclePlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

import { getAllPhieuDichVuByMaBooKing } from 'src/service/DichVu'
import CurrencyInput from 'react-currency-input-field'
import {
  getListDichVuMienPhi,
  getListGiaPhongTheoNgay,
  getXepPhongByMaXepPhong,
} from 'src/service/XepPhongBooKingService'
import { getBooKingByMaBooKing } from 'src/service/BooKingService'
import { createHoaDon } from 'src/service/HoaDonService'
import { CDatePicker } from '@coreui/react-pro'
import DichVuModal from '../dichvu/DichVuModal'
import GhiChuModal from '../modal/GhiChuModal'
import XoaDichVuTrongPhieuModal from '../modal/XoaDichVuTrongPhieuModal'
import { getAllHinhThucThanhToanByMa } from 'src/service/APIService'

// CSS cho thanh cuộn tùy chỉnh
const customScrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .custom-scrollbar::-webkit-scrollbar {
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #cbd5e0;
    border-radius: 3px;
    border: 2px solid #f7fafc;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #a0aec0;
  }
`

// Thêm style vào document
const styleSheet = document.createElement('style')
styleSheet.innerText = customScrollbarStyles
document.head.appendChild(styleSheet)

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

const formatCurrency = (amount) => {
  const value = Number(amount)
  if (isNaN(value)) return ''
  return value.toLocaleString('en-US')
}

// Thêm hàm tính tổng tiền phòng
const tinhTongTienPhong = (ngayDen, ngayDi, giaPhong) => {
  const soDem = tinhSoDem(ngayDen, ngayDi)
  return soDem * (giaPhong || 0)
}

const tinhTongGiaPhongTheoNgay = (listGiaPhongTheoNgay) => {
  return listGiaPhongTheoNgay.reduce((total, item) => total + (item.gia || 0), 0)
}

const ThanhToan = () => {
  const { ma_booking, ma_xepphong_booking } = useParams()

  const [danhSachPhieuDichVu, setDanhSachPhieuDichVu] = useState([])
  const [chiTietXepPhong, setChiTietXepPhong] = useState({})
  const [thongTinBooKing, setThongTinBooKing] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingDichVu, setLoadingDichVu] = useState(false)
  const [tongTienKhachCanTra, setTongTienKhachCanTra] = useState(0)
  const [listDichVuMienPhi, setListDichVuMienPhi] = useState([])
  const [listGiaPhongTheoNgay, setListGiaPhongTheoNgay] = useState([])
  const [hinhThucThanhToan, setHinhThucThanhToan] = useState([])
  const [hoaDonDichVuMienPhi, setHoaDonDichVuMienPhi] = useState([
    {
      dichVuMienPhi: { maDichVuMienPhi: 'NUOC_SUOI' },
      tongSoLuong: 0,
      tongSoLuongConLai: 0,
      ghiChu: '',
    },
    {
      dichVuMienPhi: { maDichVuMienPhi: 'TRA' },
      tongSoLuong: 0,
      tongSoLuongConLai: 0,
      ghiChu: '',
    },
    {
      dichVuMienPhi: { maDichVuMienPhi: 'CAPHE' },
      tongSoLuong: 0,
      tongSoLuongConLai: 0,
      ghiChu: '',
    },
  ])
  const navigate = useNavigate()

  useEffect(() => {
    if (ma_booking) {
      fetchData()
    }
  }, [ma_booking]) // Chạy khi `ma_booking` thay đổi

  const fetchData = async () => {
    try {
      setLoading(true)

      const [
        phieuDichVuData,
        chiTietBookingData,
        bookingData,
        listDichVuMienPhi,
        listGiaPhongTheoNgay,
        hinhThucThanhToanData,
      ] = await Promise.all([
        getAllPhieuDichVuByMaBooKing(ma_xepphong_booking, navigate),
        getXepPhongByMaXepPhong(ma_xepphong_booking, navigate),
        getBooKingByMaBooKing(ma_booking, navigate),
        getListDichVuMienPhi(ma_xepphong_booking, navigate),
        getListGiaPhongTheoNgay(ma_xepphong_booking, navigate),
        getAllHinhThucThanhToanByMa(navigate),
      ])
      let tongTienDV = 0
      if (phieuDichVuData) {
        const isSameData = JSON.stringify(danhSachPhieuDichVu) === JSON.stringify(phieuDichVuData)
        if (!isSameData) {
          setDanhSachPhieuDichVu(phieuDichVuData)
          setTongSoLuong(phieuDichVuData.reduce((sum, item) => sum + item.soLuong, 0))
          tongTienDV = phieuDichVuData.reduce((sum, item) => sum + item.thanhTien, 0)
          setTongThanhTienDichVu(tongTienDV)
        }
      } else {
        addToast(exampleToast('❌ Không thể tải danh sách phiếu dịch vụ. Vui lòng thử lại sau!'))
      }

      if (chiTietBookingData) {
        console.log('chi tiết xếp phòng', chiTietBookingData)
        setChiTietXepPhong(chiTietBookingData)

        const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)
        const soDem = tinhSoDem(chiTietBookingData.ngayDen, chiTietBookingData.ngayDi)

        const tongPhuThu =
          (chiTietBookingData?.phuThuTienGiuong * chiTietBookingData?.soGiuong +
            chiTietBookingData?.phuThuNguoiLon * chiTietBookingData?.soNguoiLon +
            chiTietBookingData?.phuThuTienTre * chiTietBookingData?.soTre) *
          soDem

        setTongPhuThu(tongPhuThu)
        console.log('tongPhuThu', tongPhuThu)

        setTongTienKhachCanTra(tongTienPhong + tongTienDV)
        settongTienKhauTruKhacCanTra(
          tongTienPhong + tongTienDV + tongPhuThu - thongTinBooKing?.tienCoc,
        )
      } else {
        addToast(exampleToast('❌ Không thể tải chi tiết xếp phòng. Vui lòng thử lại sau!'))
      }

      if (bookingData) {
        console.log('bk', bookingData)
        setThongTinBooKing(bookingData)
      } else {
        addToast(exampleToast('Không thể tải thông tin booking. Vui lòng thử lại sau!'))
      }

      if (listDichVuMienPhi) {
        console.log('listDichVuMienPhi', listDichVuMienPhi)
        setListDichVuMienPhi(listDichVuMienPhi)

        // Tính tổng số lượng từng loại dịch vụ miễn phí
        const tongSoLuongTheoLoai = listDichVuMienPhi.reduce((acc, item) => {
          const ma = item.maDichVuMienPhi.maDichVuMienPhi
          if (!acc[ma]) acc[ma] = 0
          acc[ma] += item.soLuong
          return acc
        }, {})

        // Cập nhật state chỉ với thuộc tính tongSoLuong
        setHoaDonDichVuMienPhi([
          {
            dichVuMienPhi: { maDichVuMienPhi: 'NUOC_SUOI' },
            tongSoLuong: tongSoLuongTheoLoai['NUOC_SUOI'] || 0,
            tongSoLuongConLai: 0,
          },
          {
            dichVuMienPhi: { maDichVuMienPhi: 'TRA' },
            tongSoLuong: tongSoLuongTheoLoai['TRA'] || 0,
            tongSoLuongConLai: 0,
          },
          {
            dichVuMienPhi: { maDichVuMienPhi: 'CAPHE' },
            tongSoLuong: tongSoLuongTheoLoai['CAPHE'] || 0,
            tongSoLuongConLai: 0,
          },
        ])
        console.log('Tổng số lượng dịch vụ miễn phí:', tongSoLuongTheoLoai)
      } else {
        addToast(exampleToast('Không thể tải danh sách dịch vụ miễn phí. Vui lòng thử lại sau!'))
      }

      if (listGiaPhongTheoNgay) {
        console.log('listGiaPhongTheoNgay', listGiaPhongTheoNgay)
        setListGiaPhongTheoNgay(listGiaPhongTheoNgay)
      } else {
        addToast(exampleToast('Không thể tải danh sách giá phòng theo ngày. Vui lòng thử lại sau!'))
      }

      if (hinhThucThanhToanData) {
        console.log('hinhThucThanhToanData', hinhThucThanhToanData)
        setHinhThucThanhToan(hinhThucThanhToanData)
      } else {
        addToast(
          exampleToast('Không thể tải danh sách hình thức thanh toán. Vui lòng thử lại sau!'),
        )
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const [tongSoLuong, setTongSoLuong] = useState(0) // Lưu tổng số lượng
  const [tongThanhTienDichVu, setTongThanhTienDichVu] = useState(0)

  const [tongPhuThu, setTongPhuThu] = useState(0)

  const [trangthaiload, setTrangthaiload] = useState(false)

  const [selectedOption, setSelectedOption] = useState('1') // Mặc định là "Tiền mặt"

  const [loadSubmit, setLoadSubmit] = useState(false)

  const [ngayDiMoi, setNgayDiMoi] = useState(null)

  const [giamGia, setGiamGia] = useState(0)

  const [visibleGhiChu, setVisibleGhiChu] = useState(false)
  const [selectedDichVu, setSelectedDichVu] = useState(null)
  const [danhSachGhiChu, setDanhSachGhiChu] = useState({})
  const [ghiChu, setGhiChu] = useState('')

  const handleSubmit = async () => {
    // Kiểm tra dịch vụ có giá = 0 nhưng không có ghi chú
    const dichVuKhongHopLe = danhSachPhieuDichVu.find(
      (item) => item.gia === 0 && (!item.ghiChu || item.ghiChu.trim() === ''),
    )

    if (dichVuKhongHopLe) {
      addToast(
        exampleToast(
          `❌ Dịch vụ "${dichVuKhongHopLe.dichVu.tenDichVu}" có giá = 0 nhưng chưa nhập ghi chú. Vui lòng nhập ghi chú trước khi thanh toán!`,
        ),
      )
      return
    }

    // Kiểm tra nếu chọn phương thức thanh toán là "Khác" thì bắt buộc phải có ghi chú
    const selectedHinhThuc = hinhThucThanhToan.find(
      (ht) => ht.maHinhThucThanhToan.toString() === selectedOption,
    )
    if (selectedHinhThuc?.tenHinhThucThanhToan === 'Khác' && (!ghiChu || ghiChu.trim() === '')) {
      addToast(exampleToast('❌ Vui lòng nhập ghi chú cho phương thức thanh toán Khác!'))
      return
    }

    if (!chiTietXepPhong || (Array.isArray(chiTietXepPhong) && chiTietXepPhong.length === 0)) {
      addToast(exampleToast('❌ Lỗi: chiTietXepPhong không được rỗng!'))
      return
    }

    if (!ma_xepphong_booking) {
      addToast(exampleToast('❌ Lỗi: Thiếu mã xếp phòng booking!'))
      return
    }

    // const tongTienPhong = tinhTongTienPhong(
    //   chiTietXepPhong.ngayDen,
    //   ngayDiMoi || chiTietXepPhong.ngayDi,
    //   chiTietXepPhong.gia,
    // )

    const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)

    const soDem = tinhSoDem(chiTietXepPhong.ngayDen, ngayDiMoi || chiTietXepPhong.ngayDi)

    const data = {
      tongTienPhong: tongTienPhong,
      tongTienDichVu: danhSachPhieuDichVu.reduce((sum, item) => sum + item.thanhTien, 0),
      giamGia: giamGia,
      phuThu: tongPhuThu,
      ngayDi: format(ngayDiMoi || chiTietXepPhong.ngayDi, 'yyyy-MM-dd'),
      tongThanhToan: tongTienKhauTruKhacCanTra,
      hinhThucThanhToan: {
        maHinhThucThanhToan: selectedOption,
      },
      hoaDonDichVuMienPhi: hoaDonDichVuMienPhi,
      ghiChu: ghiChu,
      chiTietHoaDon: [
        ...danhSachPhieuDichVu.map((item) => ({
          loaiKhoanMuc: 'DICH_VU',
          moTa: `${item.dichVu.tenDichVu} - Phòng ${chiTietXepPhong.phong.maPhong}`,
          soLuong: item.soLuong,
          donGia: item.gia,
          thanhTien: item.thanhTien,
          donViTinh: item.dichVu.dvt,
          ghiChu: item.dichVu.tenDichVu,
          xepPhongBooKing: {
            maXepPhongBooking: ma_xepphong_booking,
          },
        })),
        ...listGiaPhongTheoNgay.map((item) => ({
          loaiKhoanMuc: 'TIEN_PHONG',
          moTa: `Tiền phòng ${chiTietXepPhong.phong.maPhong} - ${
            chiTietXepPhong.phong.loaiPhong.maLoaiPhong
          } (${format(parseISO(item.ngay), 'dd/MM/yyyy')})`,
          soLuong: 1,
          donGia: item.gia || 0,
          thanhTien: item.gia || 0,
          donViTinh: 'Đêm',
          ghiChu: 'Dịch vụ cho thuê phòng',
          xepPhongBooKing: {
            maXepPhongBooking: ma_xepphong_booking,
          },
        })),
      ],
    }

    if (chiTietXepPhong.phuThuTienGiuong > 0) {
      data.chiTietHoaDon.push({
        loaiKhoanMuc: 'PHU_THU_TIEN_GIUONG',
        moTa: `Phụ thu tiền giường phòng ${chiTietXepPhong.phong.maPhong}`,
        soLuong: chiTietXepPhong.soGiuong,
        donGia: chiTietXepPhong.phuThuTienGiuong,
        thanhTien: chiTietXepPhong.soGiuong * chiTietXepPhong.phuThuTienGiuong * soDem,
        donViTinh: 'Cái',
        ghiChu: 'Phụ thu tiền giường',
        xepPhongBooKing: {
          maXepPhongBooking: ma_xepphong_booking,
        },
      })
    }
    if (chiTietXepPhong.phuThuNguoiLon > 0) {
      data.chiTietHoaDon.push({
        loaiKhoanMuc: 'PHU_THU_NGUOI_LON',
        moTa: `Phụ thu tiền người lớn phòng ${chiTietXepPhong.phong.maPhong}`,
        soLuong: chiTietXepPhong.soNguoiLon,
        donGia: chiTietXepPhong.phuThuNguoiLon,
        thanhTien: chiTietXepPhong.soNguoiLon * chiTietXepPhong.phuThuNguoiLon * soDem,
        donViTinh: 'Người',
        ghiChu: 'Phụ thu tiền người lớn',
        xepPhongBooKing: {
          maXepPhongBooking: ma_xepphong_booking,
        },
      })
    }
    if (chiTietXepPhong.phuThuTienTre > 0) {
      data.chiTietHoaDon.push({
        loaiKhoanMuc: 'PHU_THU_TRE_EM',
        moTa: `Phụ thu tiền trẻ em phòng ${chiTietXepPhong.phong.maPhong}`,
        soLuong: chiTietXepPhong.soTre,
        donGia: chiTietXepPhong.phuThuTienTre,
        thanhTien: chiTietXepPhong.soTre * chiTietXepPhong.phuThuTienTre * soDem,
        donViTinh: 'Người',
        ghiChu: 'Phụ thu tiền trẻ em',
        xepPhongBooKing: {
          maXepPhongBooking: ma_xepphong_booking,
        },
      })
    }

    console.log(data)

    try {
      setLoadSubmit(true)
      // 5. Gọi API nếu dữ liệu hợp lệ
      const response = await createHoaDon(ma_booking, ma_xepphong_booking, data, navigate)

      console.log('createHoaDon successfully:', response)

      // 6. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast(response.message))
        setTimeout(() => {
          setLoadSubmit(false)
          navigate('/dashboard')
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
  }

  const [tongTienKhauTruKhacCanTra, settongTienKhauTruKhacCanTra] = useState(0)
  const [phuThu, setPhuThu] = useState(0)

  // Thêm state cho số lượng dịch vụ miễn phí
  const [soLuongNuocSuoi, setSoLuongNuocSuoi] = useState(0)
  const [soLuongTra, setSoLuongTra] = useState(0)
  const [soLuongCafe, setSoLuongCafe] = useState(0)

  // Thêm hàm xử lý thay đổi số lượng
  const handleChangeSoLuongNuocSuoi = (e) => {
    const value = e.target.value === '' ? 0 : Math.abs(parseInt(e.target.value))
    setSoLuongNuocSuoi(value)
    updateSoLuongConLai('NUOC_SUOI', value)
  }

  const handleChangeSoLuongTra = (e) => {
    const value = e.target.value === '' ? 0 : Math.abs(parseInt(e.target.value))
    setSoLuongTra(value)
    updateSoLuongConLai('TRA', value)
  }

  const handleChangeSoLuongCafe = (e) => {
    const value = e.target.value === '' ? 0 : Math.abs(parseInt(e.target.value))
    setSoLuongCafe(value)
    updateSoLuongConLai('CAPHE', value)
  }

  const handleChange = (value) => {
    const parsedValue = parseFloat(value) || 0
    setPhuThu(parsedValue)
    const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)
    settongTienKhauTruKhacCanTra(tongTienPhong + tongThanhTienDichVu + parsedValue + tongPhuThu)
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

  const handleNgayDiChange = (date) => {
    if (date !== null) {
      if (date === ngayDiMoi) return
      const ngayDenDate = new Date(chiTietXepPhong.ngayDen)
      const ngayDiDate = new Date(date)

      ngayDenDate.setHours(0, 0, 0, 0)
      ngayDiDate.setHours(0, 0, 0, 0)

      if (ngayDiDate < ngayDenDate) {
        addToast(exampleToast('❌ Ngày đi không được nhỏ hơn ngày đến!'))
        const oldDate = ngayDiMoi || chiTietXepPhong.ngayDi
        setNgayDiMoi(oldDate)
        return
      }

      setNgayDiMoi(date)
      const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)
      const tongPhuThu =
        tinhSoDem(chiTietXepPhong.ngayDen, date) *
        ((chiTietXepPhong?.phuThuTienGiuong || 0) * (chiTietXepPhong?.soGiuong || 0) +
          (chiTietXepPhong?.phuThuNguoiLon || 0) * (chiTietXepPhong?.soNguoiLon || 0) +
          (chiTietXepPhong?.phuThuTienTre || 0) * (chiTietXepPhong?.soTre || 0))
      setTongPhuThu(tongPhuThu)

      settongTienKhauTruKhacCanTra(tongTienPhong + tongThanhTienDichVu + tongPhuThu - giamGia)
    }
  }

  const [visibleDichVu, setvisibleDichVu] = useState(false)

  const ChoXyLyThemDichVu = async (data) => {
    if (data) {
      try {
        setLoadingDichVu(true)
        const danhsachdv = await getAllPhieuDichVuByMaBooKing(ma_xepphong_booking, navigate)

        console.log('danh sách', danhsachdv)
        let tongTienDV = 0
        if (danhsachdv) {
          const isSameData = JSON.stringify(danhSachPhieuDichVu) === JSON.stringify(danhsachdv)
          if (!isSameData) {
            setDanhSachPhieuDichVu(danhsachdv)
            setTongSoLuong(danhsachdv.reduce((sum, item) => sum + item.soLuong, 0))
            tongTienDV = danhsachdv.reduce((sum, item) => sum + item.thanhTien, 0)
            setTongThanhTienDichVu(tongTienDV)

            // Tính tổng tiền phòng dựa trên số đêm
            const tongTienPhong = tinhTongTienPhong(
              chiTietXepPhong.ngayDen,
              chiTietXepPhong.ngayDi,
              chiTietXepPhong.gia,
            )

            // Cập nhật tổng tiền khách cần trả
            setTongTienKhachCanTra(tongTienPhong + tongTienDV)
            settongTienKhauTruKhacCanTra(tongTienPhong + tongTienDV + tongPhuThu)

            setLoadingDichVu(false)
          }
        } else {
          addToast(exampleToast('❌ Không thể tải danh sách dich vụ. Vui lòng thử lại sau!'))
          setLoadingDichVu(false)
        }
      } catch (error) {
        setLoadingDichVu(false)
        console.error('Lỗi khi tải dữ liệu:', error)
        addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
      }

      setvisibleDichVu(false)
    }
  }

  const handleGiamGiaChange = (value) => {
    const parsedValue = parseFloat(value) || 0
    setGiamGia(parsedValue)
    const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)
    const tongPhuThu =
      tinhSoDem(chiTietXepPhong.ngayDen, ngayDiMoi || chiTietXepPhong.ngayDi) *
      ((chiTietXepPhong?.phuThuTienGiuong || 0) * (chiTietXepPhong?.soGiuong || 0) +
        (chiTietXepPhong?.phuThuNguoiLon || 0) * (chiTietXepPhong?.soNguoiLon || 0) +
        (chiTietXepPhong?.phuThuTienTre || 0) * (chiTietXepPhong?.soTre || 0))

    settongTienKhauTruKhacCanTra(tongTienPhong + tongThanhTienDichVu + tongPhuThu - parsedValue)
  }

  const handleChangeQuantity = (maDichVu, soLuongMoi) => {
    const danhSachMoi = danhSachPhieuDichVu.map((item) => {
      if (item.dichVu.maDichVu === maDichVu) {
        return {
          ...item,
          soLuong: soLuongMoi,
          thanhTien: soLuongMoi * item.gia,
        }
      }
      return item
    })

    setDanhSachPhieuDichVu(danhSachMoi)

    const tongSoLuongMoi = danhSachMoi.reduce((sum, item) => sum + item.soLuong, 0)
    const tongThanhTienMoi = danhSachMoi.reduce((sum, item) => sum + item.thanhTien, 0)

    setTongSoLuong(tongSoLuongMoi)
    setTongThanhTienDichVu(tongThanhTienMoi)

    const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)
    const tongPhuThu =
      tinhSoDem(chiTietXepPhong.ngayDen, ngayDiMoi || chiTietXepPhong.ngayDi) *
      ((chiTietXepPhong?.phuThuTienGiuong || 0) * (chiTietXepPhong?.soGiuong || 0) +
        (chiTietXepPhong?.phuThuNguoiLon || 0) * (chiTietXepPhong?.soNguoiLon || 0) +
        (chiTietXepPhong?.phuThuTienTre || 0) * (chiTietXepPhong?.soTre || 0))

    settongTienKhauTruKhacCanTra(tongTienPhong + tongThanhTienMoi + tongPhuThu - giamGia)
  }

  const handleChangeGia = (maDichVu, giaMoi) => {
    let giaMoiNumber = 0
    if (typeof giaMoi === 'string') {
      const cleanedValue = giaMoi.replace(/[^\d.]/g, '')
      const parts = cleanedValue.split('.')
      if (parts.length > 0) {
        giaMoiNumber = parseInt(parts[0]) || 0
      }
    } else if (typeof giaMoi === 'number') {
      giaMoiNumber = giaMoi
    }

    const danhSachMoi = danhSachPhieuDichVu.map((item) => {
      if (item.dichVu.maDichVu === maDichVu) {
        return {
          ...item,
          gia: giaMoiNumber,
          thanhTien: item.soLuong * giaMoiNumber,
        }
      }
      return item
    })

    setDanhSachPhieuDichVu(danhSachMoi)

    const tongThanhTienMoi = danhSachMoi.reduce((sum, item) => sum + item.thanhTien, 0)
    setTongThanhTienDichVu(tongThanhTienMoi)

    const tongTienPhong = tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay)
    const tongPhuThu =
      tinhSoDem(chiTietXepPhong.ngayDen, ngayDiMoi || chiTietXepPhong.ngayDi) *
      ((chiTietXepPhong?.phuThuTienGiuong || 0) * (chiTietXepPhong?.soGiuong || 0) +
        (chiTietXepPhong?.phuThuNguoiLon || 0) * (chiTietXepPhong?.soNguoiLon || 0) +
        (chiTietXepPhong?.phuThuTienTre || 0) * (chiTietXepPhong?.soTre || 0))

    settongTienKhauTruKhacCanTra(tongTienPhong + tongThanhTienMoi + tongPhuThu - giamGia)
  }

  const handleGhiChu = (maDichVu, ghiChu) => {
    setDanhSachPhieuDichVu((prev) =>
      prev.map((item) => (item.dichVu.maDichVu === maDichVu ? { ...item, ghiChu: ghiChu } : item)),
    )
  }

  const [visibleHTXoaDichVu, setVisibleHTXoaDichVu] = useState(false)
  const [maPhieuDichVu, setMaPhieuDichVu] = useState(null)

  const [tenDichVu, setTenDichVu] = useState(null)
  const handleClickHienThiXoaDichVu = (maPhieuDichVu, tenDichVu) => {
    setMaPhieuDichVu(maPhieuDichVu)
    setTenDichVu(tenDichVu)
    setVisibleHTXoaDichVu(true)
  }

  const ChoXyLyXoaDichVu = (data) => {
    if (data.trangthai) {
      setDanhSachPhieuDichVu((prev) => {
        const updatedList = prev.filter((item) => item.maPhieuDichVu !== data.maPhieuDichVu)

        // Tính tổng số lượng và tổng thành tiền mới
        const totalQuantity = updatedList.reduce((sum, item) => sum + item.soLuong, 0)
        const totalPrice = updatedList.reduce((sum, item) => sum + item.thanhTien, 0)

        // Cập nhật tổng số lượng và tổng thành tiền
        setTongSoLuong(totalQuantity)
        setTongThanhTienDichVu(totalPrice)

        // Tính lại tổng tiền khách cần trả
        const tongTienPhong = tinhTongTienPhong(
          chiTietXepPhong.ngayDen,
          ngayDiMoi || chiTietXepPhong.ngayDi,
          chiTietXepPhong.gia,
        )

        const tongPhuThu =
          tinhSoDem(chiTietXepPhong.ngayDen, ngayDiMoi || chiTietXepPhong.ngayDi) *
          ((chiTietXepPhong?.phuThuTienGiuong || 0) * (chiTietXepPhong?.soGiuong || 0) +
            (chiTietXepPhong?.phuThuNguoiLon || 0) * (chiTietXepPhong?.soNguoiLon || 0) +
            (chiTietXepPhong?.phuThuTienTre || 0) * (chiTietXepPhong?.soTre || 0))

        settongTienKhauTruKhacCanTra(tongTienPhong + totalPrice + tongPhuThu - giamGia)

        return updatedList
      })

      setVisibleHTXoaDichVu(false)
    }
  }

  const handleSaveGhiChu = (note) => {
    if (selectedDichVu) {
      // Xóa dịch vụ khỏi danh sách
      setDanhSachPhieuDichVu((prev) =>
        prev.filter((item) => item.dichVu.maDichVu !== selectedDichVu),
      )
      setVisibleGhiChu(false)
      setSelectedDichVu(null)
    }
  }

  // Thêm hàm tính tổng số lượng cho từng loại dịch vụ
  const tinhTongSoLuong = (maDichVu) => {
    return listDichVuMienPhi
      .filter((item) => item.maDichVuMienPhi.maDichVuMienPhi === maDichVu)
      .reduce((total, item) => total + item.soLuong, 0)
  }

  // Thêm hàm cập nhật số lượng còn lại
  const updateSoLuongConLai = (maDichVu, soLuong) => {
    setHoaDonDichVuMienPhi((prev) =>
      prev.map((item) => {
        if (item.dichVuMienPhi.maDichVuMienPhi === maDichVu) {
          return {
            ...item,
            tongSoLuong: tinhTongSoLuong(maDichVu),
            tongSoLuongConLai: soLuong || null,
          }
        }
        return item
      }),
    )
  }

  // Thêm hàm xử lý thay đổi ghi chú
  const handleChangeGhiChu = (maDichVu, ghiChu) => {
    setHoaDonDichVuMienPhi((prev) =>
      prev.map((item) => {
        if (item.dichVuMienPhi.maDichVuMienPhi === maDichVu) {
          return {
            ...item,
            ghiChu: ghiChu,
          }
        }
        return item
      }),
    )
  }

  return (
    <CRow className="px-2">
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      {loading ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CSpinner />
        </div>
      ) : (
        <CCard>
          <CCardBody>
            <CRow>
              <CForm className=" needs-validation">
                <div className="relative mb-3">
                  <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                    Thông tin khách hàng
                  </span>
                  <div className="border-2 border-gray-500 rounded-md p-2">
                    <CRow>
                      <CTable align="middle" responsive borderless>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Tên
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Điện thoại
                            </CTableHeaderCell>

                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Công ty
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Mã tour
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Đặt cọc
                            </CTableHeaderCell>

                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Mục đích đến
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Nguồn đặt
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Khuyễn mãi
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          <CTableRow>
                            <CTableDataCell>
                              {' '}
                              {thongTinBooKing?.danhXung?.maDanhXung}
                              {'.'}
                              {thongTinBooKing?.khachHangBooKing?.hoKhachHangBooking}{' '}
                              {thongTinBooKing?.khachHangBooKing?.tenKhachHangBooking}
                            </CTableDataCell>
                            <CTableDataCell>
                              {thongTinBooKing?.khachHangBooKing?.sdtBooking}
                            </CTableDataCell>
                            <CTableDataCell>
                              {thongTinBooKing?.nhomKhachHang?.tenNhomKhachHang}
                            </CTableDataCell>
                            <CTableDataCell>
                              {thongTinBooKing?.thongTinLienHeBooKing?.tourCode}
                            </CTableDataCell>
                            <CTableDataCell>
                              {formatCurrency(thongTinBooKing?.tienCoc) || 0}
                            </CTableDataCell>
                            <CTableDataCell>
                              {thongTinBooKing?.mucDichDen?.tenMucDich}
                            </CTableDataCell>
                            <CTableDataCell>
                              {thongTinBooKing?.nguonKhach?.tenNguonKhach}
                            </CTableDataCell>
                            <CTableDataCell>{thongTinBooKing?.giamGia?.tenGiamGia}</CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    </CRow>
                  </div>
                </div>
                <div className="relative mb-3">
                  <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                    Thông tin phòng
                  </span>
                  <div className="border-2 border-gray-500 rounded-md p-2 ">
                    <CRow>
                      <CTable align="middle" responsive borderless>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Loại Phòng
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Số Phòng
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Ngày Đến
                            </CTableHeaderCell>
                            {/* <CTableHeaderCell scope="col" className="!text-blue-600">
                              Giờ Đến
                            </CTableHeaderCell> */}
                            <CTableHeaderCell scope="col" className="!text-red-600">
                              Ngày Đi
                            </CTableHeaderCell>
                            {/* <CTableHeaderCell scope="col" className="!text-blue-600">
                              Giờ Đi
                            </CTableHeaderCell> */}

                            {/* <CTableHeaderCell scope="col" className="!text-blue-600">
                              Loại giá
                            </CTableHeaderCell> */}
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Tiền phòng
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Phụ thu giường
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Số giường
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Phụ thu người lớn
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Số người lớn
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Phụ thu trẻ em
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Số trẻ
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          <CTableRow>
                            <CTableDataCell>
                              {chiTietXepPhong?.phong?.loaiPhong?.tenLoaiPhong || ''}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.phong?.tenPhong || ''}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong.ngayDen
                                ? format(parseISO(chiTietXepPhong.ngayDen), 'dd/MM/yyyy')
                                : 'N/A'}
                            </CTableDataCell>
                            {/* <CTableDataCell>
                              {chiTietXepPhong?.gioDen?.slice(0, 5) || 'N/A'}
                            </CTableDataCell> */}
                            <CTableDataCell>
                              {chiTietXepPhong.ngayDi
                                ? format(parseISO(chiTietXepPhong.ngayDi), 'dd/MM/yyyy')
                                : 'N/A'}
                              {/* <CDatePicker
                                locale="en-GB"
                                date={ngayDiMoi || chiTietXepPhong.ngayDi}
                                onDateChange={handleNgayDiChange}
                                className="w-full "
                                minDate={
                                  new Date(
                                    new Date(chiTietXepPhong.ngayDen).setDate(
                                      new Date(chiTietXepPhong.ngayDen).getDate() - 1,
                                    ),
                                  )
                                }
                              /> */}
                            </CTableDataCell>
                            {/* <CTableDataCell>
                              {chiTietXepPhong?.gioDi?.slice(0, 5) || 'N/A'}
                            </CTableDataCell> */}
                            {/* <CTableDataCell>
                              {chiTietXepPhong?.loaiGia?.tenLoaiGia || ''}
                            </CTableDataCell> */}
                            <CTableDataCell>
                              {formatCurrency(tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay))}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.phuThuTienGiuong?.toLocaleString('en-US') || 0}
                            </CTableDataCell>
                            <CTableDataCell>{chiTietXepPhong?.soGiuong || 0}</CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.phuThuNguoiLon?.toLocaleString('en-US') || 0}
                            </CTableDataCell>
                            <CTableDataCell>{chiTietXepPhong?.soNguoiLon || 0}</CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.phuThuTienTre?.toLocaleString('en-US') || 0}
                            </CTableDataCell>
                            <CTableDataCell>{chiTietXepPhong?.soTre || 0}</CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                      <div className="mb-4 flex justify-end gap-2">
                        <div>
                          Số đêm:{' '}
                          {tinhSoDem(chiTietXepPhong.ngayDen, ngayDiMoi || chiTietXepPhong.ngayDi)}{' '}
                          ,
                        </div>
                        <div>
                          Tổng tiền phòng:{' '}
                          {formatCurrency(tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay))}
                        </div>
                        <div>
                          Tổng tiền phụ thu:{' '}
                          {formatCurrency(
                            tinhSoDem(
                              chiTietXepPhong.ngayDen,
                              ngayDiMoi || chiTietXepPhong.ngayDi,
                            ) *
                              ((chiTietXepPhong?.phuThuTienGiuong || 0) *
                                (chiTietXepPhong?.soGiuong || 0) +
                                (chiTietXepPhong?.phuThuNguoiLon || 0) *
                                  (chiTietXepPhong?.soNguoiLon || 0) +
                                (chiTietXepPhong?.phuThuTienTre || 0) *
                                  (chiTietXepPhong?.soTre || 0)),
                          )}
                        </div>
                      </div>
                    </CRow>

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
                <CRow>
                  <CCol md={8}>
                    <div className="relative mb-3">
                      <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                        Danh sách dịch vụ
                      </span>
                      <div className="border-2 border-gray-500 rounded-md p-2 ">
                        <div className="overflow-x-auto custom-scrollbar">
                          <CTable align="middle" responsive>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  STT
                                </CTableHeaderCell>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  Hạng mục
                                </CTableHeaderCell>
                                <CTableHeaderCell
                                  scope="col"
                                  className="!text-blue-600 text-center"
                                >
                                  Số lượng
                                </CTableHeaderCell>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  Đơn giá
                                </CTableHeaderCell>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  Thành tiền
                                </CTableHeaderCell>
                                <CTableHeaderCell scope="col" className="!text-blue-600">
                                  Ghi chú
                                </CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>

                            <CTableBody>
                              {trangthaiload ? (
                                <CTableRow>
                                  <CTableDataCell colSpan="9">Đang tải...</CTableDataCell>
                                </CTableRow>
                              ) : danhSachPhieuDichVu.length > 0 ? (
                                danhSachPhieuDichVu.map((item, index) => (
                                  <CTableRow key={item.maPhieuDichVu}>
                                    <CTableDataCell>{index + 1}</CTableDataCell>
                                    <CTableDataCell>
                                      {item.dichVu.tenDichVu} ({item.dichVu.dvt})
                                    </CTableDataCell>
                                    <CTableDataCell className="text-center">
                                      <input
                                        type="number"
                                        className="outline-none border-b border-gray-500 rounded-none text-center w-16"
                                        min={1}
                                        value={item.soLuong}
                                        onChange={(e) =>
                                          handleChangeQuantity(
                                            item.dichVu.maDichVu,
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <CurrencyInput
                                        className="outline-none w-20 border-b-2 border-gray-500 rounded-none text-right"
                                        name="input-name"
                                        placeholder="Please enter a number"
                                        value={item.gia}
                                        decimalsLimit={2}
                                        onChange={(e) =>
                                          handleChangeGia(item.dichVu.maDichVu, e.target.value)
                                        }
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      {item.thanhTien.toLocaleString('en-US')}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          placeholder="Nhập ghi chú nếu giá bằng 0"
                                          className={`outline-none border-b-2 rounded-none  ${
                                            item.gia === 0 ? 'border-red-500' : 'border-gray-500'
                                          }`}
                                          value={item.ghiChu || ''}
                                          onChange={(e) =>
                                            handleGhiChu(item.dichVu.maDichVu, e.target.value)
                                          }
                                        />
                                        <CButton
                                          color="danger"
                                          variant="ghost"
                                          className="p-1 hover:bg-red-500 hover:text-white"
                                          onClick={() =>
                                            handleClickHienThiXoaDichVu(
                                              item.maPhieuDichVu,
                                              item.dichVu.tenDichVu,
                                            )
                                          }
                                        >
                                          <FontAwesomeIcon icon={faTrash} />
                                        </CButton>
                                      </div>
                                    </CTableDataCell>
                                  </CTableRow>
                                ))
                              ) : (
                                <CTableRow>
                                  <CTableDataCell colSpan="9">
                                    <h4>Chưa có thông tin dịch vụ</h4>
                                  </CTableDataCell>
                                </CTableRow>
                              )}

                              <CTableRow>
                                <CTableDataCell scope="col" className="!text-green-500 ">
                                  Tổng
                                </CTableDataCell>
                                <CTableDataCell
                                  className="text-center"
                                  scope="col"
                                ></CTableDataCell>
                                <CTableDataCell
                                  scope="col"
                                  className="text-center !text-green-500 "
                                >
                                  {tongSoLuong}
                                </CTableDataCell>
                                <CTableDataCell
                                  scope="col"
                                  className="text-center "
                                ></CTableDataCell>
                                <CTableDataCell scope="col" className="!text-green-500 ">
                                  {tongThanhTienDichVu.toLocaleString('en-US')}
                                </CTableDataCell>
                                <CTableDataCell
                                  scope="col"
                                  className="text-center"
                                ></CTableDataCell>
                              </CTableRow>
                            </CTableBody>
                          </CTable>

                          <CCol className=" d-md-flex justify-content-md-end mb-3">
                            <CButton
                              color="success"
                              onClick={() => setvisibleDichVu(true)}
                              variant="outline"
                              className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
                            >
                              <FontAwesomeIcon
                                className="cursor-pointer mr-2"
                                icon={faCirclePlus}
                              />
                              Thêm dịch vụ
                            </CButton>
                          </CCol>
                        </div>
                      </div>
                    </div>
                    {/* <div className="relative mb-3">
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
                              <CTableHeaderCell scope="col" className="!text-blue-600 text-center">
                                Tổng số lượng tất cả ngày
                              </CTableHeaderCell>
                              <CTableHeaderCell scope="col" className="!text-blue-600">
                                Số lượng còn lại
                              </CTableHeaderCell>
                              <CTableHeaderCell scope="col" className="!text-blue-600">
                                Ghi chú
                              </CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            <CTableRow>
                              <CTableDataCell>Nước suối (350ml)</CTableDataCell>
                              <CTableDataCell className="text-center">
                                {tinhTongSoLuong('NUOC_SUOI')}
                              </CTableDataCell>
                              <CTableDataCell>
                                <input
                                  type="number"
                                  className="outline-none w-24 border-b border-gray-500 rounded-none text-center"
                                  min={0}
                                  value={
                                    hoaDonDichVuMienPhi.find(
                                      (item) => item.dichVuMienPhi.maDichVuMienPhi === 'NUOC_SUOI',
                                    )?.tongSoLuongConLai || ''
                                  }
                                  onChange={handleChangeSoLuongNuocSuoi}
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <input
                                  type="text"
                                  className="outline-none w-full border-b border-gray-500 rounded-none"
                                  placeholder="Nhập ghi chú"
                                  value={
                                    hoaDonDichVuMienPhi.find(
                                      (item) => item.dichVuMienPhi.maDichVuMienPhi === 'NUOC_SUOI',
                                    )?.ghiChu ?? ''
                                  }
                                  onChange={(e) => handleChangeGhiChu('NUOC_SUOI', e.target.value)}
                                />
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableDataCell>Trà</CTableDataCell>
                              <CTableDataCell className="text-center">
                                {tinhTongSoLuong('TRA')}
                              </CTableDataCell>
                              <CTableDataCell>
                                <input
                                  type="number"
                                  className="outline-none w-24 border-b border-gray-500 rounded-none text-center"
                                  min={0}
                                  value={
                                    hoaDonDichVuMienPhi.find(
                                      (item) => item.dichVuMienPhi.maDichVuMienPhi === 'TRA',
                                    )?.tongSoLuongConLai || ''
                                  }
                                  onChange={handleChangeSoLuongTra}
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <input
                                  type="text"
                                  className="outline-none w-full border-b border-gray-500 rounded-none "
                                  placeholder="Nhập ghi chú"
                                  value={
                                    hoaDonDichVuMienPhi.find(
                                      (item) => item.dichVuMienPhi.maDichVuMienPhi === 'TRA',
                                    )?.ghiChu ?? ''
                                  }
                                  onChange={(e) => handleChangeGhiChu('TRA', e.target.value)}
                                />
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableDataCell>Cà phê</CTableDataCell>
                              <CTableDataCell className="text-center">
                                {tinhTongSoLuong('CAPHE')}
                              </CTableDataCell>
                              <CTableDataCell>
                                <input
                                  type="number"
                                  className="outline-none w-24 border-b border-gray-500 rounded-none text-center"
                                  min={0}
                                  value={
                                    hoaDonDichVuMienPhi.find(
                                      (item) => item.dichVuMienPhi.maDichVuMienPhi === 'CAPHE',
                                    )?.tongSoLuongConLai || ''
                                  }
                                  onChange={handleChangeSoLuongCafe}
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <input
                                  type="text"
                                  className="outline-none w-full border-b border-gray-500 rounded-none"
                                  placeholder="Nhập ghi chú"
                                  value={
                                    hoaDonDichVuMienPhi.find(
                                      (item) => item.dichVuMienPhi.maDichVuMienPhi === 'CAPHE',
                                    )?.ghiChu ?? ''
                                  }
                                  onChange={(e) => handleChangeGhiChu('CAPHE', e.target.value)}
                                />
                              </CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                      </div>
                    </div> */}
                  </CCol>
                  <CCol md={4}>
                    <div className="relative mb-3">
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
                                  {formatCurrency(tinhTongGiaPhongTheoNgay(listGiaPhongTheoNgay))}
                                </CTableDataCell>
                              </CTableRow>
                              <CTableRow>
                                <CTableHeaderCell>Đặt cọc</CTableHeaderCell>
                                <CTableDataCell className="font-semibold text-right">
                                  {formatCurrency(thongTinBooKing?.tienCoc) || 0}
                                </CTableDataCell>
                              </CTableRow>
                              <CTableRow>
                                <CTableDataCell scope="row">Phụ thu</CTableDataCell>
                                <CTableDataCell className="font-semibold text-right">
                                  {formatCurrency(tongPhuThu)}
                                </CTableDataCell>
                              </CTableRow>
                              <CTableRow>
                                <CTableDataCell scope="row">Tổng tiền dịch vụ</CTableDataCell>
                                <CTableDataCell className="font-semibold text-right">
                                  {formatCurrency(tongThanhTienDichVu)}
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
                                  />
                                </CTableDataCell>
                              </CTableRow> */}
                              {/* <CTableRow>
                                <CTableDataCell scope="row">Phụ thu khác</CTableDataCell>
                                <CTableDataCell className="text-right ">
                                  <CurrencyInput
                                    className="outline-none w-32 border-b border-gray-500 rounded-none text-right"
                                    name="input-name"
                                    decimalsLimit={2}
                                    onValueChange={handleChange}
                                  />
                                </CTableDataCell>
                              </CTableRow> */}
                              <CTableRow>
                                <CTableHeaderCell scope="row" className="!text-green-500 ">
                                  Khách cần trả
                                </CTableHeaderCell>

                                <CTableDataCell className="font-bold !text-green-500 text-right">
                                  {tongTienKhauTruKhacCanTra.toLocaleString('en-US')}
                                </CTableDataCell>
                              </CTableRow>
                            </CTableBody>
                          </CTable>
                          <hr />
                          {/* <CCol className="mt-3 mb-20">
                            <CCol>
                              <CFormLabel
                                htmlFor="inputPassword"
                                className=" col-form-label labelcustome"
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
                                checked={selectedOption === hinhThuc.maHinhThucThanhToan.toString()}
                                onChange={(e) => setSelectedOption(e.target.value)}
                              />
                            ))}

                            <div className="mb-3 mt-3">
                              <CFormTextarea
                                placeholder="Ghi chú phương thức thanh toán"
                                rows={3}
                                onChange={(e) => setGhiChu(e.target.value)}
                              ></CFormTextarea>
                            </div>
                          </CCol> */}

                          {/* {loadSubmit ? (
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
                          )} */}
                        </div>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </CRow>
          </CCardBody>
        </CCard>
      )}
      <DichVuModal
        visible={visibleDichVu}
        onClose={() => setvisibleDichVu(false)}
        onSubmit={ChoXyLyThemDichVu}
        maPhong={chiTietXepPhong?.phong?.maPhong}
      />

      <GhiChuModal
        visible={visibleGhiChu}
        onClose={() => {
          setVisibleGhiChu(false)
          setSelectedDichVu(null)
        }}
        onSave={handleSaveGhiChu}
        initialNote={selectedDichVu ? danhSachGhiChu[selectedDichVu] : ''}
      />

      <XoaDichVuTrongPhieuModal
        visible={visibleHTXoaDichVu}
        onClose={() => setVisibleHTXoaDichVu(false)}
        ma_booking={ma_booking}
        ma_phieudichvu={maPhieuDichVu}
        ten_dichvu={tenDichVu}
        onSubmit={ChoXyLyXoaDichVu}
      />
    </CRow>
  )
}

export default ThanhToan
