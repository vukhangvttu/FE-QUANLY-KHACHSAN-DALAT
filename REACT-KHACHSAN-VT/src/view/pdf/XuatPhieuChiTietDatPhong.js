import React, { useEffect, useState } from 'react'
import { Buffer } from 'buffer'
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer'
import { AllThongTinKhachHang } from 'src/service/ThanhToanService'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
// import logoImg from 'src/assets/images/Picture1.png'
import contactImg from 'src/assets/images/contact.png'
import { format, parseISO } from 'date-fns'

import logoImg from 'src/assets/images/logovaddresmoi.jpg.png'

import {
  getThongTinXuatPhieuChiTietBooking,
  getThongTinXuatPhieuChiTietPhuThuBooking,
} from 'src/service/APIService'
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
    // borderTopWidth: 1,
    // borderLeftWidth: 1,
    borderColor: 'black',
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
    borderRightWidth: 1,
    borderBottomWidth: 1,

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
    width: 20,
    textAlign: 'center',
    borderLeftWidth: 1,
    // height: 33,
    borderBottomWidth: 1,
    borderRightWidth: 1,

    paddingLeft: 0,
    paddingRight: 0,
  },
  colDate: { width: 60, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colRoomType: {
    width: 110,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
    wordBreak: 'break-word',
    // flexWrap: 'wrap',
    minHeight: 33,
  },
  colPeople: { width: 150, borderBottomWidth: 1, borderRightWidth: 1 },
  colNights: { width: 15, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colPrice: { width: 50, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colTotal: { width: 70, textAlign: 'center', borderBottomWidth: 1, borderRightWidth: 1 },
  colTotalMoneyRoom: {
    width: 480,
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: 'rgb(244,244,244)',
    borderLeftWidth: 1,
  },
  colLast: { width: 70, textAlign: 'center' },
  contactInfo: {
    fontSize: 11,
    fontFamily: 'Times New Roman',
    color: '#B8860B',
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
  return data.reduce((sum, row) => {
    // Chỉ tính tổng tiền phòng khi ghi_chu === "Đặt phòng"
    if (row.ghi_chu === 'Đặt phòng') {
      return sum + (row.tong_tien || 0)
    }
    return sum
  }, 0)
}

const getTongTienPhuThu = (data, dataPhuThu) => {
  if (!Array.isArray(data)) return 0

  // Tính tổng phụ thu từ data (thongTinThanhToan)
  const tongPhuThuTuData = data.reduce((sum, row) => {
    if (row.ghi_chu !== 'Đặt phòng') {
      return sum + (row.tong_tien || 0)
    }
    return sum
  }, 0)

  // Tính tổng phụ thu từ dataPhuThu (thongTinPhuThu)
  const tongPhuThuTuDataPhuThu = Array.isArray(dataPhuThu)
    ? dataPhuThu.reduce(
        (sum, row) =>
          sum +
          (row.tong_tien || 0) +
          (row.gia_phu_thu_an_sang || 0) * row.so_luong_phu_thu_an_sang * (row.so_dem || 1),
        0,
      )
    : 0

  // Trả về tổng của cả hai
  return tongPhuThuTuData + tongPhuThuTuDataPhuThu
}
// Định nghĩa cấu hình các cột cho bảng
const columns = [
  {
    key: 'index',
    style: [styles.cell_align_center, styles.colTT],
    render: (row, i) => (Object.keys(row).length === 0 ? '' : i + 1),
  },
  {
    key: 'ngay_den',
    style: [styles.cell_align_center, styles.colDate],
    render: (row) => (row?.ngay_den ? format(parseISO(row.ngay_den), 'dd/MM/yyyy') : '' || ''),
  },
  {
    key: 'ngay_di',
    style: [styles.cell_align_center, styles.colDate],
    render: (row) => (row?.ngay_di ? format(parseISO(row.ngay_di), 'dd/MM/yyyy') : '' || ''),
  },
  {
    key: 'ten_loai_phong',
    style: [styles.cell_align_center, styles.colRoomType],
    render: (row, i) => (Object.keys(row).length === 0 ? '' : row.ten_loai_phong || ''),
  },
  {
    key: 'so_nguoi',
    style: [styles.cell, styles.colPeople],
    render: (row) => {
      if (Object.keys(row).length === 0) return ''

      let content = ''

      // Chỉ hiển thị thông tin người lớn và trẻ em khi ghi_chu === "Đặt phòng"
      if (row.ghi_chu === 'Đặt phòng') {
        content = `Người lớn: ${row.so_nguoi_lon ?? 0}\nTrẻ em (0-5 tuổi): ${row.so_tre_em ?? 0}`
      }

      // Bổ sung thông tin phụ thu extra bed (chỉ hiển thị khi ghi_chu !== "Đặt phòng")
      if (row.so_luong_extra_bed > 0 && row.ghi_chu !== 'Đặt phòng') {
        const tongTienExtraBed = (row.gia_extra || 0) * row.so_luong_extra_bed
        content += `Phụ thu extra bed ${row.so_luong_extra_bed} giường\n ${formatCurrency(
          row.gia_extra,
        )} x ${row.so_luong_extra_bed} = ${formatCurrency(tongTienExtraBed)}`
      }

      // Bổ sung thông tin phụ thu người lớn (chỉ hiển thị khi ghi_chu !== "Đặt phòng")
      if (row.so_luong_phu_thu_nguoi_lon > 0 && row.ghi_chu !== 'Đặt phòng') {
        const tongTienPhuThuNguoiLon =
          (row.gia_phu_thu_nguoi_lon || 0) * row.so_luong_phu_thu_nguoi_lon
        content += `Phụ thu ${row.so_luong_phu_thu_nguoi_lon} người lớn\n ${formatCurrency(
          row.gia_phu_thu_nguoi_lon,
        )} x ${row.so_luong_phu_thu_nguoi_lon} = ${formatCurrency(tongTienPhuThuNguoiLon)}`
      }

      if (row.so_luong_phu_thu_an_sang > 0 && row.ghi_chu !== 'Đặt phòng') {
        const tongTienPhuThuAnSang = (row.gia_phu_thu_an_sang || 0) * row.so_luong_phu_thu_an_sang
        content += `Phụ thu ăn sáng ${row.so_luong_phu_thu_an_sang} người\n ${formatCurrency(
          tongTienPhuThuAnSang,
        )} đ\n`
      }

      // Bổ sung thông tin phụ thu trẻ em (chỉ hiển thị khi ghi_chu !== "Đặt phòng")
      if (row.so_luong_phu_thu_tre_em > 0 && row.ghi_chu !== 'Đặt phòng') {
        const tongTienPhuThuTreEm = (row.gia_phu_thu_tre_em || 0) * row.so_luong_phu_thu_tre_em
        content += `Phụ thu ${row.so_luong_phu_thu_tre_em} trẻ em\n ${formatCurrency(
          row.gia_phu_thu_tre_em,
        )} x ${row.so_luong_phu_thu_tre_em} = ${formatCurrency(tongTienPhuThuTreEm)} đ`
      }

      return content
    },
  },
  {
    key: 'so_luong_dat_phong',
    style: [styles.cell_align_center, styles.colNights],
    render: (row) => (Object.keys(row).length === 0 ? '' : row.so_luong_dat_phong || '0'),
  },
  {
    key: 'so_dem',
    style: [styles.cell_align_center, styles.colNights],
    render: (row) => (Object.keys(row).length === 0 ? '' : row.so_dem || '0'),
  },
  // {
  //   key: 'so_luong_dat_phong',
  //   style: [styles.cell_align_center, styles.colNights],
  //   render: (row) => (Object.keys(row).length === 0 ? '' : row.so_luong_dat_phong || ''),
  // },
  {
    key: 'gia',
    style: [styles.cell_align_center, styles.colPrice],
    render: (row) => {
      if (Object.keys(row).length === 0) return ''

      // Kiểm tra nếu có bất kỳ phụ thu nào, tính tổng tất cả các phụ thu
      if (
        row.so_luong_phu_thu_an_sang > 0 ||
        row.so_luong_phu_thu_tre_em > 0 ||
        row.so_luong_extra_bed > 0
      ) {
        let tongGiaPhuThu = 0
        
        // Cộng phụ thu ăn sáng
        if (row.so_luong_phu_thu_an_sang > 0) {
          tongGiaPhuThu += (row.gia_phu_thu_an_sang || 0) * row.so_luong_phu_thu_an_sang
        }
        
        // Cộng phụ thu trẻ em
        if (row.so_luong_phu_thu_tre_em > 0) {
          tongGiaPhuThu += (row.gia_phu_thu_tre_em || 0) * row.so_luong_phu_thu_tre_em
        }
        
        // Cộng phụ thu extra bed
        if (row.so_luong_extra_bed > 0) {
          tongGiaPhuThu += (row.gia_extra_bed || 0) * row.so_luong_extra_bed
        }
        
        return formatCurrency(tongGiaPhuThu)
      }

      return formatCurrency(row.gia)
    },
  },
  {
    key: 'tong_tien',
    style: [styles.cell_align_center, styles.colTotal],
    render: (row) => {
      if (Object.keys(row).length === 0) return ''

      // Kiểm tra nếu có bất kỳ phụ thu nào, tính tổng tất cả các phụ thu nhân với số đêm
      if (
        row.so_luong_phu_thu_an_sang > 0 ||
        row.so_luong_phu_thu_tre_em > 0 ||
        row.so_luong_extra_bed > 0
      ) {
        let tongTienPhuThu = 0
        
        // Cộng phụ thu ăn sáng
        if (row.so_luong_phu_thu_an_sang > 0) {
          tongTienPhuThu += (row.gia_phu_thu_an_sang || 0) * row.so_luong_phu_thu_an_sang * (row.so_dem || 1)
        }
        
        // Cộng phụ thu trẻ em
        if (row.so_luong_phu_thu_tre_em > 0) {
          tongTienPhuThu += (row.gia_phu_thu_tre_em || 0) * row.so_luong_phu_thu_tre_em * (row.so_dem || 1)
        }
        
        // Cộng phụ thu extra bed
        if (row.so_luong_extra_bed > 0) {
          tongTienPhuThu += (row.gia_extra_bed || 0) * row.so_luong_extra_bed * (row.so_dem || 1)
        }
        
        return formatCurrency(tongTienPhuThu)
      }

      return formatCurrency(row.tong_tien)
    },
  },
]

// Create Document Component
const HotelRegistrationForm = ({ thongTinKhachHang, thongTinThanhToan, thongTinPhuThu }) => {
  const tongTienPhong = getTongTienPhong(thongTinThanhToan)
  // const tongPhuThuTreEm = thongTinPhuThu?.reduce(
  //   (sum, row) => sum + (row.tong_tien_phu_thu_tre_em || 0),
  //   0,
  // )
  // const tongTienExtra = thongTinPhuThu?.reduce(
  //   (sum, row) => sum + (row.tong_tien_phu_thu_extra || 0),
  //   0,
  // )

  const tongTienPhuThu = getTongTienPhuThu(thongTinThanhToan, thongTinPhuThu)

  const tienCoc = thongTinKhachHang?.tien_coc || 0
  const soTienConLai = tongTienPhong + tongTienPhuThu - tienCoc

  // Tạo mảng kết hợp thongTinThanhToan và thongTinPhuThu
  const soDongToiDa = 9

  // Tạo mảng dữ liệu kết hợp
  const combinedData = []

  // Thêm dữ liệu thanh toán
  if (thongTinThanhToan && thongTinThanhToan.length > 0) {
    combinedData.push(...thongTinThanhToan)
  }

  // Thêm dữ liệu phụ thu - mỗi bản ghi chỉ thêm 1 lần
  if (thongTinPhuThu && thongTinPhuThu.length > 0) {
    thongTinPhuThu.forEach((phuThu) => {
      // Chỉ thêm 1 dòng duy nhất cho mỗi phụ thu
      if (
        phuThu.so_luong_phu_thu_tre_em > 0 ||
        phuThu.so_luong_phu_thu_an_sang > 0 ||
        phuThu.so_luong_extra_bed > 0
      ) {
        combinedData.push(phuThu)
      }
    })
  }

  // Tạo mảng đủ 9 dòng từ dữ liệu kết hợp
  const rowsToRender = Array.from({ length: soDongToiDa }, (_, i) => combinedData[i] || {})

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
              {thongTinKhachHang?.thoi_gian_tao
                ? format(parseISO(thongTinKhachHang.thoi_gian_tao), 'HH:mm dd/MM/yyyy')
                : '-'}{' '}
            </Text>
          </View>
        </View>
        <Text style={[styles.title]}>CHI TIẾT ĐẶT PHÒNG</Text>
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
            <View style={[styles.cell_align_center, styles.colPeople]}>
              <Text>Số lượng người/phòng</Text>
            </View>
               <View style={[styles.cell_align_center, styles.colNights]}>
              <Text>SL</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colNights]}>
              <Text>SĐ</Text>
            </View>
            {/* <View style={[styles.cell_align_center, styles.colNights]}>
              <Text>SL</Text>
            </View> */}
            <View style={[styles.cell_align_center, styles.colPrice]}>
              <Text>Đơn giá</Text>
            </View>
            <View style={[styles.cell_align_center, styles.colTotal]}>
              <Text>Thành tiền</Text>
            </View>
          </View>

          {console.log('rowsToRender', rowsToRender)}

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
              Tổng tiền phòng
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {formatCurrency(tongTienPhong)}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Tổng phụ thu
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
              {/* {formatCurrency(tongPhuThuTreEm + tongTienExtra)} */}
              {formatCurrency(tongTienPhuThu)}
            </Text>
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
          </View>
        </View>

        <Image
          src={contactImg}
          style={{ width: '100%', marginBottom: 5, height: '140px', marginTop: 5 }}
        />
        <View style={styles.contactInfo}>
          <Text style={{ fontWeight: 'bold' }}>Hoang Kim - Golden Era Vung Tau Hotel </Text>
          <Text>03-05 Thuy Van Street, Vung Tau Ward , Ho Chi Minh City, S.R Vietnam </Text>
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
    thoi_gian_tao: PropTypes.string,
  }).isRequired, // `thongTinKhachHang` là một object

  thongTinThanhToan: PropTypes.arrayOf(
    PropTypes.shape({
      gia: PropTypes.number.isRequired,
      tong_tien: PropTypes.number.isRequired,
      so_luong_dat_phong: PropTypes.number.isRequired,
      so_dem: PropTypes.number.isRequired,
      ten_phong: PropTypes.string.isRequired,
      ten_loai_phong: PropTypes.string.isRequired,
      so_nguoi_lon: PropTypes.number.isRequired,
      so_tre_em: PropTypes.number.isRequired,
      ngay_den: PropTypes.string.isRequired,
      ngay_di: PropTypes.string.isRequired,
    }),
  ).isRequired,
  thongTinPhuThu: PropTypes.arrayOf(
    PropTypes.shape({
      gia_phu_thu_tre_em: PropTypes.number,
      ten_loai_phong: PropTypes.string,
      ngay_den: PropTypes.string,
      tong_tien_phu_thu_extra: PropTypes.number,
      gia_extra_bed: PropTypes.number,
      tong_tien_phu_thu_tre_em: PropTypes.number,
      so_luong_extra_bed: PropTypes.number,
      so_luong_phu_thu_tre_em: PropTypes.number,
      so_luong_phu_thu_an_sang: PropTypes.number,
      gia_phu_thu_an_sang: PropTypes.number,
      ngay_di: PropTypes.string,
      so_dem: PropTypes.number,
    }),
  ),
}

// Example usage in your React app
const ChiTietDatPhong = ({ maBookingProp }) => {
  const { ma_booking: ma_booking_param } = useParams()
  const ma_booking = maBookingProp || ma_booking_param

  const [loading, setLoading] = useState(false)
  const [thongTinKhachHang, setThongTinKhachHang] = useState(null)
  const [thongTinThanhToan, setThongTinThanhToan] = useState(null)
  const [thongTinPhuThu, setThongTinPhuThu] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [khachHangData, thanhToanData, phuThuData] = await Promise.all([
        AllThongTinKhachHang(ma_booking),
        getThongTinXuatPhieuChiTietBooking(ma_booking),
        getThongTinXuatPhieuChiTietPhuThuBooking(ma_booking),
      ])

      if (khachHangData) {
        setThongTinKhachHang(khachHangData)
      }
      if (thanhToanData) {
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

  useEffect(() => {
    if (ma_booking) {
      fetchData()
    }
  }, [ma_booking])

  return (
    <div className="w-full flex justify-center items-center" style={{ height: '90vh' }}>
      <PDFViewer style={{ width: '60vh', height: '90vh' }}>
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

ChiTietDatPhong.propTypes = {
  maBookingProp: PropTypes.string,
}

export default ChiTietDatPhong
