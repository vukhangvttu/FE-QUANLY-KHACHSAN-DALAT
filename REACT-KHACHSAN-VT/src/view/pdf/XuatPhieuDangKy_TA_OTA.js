import React, { useEffect, useState } from 'react'
import { Buffer } from 'buffer'
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer'

import myImage from 'src/assets/images/Picture1.png'
import imageMacDinh from 'src/assets/images/Picture2.png'
import { AllThongTinKhachHang, getThongTinXuatPhieuDangKy } from 'src/service/ThanhToanService'
import { useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { format, parseISO } from 'date-fns'
import { getThongTinXuatPhieuChiTietPhuThuBooking } from 'src/service/APIService'
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
  family: 'VNI-Revue',
  fonts: [
    { src: '/fonts/unicode.revueb.ttf', fontWeight: 'normal' },
    //   { src: '/fonts/VNI-RevueBd.ttf', fontWeight: 'bold' } // Nếu có bản bold
  ],
})
// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 10,
    // fontFamily: 'Helvetica',
  },
  outerBorder: {
    // border: '2 solid #B71C1C',
    // padding: 0.4,

    // width: '100%',
    // height: '100%',
    border: '2 solid #B71C1C',
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
  },
  innerBorder: {
    border: '2 solid #B71C1C',
    width: '100%',
    height: '100%',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 3,
    paddingBottom: 0, // Để sát đáy
    margin: 0,
    boxSizing: 'border-box',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 5,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: '#B8860B',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  companyName: {
    color: '#B8860B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  companyInfo: {
    fontSize: 8,
  },
  idBox: {
    border: '1 solid #B8860B',
    padding: 5,
    width: 170,
    height: 30,
    marginLeft: 1,
  },
  idText: {
    color: '#B8860B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    textAlign: 'center',
    marginBottom: 2,
  },
  titleMain: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'VNI-Revue',
  },
  titleSub: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  formLabel: {
    fontSize: 10,
    fontFamily: 'Times New Roman',
  },
  formLine: {
    borderBottom: '1 dashed #888',
    flex: 1,
    marginHorizontal: 5,
  },

  subHeaderCell: {
    fontSize: 8,
  },
  divider: {
    borderBottom: '1 dotted  #888',
    marginVertical: 7,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: '50%',
  },
  rightSection: {
    width: '50%',
  },
  rulesBox: {
    border: '1 dashed #888',
    padding: 5,
  },
  rulesTitle: {
    textAlign: 'center',
    color: '#B71C1C',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rulesSubtitle: {
    textAlign: 'center',
    color: '#B71C1C',
    fontSize: 8,
    marginBottom: 10,
  },
  rulesInstruction: {
    textAlign: 'center',
    fontSize: 9,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  iconContainer: {
    alignItems: 'center',
    width: '33%',
  },
  noText: {
    color: '#B71C1C',
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 5,
  },
  iconLabel: {
    fontSize: 7,
    textAlign: 'center',
  },
  penaltyText: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 10,
  },
  penaltyAmount: {
    textAlign: 'center',
    color: '#B71C1C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  penaltyNote: {
    textAlign: 'center',
    fontSize: 7,
    fontStyle: 'italic',
  },
  thankYou: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 5,
  },
  signatureSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  signatureTitle: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  signatureSubtext: {
    fontSize: 9,
  },
  signatureNote: {
    fontSize: 8,
    fontStyle: 'italic',
  },
  receptionSection: {
    marginTop: 10,
  },
  receptionTitle: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 5,
  },
  receptionField: {
    fontSize: 9,
    marginBottom: 3,
    fontFamily: 'Times New Roman',
    fontStyle: 'italic',
  },

  imageLogo: {
    width: 200, // Độ rộng ảnh
    // height: 35, // Chiều cao ảnh
  },
  imageContainer: {
    border: '2px dashed gray', // Định dạng viền nét đứt màu đen
    marginTop: '-30',
  },
  imageAnh: {
    // width: 187, // Độ rộng ảnh
    // height: 220, // Chiều cao ảnh
    width: 160,
    height: 200,
    marginBottom: 10, // Khoảng cách giữa ảnh và nội dung khác
  },

  // chia cột
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  column7: {
    width: '70%', // 7/12
    paddingRight: 5,
  },
  column5: {
    width: '30%', // 5/12
  },
  column6: {
    width: '50%', // 7/12
    paddingRight: 2,
  },

  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,

    borderColor: 'black',
  },
  tableRow: {
    flexDirection: 'row',
    fontFamily: 'Times New Roman',
  },
  headerCell: {
    width: '16.66%', // 6 cột = 100%/6 ≈ 16.66%
    padding: 2,
    backgroundColor: '#f2f2f2',
    borderStyle: 'solid',
    borderRightWidth: 1, // Thêm border bên phải
    borderBottomWidth: 1, // Thêm border dưới
    borderColor: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCell: {
    // borderStyle: 'solid',
  },
  headerText: {
    fontSize: 10,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 9,
    family: 'Times New Roman',
    fontStyle: 'italic',

    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    borderBottom: '1px',
  },
  totalCell: {
    width: '16.66%', // 6 cột = 100%/6 ≈ 16.66%
    padding: 2,

    borderStyle: 'solid',
    borderRightWidth: 1, // Thêm border bên phải
    borderBottomWidth: 0, // Thêm border dưới
    borderColor: 'black',
    textAlign: 'center',
  },
  totalText: {
    fontSize: 10,
    fontFamily: 'Times New Roman',
  },
  totalItalicText: {
    fontSize: 10,
    fontFamily: 'Times New Roman',
    fontStyle: 'italic',
  },
  lastCell: {
    width: '16.66%',
    padding: 4,
    borderStyle: 'solid',
    borderBottomWidth: 1, // Chỉ cần border dưới
    borderColor: 'black',
    height: 30,
    textAlign: 'center',
  },
  emptyCell: {
    width: '16.66%', // 6 cột = 100%/6 ≈ 16.66%
    padding: 2,
    fontSize: 9,
    borderStyle: 'solid',
    borderRightWidth: 1, // Thêm border bên phải
    borderBottomWidth: 1, // Thêm border dưới
    borderColor: 'black',
    fontFamily: 'Times New Roman',
    Height: 15, // Đảm bảo đủ chỗ hiển thị chữ
    justifyContent: 'center', // Căn giữa nội dung
    alignItems: 'center', // Căn giữa theo chiều dọc
  },
  emptyCellHangPhong: {
    width: '16.66%', // 6 cột = 100%/6 ≈ 16.66%
    padding: 2,
    fontSize: 9,
    borderStyle: 'solid',
    borderRightWidth: 1, // Thêm border bên phải
    borderBottomWidth: 1, // Thêm border dưới
    borderColor: 'black',
    fontFamily: 'Times New Roman',
    Height: 15, // Đảm bảo đủ chỗ hiển thị chữ
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

// Create Document Component
const HotelRegistrationForm = ({ thongTinKhachHang, thongTinThanhToan, thongTinPhuThu }) => {
  const tongTienPhong = thongTinThanhToan?.reduce((sum, row) => sum + row.tong_tien, 0)

  const tongPhuThuTreEm = thongTinPhuThu?.reduce(
    (sum, row) => sum + (row.tong_tien_phu_thu_tre_em || 0),
    0,
  )
  const tongTienExtra = thongTinPhuThu?.reduce(
    (sum, row) => sum + (row.tong_tien_phu_thu_extra || 0),
    0,
  )
  const tienCoc = thongTinKhachHang?.tien_coc || 0
  const soTienConLai = tongTienPhong + tongPhuThuTreEm + tongTienExtra - tienCoc

  return (
    <Document>
      <Page size="A5" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <View>
                  <Image style={styles.imageLogo} src={myImage} />
                </View>
              </View>
              <View style={styles.idBox}>
                <Text style={styles.idText}>BK-ID: {thongTinKhachHang?.ma_booking}</Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.title}>
              <Text style={styles.titleMain}>ĐĂNG KÝ KHÁCH SẠN</Text>
              <Text style={styles.titleSub}>REGISTRATION FORM</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.column7}>
                <View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>
                      Tên khách/Guest Name: {thongTinKhachHang?.tenkhachhang}
                    </Text>
                    <View style={styles.formLine} />
                    <Text style={styles.formLabel}>
                      Điện thoại/Tel: {thongTinKhachHang?.sdt_booking}
                    </Text>
                    <View style={styles.formLine} />
                  </View>
                  <View style={[styles.formRow, { marginTop: -5 }]}>
                    <Text style={styles.formLabel}>
                      Tên đơn vị/Company: {thongTinKhachHang?.loai_nguon_khach}
                    </Text>
                  </View>
                  <View style={[styles.formRow, { marginTop: -5 }]}>
                    <Text style={styles.formLabel}>
                      Ngày đến/Arrival date:{' '}
                      {thongTinKhachHang.ngay_den
                        ? format(parseISO(thongTinKhachHang.ngay_den), 'dd/MM/yyyy')
                        : 'N/A'}
                    </Text>
                    <View style={styles.formLine} />
                    <Text style={styles.formLabel}>
                      Ngày đi/Departure date:{' '}
                      {thongTinKhachHang.ngay_di
                        ? format(parseISO(thongTinKhachHang.ngay_di), 'dd/MM/yyyy')
                        : 'N/A'}
                    </Text>
                    <View style={styles.formLine} />
                  </View>
                </View>
                <View style={[styles.table, { marginBottom: '2' }]}>
                  {/* Table Header */}
                  <View style={styles.tableRow}>
                    <View style={[styles.headerCell, { width: '39%' }]}>
                      <Text style={styles.headerText}>Hạng phòng</Text>
                      <Text style={styles.subHeaderText}>No of Room</Text>
                    </View>
                    <View style={[styles.headerCell, { width: '6%' }]}>
                      <Text style={styles.headerText}>SL</Text>
                      <Text style={styles.subHeaderText}>Qty</Text>
                    </View>
                    <View style={[styles.headerCell, { width: '8%' }]}>
                      <Text style={styles.headerText}>SĐ</Text>
                      <Text style={styles.subHeaderText}>Night</Text>
                    </View>
                    <View style={[styles.headerCell, { width: '17%' }]}>
                      <Text style={styles.headerText}>Giá/đêm</Text>
                      <Text style={styles.subHeaderText}>Rate Per Night</Text>
                    </View>
                    <View style={[styles.headerCell, { width: '12%' }]}>
                      <Text style={styles.headerText}>Tổng</Text>
                      <Text style={styles.subHeaderText}>Total</Text>
                    </View>
                    <View style={[styles.headerCell, { width: '19%' }]}>
                      <Text style={styles.headerText}>Tên phòng</Text>
                      <Text style={styles.subHeaderText}>Note</Text>
                    </View>
                  </View>

                  {thongTinThanhToan?.length > 0 ? (
                    thongTinThanhToan.map((row, index) => (
                      <View key={index} style={styles.tableRow}>
                        <View style={[styles.emptyCellHangPhong, { width: '39%' }]}>
                          <Text>{row.ten_loai_phong}</Text>
                        </View>
                        <View style={[styles.emptyCell, { width: '6%' }]}>
                          <Text>{row.so_luong_dat_phong}</Text>
                        </View>
                        <View style={[styles.emptyCell, { width: '8%' }]}>
                          <Text>{row.so_dem}</Text>
                        </View>
                        <View style={[styles.emptyCell, { width: '17%' }]}>
                          <Text>{''}</Text>
                        </View>
                        <View style={[styles.emptyCell, { width: '12%' }]}>
                          <Text>{''}</Text>
                        </View>
                        <View style={[styles.emptyCell, { width: '19%' }]}>
                          <Text>{row.ten_phong}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.headerText}>Không có data</Text>
                  )}
                  {/* Total row */}
                  <View style={styles.totalRow}>
                    <View
                      style={[
                        styles.totalCell,
                        {
                          width: '70%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text style={styles.totalText}>Tổng cộng/</Text>
                      <Text style={styles.totalItalicText}>Total all items</Text>
                    </View>

                    <View
                      style={[
                        styles.tableCell,
                        {
                          width: '12%',
                          borderRightWidth: '1',
                          fontSize: 9,
                          padding: 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontFamily: 'Times New Roman',
                        },
                      ]}
                    >
                      {/* <Text>{formatCurrency(tongTienPhong)}</Text> */}
                      <Text>{''}</Text>
                    </View>

                    <View
                      style={[styles.tableCell, { width: '19%', borderRightWidth: '1' }]}
                    ></View>
                  </View>

                  {/* Tổng phụ thu */}

                  {/* Đặt cọc  */}
                  <View style={styles.totalRow}>
                    <View
                      style={[
                        styles.totalCell,
                        {
                          width: '70%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text style={styles.totalText}>Đặt cọc/</Text>
                      <Text style={styles.totalItalicText}>(Deposit)</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        {
                          width: '12%',
                          borderRightWidth: '1',
                          fontSize: 9,
                          padding: 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontFamily: 'Times New Roman',
                        },
                      ]}
                    >
                      {/* <Text>{formatCurrency(tienCoc)}</Text> */}
                      <Text>{''}</Text>
                    </View>

                    <View
                      style={[styles.tableCell, { width: '19%', borderRightWidth: '1' }]}
                    ></View>
                  </View>
                  {/* Thanh toán */}
                  <View style={{ flexDirection: 'row' }}>
                    <View
                      style={[
                        styles.totalCell,
                        {
                          width: '70%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      ]}
                    >
                      <Text style={styles.totalText}> Thanh toán/</Text>
                      <Text style={styles.totalItalicText}>(Payment)</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        {
                          width: '12%',
                          borderRightWidth: '1',
                          fontSize: 9,
                          padding: 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontFamily: 'Times New Roman',
                        },
                      ]}
                    >
                      {/* <Text>{formatCurrency(soTienConLai)}</Text> */}
                      <Text>{''}</Text>
                    </View>

                    <View
                      style={[styles.tableCell, { width: '19%', borderRightWidth: '1' }]}
                    ></View>
                  </View>
                </View>
                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                  {/* Left side */}

                  <View>
                    <Text
                      style={{
                        fontFamily: 'Times New Roman',
                        fontWeight: 'bold',
                        fontSize: 11,
                      }}
                    >
                      Reception
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.receptionField}>
                        Folios: .............................
                      </Text>
                      <Text style={styles.receptionField}>
                        Check in: ...........................
                      </Text>
                      <Text style={styles.receptionField}>
                        Check out: ..........................
                      </Text>
                    </View>
                  </View>

                  {/* Right side - Rules */}
                </View>
              </View>
              <View style={[styles.column5]}>
                <View style={styles.imageContainer}>
                  <Image style={styles.imageAnh} src={imageMacDinh} />
                </View>

                <View style={{ marginLeft: '31px' }}>
                  <Text
                    style={{
                      fontFamily: 'Times New Roman',
                      paddingLeft: 15,
                      fontSize: 11,
                    }}
                  >
                    <Text>Khách hàng/</Text>
                    <Text>Guest </Text>
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Times New Roman',
                      fontStyle: 'italic',
                      fontSize: 11,
                      paddingLeft: -15,
                    }}
                  >
                    Guest’s Signature & Full name
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Times New Roman',

                      fontSize: 11,
                    }}
                  >
                    {' '}
                    (Tôi đã đọc và hiểu rõ)
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// Định nghĩa kiểu dữ liệu cho props
HotelRegistrationForm.propTypes = {
  thongTinKhachHang: PropTypes.shape({
    ma_booking: PropTypes.string.isRequired,
    tenkhachhang: PropTypes.string,
    sdt_booking: PropTypes.string,
    ten_nhom_khach_hang: PropTypes.string,
    loai_nguon_khach: PropTypes.string,
    email_booking: PropTypes.string,
    ngay_den: PropTypes.string,
    ngay_di: PropTypes.string,
    tien_coc: PropTypes.number,
  }).isRequired, // `thongTinKhachHang` là một object

  thongTinThanhToan: PropTypes.arrayOf(
    PropTypes.shape({
      gia: PropTypes.number.isRequired,
      tong_tien: PropTypes.number.isRequired,
      so_luong_dat_phong: PropTypes.number.isRequired,
      so_dem: PropTypes.number.isRequired,
      ten_phong: PropTypes.string.isRequired,
      ten_loai_phong: PropTypes.string.isRequired,
    }),
  ).isRequired,
  thongTinPhuThu: PropTypes.arrayOf(
    PropTypes.shape({
      tong_tien_phu_thu_extra: PropTypes.number.isRequired,
      tong_tien_phu_thu_tre_em: PropTypes.number.isRequired,
    }),
  ).isRequired,
}
// Create PDF Viewer Component

// Example usage in your React app
const App = () => {
  const { ma_booking } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [thongTinKhachHang, setThongTinKhachHang] = useState(null)
  const [thongTinThanhToan, setThongTinThanhToan] = useState(null)
  const [thongTinPhuThu, setThongTinPhuThu] = useState(null)
  const fetchData = async () => {
    try {
      setLoading(true)
      const [khachHangData, thanhToanData, phuThuData] = await Promise.all([
        AllThongTinKhachHang(ma_booking, navigate),
        getThongTinXuatPhieuDangKy(ma_booking, navigate),
        getThongTinXuatPhieuChiTietPhuThuBooking(ma_booking),
      ])

      if (khachHangData) {
        console.log('khachHangData', khachHangData)
        setThongTinKhachHang(khachHangData)
      }
      if (thanhToanData) {
        console.log('thanhToanData', thanhToanData)
        setThongTinThanhToan(thanhToanData)
      }
      if (phuThuData) {
        console.log('phuThuData', phuThuData)
        setThongTinPhuThu(phuThuData)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  console.log('thongTinKhachHang', thongTinKhachHang)

  useEffect(() => {
    if (ma_booking) {
      fetchData()
    }
  }, [ma_booking])

  return (
    <div>
      <PDFViewer style={{ width: '100%', height: '700px' }}>
        {thongTinKhachHang && thongTinThanhToan ? (
          <HotelRegistrationForm
            thongTinKhachHang={thongTinKhachHang}
            thongTinThanhToan={thongTinThanhToan}
            thongTinPhuThu={thongTinPhuThu}
          />
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </PDFViewer>
      {/* You can also add a download button that uses ReactPDF.pdf(HotelRegistrationPDFDownload).toBlob().then(...) */}
    </div>
  )
}

export default App
