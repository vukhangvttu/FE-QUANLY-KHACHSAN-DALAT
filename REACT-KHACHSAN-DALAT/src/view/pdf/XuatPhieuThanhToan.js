import React, { useEffect, useState } from 'react'
import { Buffer } from 'buffer'
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer'
import { AllThongTinKhachHang } from 'src/service/ThanhToanService'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import logoImgDaLat from 'src/assets/images/logo-ge-da-lat.png'
import logoImgVungTau from 'src/assets/images/logo-ge-vung-tau.png'

import { format, parseISO } from 'date-fns'
import { getDanhSachHoaDon } from 'src/service/HoaDonService'

const viTri = window._env_?.VI_TRI || 'DALAT'
const logoImg = viTri === 'VUNGTAU' ? logoImgVungTau : logoImgDaLat
window.Buffer = Buffer
// Đăng ký font
Font.register({
  family: 'Times New Roman',
  fonts: [
    {
      src: '/fonts/TimesNewRoman.ttf', // Đường dẫn đến file font
      fontWeight: 'normal',
    },
    {
      src: '/fonts/TimesNewRoman-Bold.ttf', // Font in đậm (nếu có)
      fontWeight: 'bold',
    },
    {
      src: '/fonts/TimesNewRoman-Italic.ttf', // Font in nghiêng (nếu có)
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
  ],
})
Font.register({
  family: 'calibri',
  fonts: [
    { src: '/fonts/calibri-regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/calibri-bold.ttf', fontWeight: 'bold' },
    { src: '/fonts/calibri-italic.ttf', fontStyle: 'italic' },
    { src: '/fonts/calibri-bold-italic.ttf', fontWeight: 'bold', fontStyle: 'italic' },
  ],
})
Font.register({
  family: 'VNI-Revue',
  fonts: [
    { src: '/fonts/unicode.revueb.ttf', fontWeight: 'normal' },
    //   { src: '/fonts/VNI-RevueBd.ttf', fontWeight: 'bold' } // Nếu có bản bold
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 11,
  },
  outerBorder: {
    position: 'absolute',
    top: 11,
    left: 11,
    right: 11,
    bottom: 11,
    border: '1 solid #c00000', // viền ngoài
  },
  centerBorder: {
    position: 'absolute',
    top: 13,
    left: 13,
    right: 13,
    bottom: 13,
    border: '4 solid #c00000', // viền giữa
  },
  innerBorder: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    border: '1 solid #c00000', // viền trong
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'VNI-Revue',
    color: 'rgb(192,0,0)',
    textAlign: 'center',
    marginTop: 10,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 1,
    fontFamily: 'calibri',
    fontSize: 11,
  },
  tableRow: {
    flexDirection: 'row',
  },

  header: {
    backgroundColor: 'rgb(255,217,102)',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgb(192,0,0)',
    fontSize: 11,
    borderTopWidth: 1, // Giữ viền trên
  },
  cell: {
    // borderRightWidth: 1, // Chỉ giữ viền phải
    // borderBottomWidth: 1, // Chỉ giữ viền dưới
    borderColor: 'black',
    paddingLeft: 3,
    paddingTop: 3,
    paddingBottom: 0,
  },
  cell_align_center: {
    // borderRightWidth: 1,
    // borderBottomWidth: 1,
    borderColor: 'black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 4,
  },

  // Cột cụ thể
  colPeopleContact: {
    width: 100,
    fontWeight: 'bold',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  colNote: { width: 470, fontWeight: 'bold', borderBottomWidth: 1, borderRightWidth: 1 },
  colTT: {
    width: 30,
    textAlign: 'center',
    borderLeftWidth: 1,
    height: 33,
    borderBottomWidth: 1,
    borderRightWidth: 1,

    paddingLeft: 0,
    paddingRight: 0,
  },
  colDate: { width: 70, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colRoomType: { width: 120, borderBottomWidth: 1, borderRightWidth: 1 },
  colPeople: { width: 100, borderBottomWidth: 1, borderRightWidth: 1 },
  colNights: { width: 50, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colPrice: { width: 60, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colTotal: { width: 80, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colTotalMoneyRoom: {
    borderLeftWidth: 1,
    width: 369,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: 'rgb(244,244,244)',
  },
  colLast: { width: 74, textAlign: 'center' },
  contactInfo: {
    fontSize: 11,
    fontFamily: 'Times New Roman',
    color: '#B8860B',
    textAlign: 'center',
    marginTop: 50,
  },

  ghiChu: { width: 92.2, textAlign: 'center' },

  userInfo: {
    fontSize: 11,
    fontFamily: 'calibri',
    fontWeight: 'bold',
    marginLeft: 400,
    marginTop: 10,
    textAlign: 'center',
  },
})

const formatCurrency = (amount) => {
  const formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return formattedNumber
}

const getTongTienPhong = (data) => {
  if (!Array.isArray(data)) return 0
  return data.reduce((sum, row) => sum + (row.tongTienPhong || 0), 0)
}

const getTongTienDichVu = (data) => {
  if (!Array.isArray(data)) return 0
  return data.reduce((sum, row) => sum + (row.tongTienDichVu || 0), 0)
}

const getTongTienPhuThu = (data) => {
  if (!Array.isArray(data)) return 0
  return data.reduce((sum, row) => sum + (row.tongTienPhuThu || 0), 0)
}

const getTongTienThanhToan = (data) => {
  if (!Array.isArray(data)) return 0
  return data.reduce((sum, row) => sum + (row.tongTienThanhToan || 0), 0)
}

// Định nghĩa cấu hình các cột cho bảng
const columns = [
  {
    key: 'index',
    style: [styles.cell_align_center, styles.colTT],
    render: (row, i) => (Object.keys(row).length === 0 ? '' : i + 1),
  },
  {
    key: 'ngayDen',
    style: [styles.cell_align_center, styles.colDate],
    render: (row) => (row?.ngayDen ? format(parseISO(row.ngayDen), 'dd/MM/yyyy') : '' || ''),
  },
  {
    key: 'ngayDi',
    style: [styles.cell_align_center, styles.colDate],
    render: (row) => (row?.ngayDi ? format(parseISO(row.ngayDi), 'dd/MM/yyyy') : '' || ''),
  },
  {
    key: 'tenLoaiPhong',
    style: [styles.cell, styles.colRoomType],
    render: (row, i) => (Object.keys(row).length === 0 ? '' : row.tenLoaiPhong || ''),
  },

  {
    key: 'soNgayO',
    style: [styles.cell_align_center, styles.colNights],
    render: (row) => (Object.keys(row).length === 0 ? '' : row.soNgayO || ''),
  },
  {
    key: 'tongTienPhong',
    style: [styles.cell_align_center, styles.colPrice],
    render: (row) => (Object.keys(row).length === 0 ? '' : formatCurrency(row.tongTienPhong)),
  },
  {
    key: 'tongTienThanhToan',
    style: [styles.cell_align_center, styles.colTotal],
    render: (row) => (Object.keys(row).length === 0 ? '' : formatCurrency(row.tongTienThanhToan)),
  },
  {
    key: 'ghiChu',
    style: [styles.cell, styles.colPeople],

    render: (row) => (Object.keys(row).length === 0 ? '' : row.ghiChu),
  },
]

// Create Document Component
const HotelRegistrationForm = ({ thongTinKhachHang, thongTinThanhToan }) => {
  const tongTienPhong = getTongTienPhong(thongTinThanhToan)
  const tongTienDichVu = getTongTienDichVu(thongTinThanhToan)
  const tongTienPhuThu = getTongTienPhuThu(thongTinThanhToan)
  const tongTienThanhToan = getTongTienThanhToan(thongTinThanhToan)
  const tienCoc = thongTinKhachHang?.tien_coc || 0
  const soTienConLai = tongTienThanhToan - tienCoc

  // Tạo mảng đủ 11 dòng
  const soDongToiDa = 11
  const rowsToRender = Array.from({ length: soDongToiDa }, (_, i) =>
    thongTinThanhToan && thongTinThanhToan[i] ? thongTinThanhToan[i] : {},
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Viền ngoài */}
        <View style={styles.outerBorder} fixed />
        {/* Viền trong */}
        <View style={styles.centerBorder} fixed />
        <View style={styles.innerBorder} fixed />

        <View style={styles.logoContainer}>
          <View style={{ flex: 1.5 }}>
            <Image src={logoImg} />
          </View>

          <View
            style={{ flex: 1, fontFamily: 'Times New Roman', color: '#B8860B', marginLeft: 55 }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 11 }}>NEW BOOKING</Text>
            <Text>BK-ID: {thongTinKhachHang?.ma_booking} </Text>
            <Text>
              Ngày phát hành:{' '}
              {thongTinKhachHang?.ngay_lap
                ? format(parseISO(thongTinKhachHang.ngay_lap), 'HH:mm dd/MM/yyyy')
                : '-'}{' '}
            </Text>
          </View>
        </View>
        <Text style={[styles.title]}>PHIẾU THANH TOÁN</Text>
        <View style={[styles.table, { marginTop: 5, marginBottom: 5 }]}>
          <View style={[styles.tableRow]}>
            <Text
              style={[styles.cell, styles.colPeopleContact, { borderTopWidth: 1, paddingTop: 4 }]}
            >
              Người liên hệ:
            </Text>
            <Text style={[styles.cell, styles.colNote, { borderTopWidth: 1, paddingTop: 4 }]}>
              Mr/Ms/Mss {thongTinKhachHang?.ten}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.colPeopleContact, { color: 'rgb(69,69,69)' }]}>
              Điện thoại:
            </Text>
            <Text style={[styles.cell, styles.colNote, { color: 'rgb(69,69,69)' }]}>
              {thongTinKhachHang?.sdt_booking}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.colPeopleContact, { color: 'rgb(69,69,69)' }]}>
              Email:
            </Text>
            <Text style={[styles.cell, styles.colNote, { color: 'rgb(69,69,69)' }]}>
              {thongTinKhachHang?.email_booking}
            </Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.header]}>
            <View style={[styles.cell_align_center, styles.colTT]}>
              <Text>TT</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colDate]}>
              <Text>Ngày đến</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colDate]}>
              <Text>Ngày đi</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colRoomType]}>
              <Text>Loại phòng</Text>
            </View>

            <View style={[styles.cell_align_center, styles.colNights]}>
              <Text>Số đêm</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colPrice]}>
              <Text>Đơn giá</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colTotal]}>
              <Text>Thành tiền</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colPeople]}>
              <Text>Ghi chú</Text>
            </View>
          </View>

          {rowsToRender.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              {columns.map((col) => (
                <View key={col.key} style={col.style}>
                  <Text>{col.render(row, index)}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Tổng cộng */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Chi phí các dịch vụ phát sinh
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {formatCurrency(tongTienDichVu)}
            </Text>
            <Text
              style={[styles.cell, styles.ghiChu, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            ></Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Tổng tiền phòng
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {formatCurrency(tongTienPhong)}
            </Text>
            <Text
              style={[styles.cell, styles.ghiChu, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            ></Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Tổng tiền phụ thu
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {formatCurrency(tongTienPhuThu)}
            </Text>
            <Text
              style={[styles.cell, styles.ghiChu, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            ></Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Đặt cọc
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {formatCurrency(tienCoc)}
            </Text>
            <Text
              style={[styles.cell, styles.ghiChu, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            ></Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Số tiền phòng còn lại cần thanh toán
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {formatCurrency(soTienConLai)}
            </Text>
            <Text
              style={[styles.cell, styles.ghiChu, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            ></Text>
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={{ fontWeight: 'bold' }}>Người lập phiếu</Text>
          <Text style={{ marginTop: 10 }}>{thongTinKhachHang?.ten_nhan_vien}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text style={{ fontWeight: 'bold' }}>Hoang Kim - Golden Era Vung Tau Hotel </Text>
          <Text>
            03-05 Thuy Van Street, Ward 2, Vung Tau City, Ba Ria - Vung Tau Province, S.R Vietnam{' '}
          </Text>
          <Text>Hotline: 08888.713.92 - 0393.054.272; (Zalo: 08888.713.92) </Text>
          <Text>Website: goldenera.vttu.edu.vn </Text>
        </View>
      </Page>
    </Document>
  )
}

// Định nghĩa kiểu dữ liệu cho props
HotelRegistrationForm.propTypes = {
  thongTinKhachHang: PropTypes.shape({
    ma_booking: PropTypes.string.isRequired,
    ten: PropTypes.string,
    tenkhachhang: PropTypes.string,
    sdt_booking: PropTypes.string,
    ten_nhom_khach_hang: PropTypes.string,
    loai_nguon_khach: PropTypes.string,
    email_booking: PropTypes.string,
    ngay_den: PropTypes.string,
    ngay_di: PropTypes.string,
    tien_coc: PropTypes.number,
    ngay_lap: PropTypes.string,
    ten_nhan_vien: PropTypes.string,
  }).isRequired, // `thongTinKhachHang` là một object

  thongTinThanhToan: PropTypes.arrayOf(
    PropTypes.shape({
      ghiChu: PropTypes.string.isRequired,
      tongTienThanhToan: PropTypes.number.isRequired,
      tongTienPhong: PropTypes.number.isRequired,
      soNgayO: PropTypes.number.isRequired,
      ten_phong: PropTypes.string.isRequired,
      tenLoaiPhong: PropTypes.string.isRequired,
      ngayDen: PropTypes.string.isRequired,
      ngayDi: PropTypes.string.isRequired,
    }),
  ).isRequired,
}

// Example usage in your React app
const XuatPhieuThanhToan = () => {
  const { ma_booking } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [thongTinKhachHang, setThongTinKhachHang] = useState(null)
  const [thongTinThanhToan, setThongTinThanhToan] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [khachHangData, thanhToanData] = await Promise.all([
        AllThongTinKhachHang(ma_booking, navigate),
        getDanhSachHoaDon(ma_booking, navigate),
      ])

      if (khachHangData) {
        setThongTinKhachHang(khachHangData)
      }
      if (thanhToanData) {
        console.log('thanhToanData', thanhToanData)
        setThongTinThanhToan(thanhToanData)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ma_booking) {
      fetchData()
    }
  }, [ma_booking])

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768

  return (
    <div>
      {isMobile ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            marginTop: '20px'
          }}
        >
          <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>Không thể xem trước PDF</h4>
          <p style={{ marginBottom: '10px' }}>
            Trình duyệt trên thiết bị di động hoặc máy tính bảng không hỗ trợ xem trước tệp PDF này.
          </p>
          <p>
            Vui lòng sử dụng máy tính để xem và in phiếu thanh toán.
          </p>
        </div>
      ) : (
        <PDFViewer style={{ width: '100%', height: '700px' }}>
          {thongTinKhachHang && thongTinThanhToan ? (
            <HotelRegistrationForm
              thongTinKhachHang={thongTinKhachHang}
              thongTinThanhToan={thongTinThanhToan}
            />
          ) : (
            <p>Đang tải dữ liệu...</p>
          )}
        </PDFViewer>
      )}
      {/* You can also add a download button that uses ReactPDF.pdf(HotelRegistrationPDFDownload).toBlob().then(...) */}
    </div>
  )
}

export default XuatPhieuThanhToan
