import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Buffer } from 'buffer'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
  pdf,
} from '@react-pdf/renderer'
import { AllThongTinKhachHang } from 'src/service/ThanhToanService'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
// import logoImg from 'src/assets/images/Picture1.png'
import contactImg from 'src/assets/images/contact.png'
import { format, parseISO } from 'date-fns'

import logoImgDaLat from 'src/assets/images/logo-ge-da-lat.png'
import logoImgVungTau from 'src/assets/images/logo-ge-vung-tau.png'

import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
import {
  getThongTinXuatPhieuChiTietBooking,
  getThongTinXuatPhieuChiTietPhuThuBooking,
} from 'src/service/APIService'
import SignaturePad from 'src/components/SignaturePad'
import { faCircleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const viTri = window._env_?.VI_TRI || 'DALAT'
const logoImg = viTri === 'VUNGTAU' ? logoImgVungTau : logoImgDaLat
window.Buffer = Buffer
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
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
              Mr/Ms/Mss {thongTinKhachHang?.ten || thongTinKhachHang?.tenkhachhang || ''}
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
            {/* <Text
              style={[
                styles.cell,
                styles.colTotalMoneyRoom,
                { borderBottomWidth: 1, borderRightWidth: 1 },
              ]}
            >
              Tổng phụ thu gala dinner
            </Text>
            <Text
              style={[styles.cell, styles.colLast, { borderBottomWidth: 1, borderRightWidth: 1 }]}
            >
               {formatCurrency(23560000)} 
            </Text> */}
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

        {
          viTri === 'DALAT' && (
            <>
              <View style={styles.contactInfo}>
                <Text style={{ fontWeight: 'bold' }}>DƯƠNG HOÀNG - GOLDEN ERA ĐÀ LẠT Hotel </Text>
                <Text>10 Bùi Thị Xuân, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng </Text>
                <Text>Hotline: 02633.551.551; (Zalo: 0914.581.551 ) </Text>
                <Text>Website: goldenera.vttu.edu.vn </Text>
              </View>
            </>
          )
        }

        {viTri === 'VUNGTAU' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={[styles.contactInfo, { flex: 1 }]}>
              <Text style={{ fontWeight: 'bold' }}>DƯƠNG HOÀNG - GOLDEN ERA VŨNG TÀU Hotel </Text>
              <Text>03-05 Thuy Van Street, Vung Tau Ward , Ho Chi Minh City, S.R Vietnam</Text>
              <Text>Hotline: 08888.713.92 - 0393.054.272; (Zalo: 08888.713.92) </Text>
              <Text>Website: goldenera.vttu.edu.vn </Text>
            </View>
            <View style={{ width: 80, height: 80 }}>
              <Image
                src={`https://img.vietqr.io/image/970436-3366696969-compact.png?amount=${Math.round(soTienConLai * 0.5)}&addInfo=${encodeURIComponent(`Thanh toan booking ${thongTinKhachHang?.ma_booking || ''}`)}&accountName=${encodeURIComponent('CTY TRACH NHIEM HUU HAN HOANG KIM-DOLDEN')}`}
              />
            </View>
          </View>
        )}

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
  const [downloading, setDownloading] = useState(false)
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

  const [previewImageUrl, setPreviewImageUrl] = useState(null)
  const [generatingPreview, setGeneratingPreview] = useState(false)
  const originalPreviewRef = useRef(null)

  const handleDownloadImage = useCallback(async () => {
    if (!thongTinKhachHang || !thongTinThanhToan) return

    // Nếu đã có ảnh xem trước (bao gồm cả chữ ký trên mobile), tải luôn ảnh đó
    if (previewImageUrl) {
      const link = document.createElement('a')
      link.download = `PhieuDangKy_${thongTinKhachHang.ma_booking}.png`
      link.href = previewImageUrl
      link.click()
      return
    }

    setDownloading(true)
    try {
      const blob = await pdf(
        <HotelRegistrationForm
          thongTinKhachHang={thongTinKhachHang}
          thongTinThanhToan={thongTinThanhToan}
          thongTinPhuThu={thongTinPhuThu}
        />,
      ).toBlob()

      const arrayBuffer = await blob.arrayBuffer()
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const scale = 3

      if (pdfDoc.numPages === 1) {
        const page = await pdfDoc.getPage(1)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise

        const link = document.createElement('a')
        link.download = `ChiTietDatPhong_${thongTinKhachHang.ma_booking}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        let totalHeight = 0
        let maxWidth = 0

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale })
          totalHeight += viewport.height
          if (viewport.width > maxWidth) {
            maxWidth = viewport.width
          }
        }

        const bigCanvas = document.createElement('canvas')
        bigCanvas.width = maxWidth
        bigCanvas.height = totalHeight
        const bigCtx = bigCanvas.getContext('2d')

        let currentY = 0
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale })
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = viewport.width
          pageCanvas.height = viewport.height
          const pageCtx = pageCanvas.getContext('2d')

          await page.render({ canvasContext: pageCtx, viewport }).promise
          bigCtx.drawImage(pageCanvas, 0, currentY)
          currentY += pageCanvas.height
        }

        const link = document.createElement('a')
        link.download = `ChiTietDatPhong_${thongTinKhachHang.ma_booking}_all.png`
        link.href = bigCanvas.toDataURL('image/png')
        link.click()
      }
    } catch (error) {
      console.error('Lỗi khi tải ảnh:', error)
    } finally {
    }
  }, [thongTinKhachHang, thongTinThanhToan, thongTinPhuThu, previewImageUrl])


  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768

  useEffect(() => {
    if (isMobile && thongTinKhachHang && thongTinThanhToan) {
      const generatePreview = async () => {
        setGeneratingPreview(true)
        try {
          const blob = await pdf(
            <HotelRegistrationForm
              thongTinKhachHang={thongTinKhachHang}
              thongTinThanhToan={thongTinThanhToan}
              thongTinPhuThu={thongTinPhuThu}
            />,
          ).toBlob()

          const arrayBuffer = await blob.arrayBuffer()
          const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          const scale = 2

          if (pdfDoc.numPages === 1) {
            const page = await pdfDoc.getPage(1)
            const viewport = page.getViewport({ scale })
            const canvas = document.createElement('canvas')
            canvas.width = viewport.width
            canvas.height = viewport.height
            const ctx = canvas.getContext('2d')
            await page.render({ canvasContext: ctx, viewport }).promise
            setPreviewImageUrl(canvas.toDataURL('image/png'))
          } else {
            let totalHeight = 0
            let maxWidth = 0
            for (let i = 1; i <= pdfDoc.numPages; i++) {
              const page = await pdfDoc.getPage(i)
              const viewport = page.getViewport({ scale })
              totalHeight += viewport.height
              if (viewport.width > maxWidth) {
                maxWidth = viewport.width
              }
            }

            const bigCanvas = document.createElement('canvas')
            bigCanvas.width = maxWidth
            bigCanvas.height = totalHeight
            const bigCtx = bigCanvas.getContext('2d')

            let currentY = 0
            for (let i = 1; i <= pdfDoc.numPages; i++) {
              const page = await pdfDoc.getPage(i)
              const viewport = page.getViewport({ scale })
              const pageCanvas = document.createElement('canvas')
              pageCanvas.width = viewport.width
              pageCanvas.height = viewport.height
              const pageCtx = pageCanvas.getContext('2d')

              await page.render({ canvasContext: pageCtx, viewport }).promise
              bigCtx.drawImage(pageCanvas, 0, currentY)
              currentY += pageCanvas.height
            }
            setPreviewImageUrl(bigCanvas.toDataURL('image/png'))
          }
        } catch (error) {
          console.error('Lỗi khi tạo ảnh xem trước:', error)
        } finally {
          setGeneratingPreview(false)
        }
      }
      generatePreview()
    }
  }, [isMobile, thongTinKhachHang, thongTinThanhToan, thongTinPhuThu])

  // Composite chữ ký vào khung "Khách hàng/Guest" trên ảnh xem trước
  const handleSignatureConfirm = useCallback(
    (signatureDataUrl) => {
      if (!previewImageUrl) return

      const previewImg = new window.Image()
      previewImg.onload = () => {
        const w = previewImg.width
        const h = previewImg.height

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(previewImg, 0, 0)

        // PDF A5 landscape – column5 (30% bên phải), imageContainer: 160×200pt
        const sigBoxX = w * 0.715
        const sigBoxY = h * 0.10
        const sigBoxW = w * 0.270
        const sigBoxH = h * 0.476

        const sigImg = new window.Image()
        sigImg.onload = () => {
          const padding = 8
          const availW = sigBoxW - padding * 2
          const availH = sigBoxH - padding * 2
          const scale = Math.min(availW / sigImg.width, availH / sigImg.height) * 0.6
          const drawW = sigImg.width * scale
          const drawH = sigImg.height * scale
          const drawX = sigBoxX + padding + (availW - drawW) / 2
          const drawY = sigBoxY + padding + (availH - drawH) / 3
          ctx.drawImage(sigImg, drawX, drawY, drawW, drawH)
          setPreviewImageUrl(canvas.toDataURL('image/png'))
        }
        sigImg.src = signatureDataUrl
      }
      previewImg.src = previewImageUrl
    },
    [previewImageUrl],
  )

  return (
    <div className="w-full flex flex-col items-center" style={{ height: '90vh' }}>
      <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
        <button
          onClick={handleDownloadImage}
          disabled={downloading || !thongTinKhachHang || !thongTinThanhToan}
          style={{
            padding: '8px 16px',
            backgroundColor: downloading ? '#ccc' : '#198754',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: downloading ? 'not-allowed' : 'pointer',
            fontSize: 14,
          }}
        >
          {downloading ? 'Đang tải...' : <><FontAwesomeIcon icon={faCircleDown} /> Tải ảnh PNG</>}
        </button>
      </div>
      <div className="w-full flex justify-center items-center" style={{ flex: 1 }}>
        {isMobile ? (
          <div style={{ marginTop: '20px', textAlign: 'center', width: '90%' }}>
            {generatingPreview ? (
              <div style={{ padding: '40px', color: '#666' }}>
                <p>Đang tải ảnh xem trước...</p>
              </div>
            ) : previewImageUrl ? (
              <>
                <img
                  src={previewImageUrl}
                  alt="Preview PDF"
                  style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <SignaturePad onSave={handleSignatureConfirm} />
              </>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>Không thể xem trước PDF</h4>
                <p style={{ marginBottom: '10px' }}>
                  Trình duyệt trên thiết bị di động hoặc máy tính bảng không hỗ trợ xem trước tệp PDF này.
                </p>
                <p>
                  Vui lòng nhấn nút <strong>Tải ảnh PNG</strong> ở trên để tải về.
                </p>
              </div>
            )}
          </div>
        ) : (
          <PDFViewer style={{ width: '99%', height: '900px' }}>
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
        )}
      </div>
    </div>
  )
}

ChiTietDatPhong.propTypes = {
  maBookingProp: PropTypes.string,
}

export default ChiTietDatPhong
