import React from 'react'
import PropTypes from 'prop-types'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'

const InHoaDon = ({ hoaDon }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-4 print:p-0 print-content" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">HÓA ĐƠN THANH TOÁN</h1>
        <p className="text-sm">Mã hóa đơn: {hoaDon.maHoaDonBanLe}</p>
        <p className="text-sm">Ngày: {formatDate(hoaDon.ngayLap)}</p>
      </div>

      <div className="mb-4">
        <p className="font-bold">Khách hàng: Khách lẻ</p>
        <p>Phương thức thanh toán: {hoaDon.hinhThucThanhToan.tenHinhThucThanhToan}</p>
      </div>

      <CTable align="middle" responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>STT</CTableHeaderCell>
            <CTableHeaderCell>Tên dịch vụ</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Số lượng</CTableHeaderCell>
            <CTableHeaderCell>Đơn giá</CTableHeaderCell>
            <CTableHeaderCell>Thành tiền</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {hoaDon.chiTietHoaDonBanLe.map((chitiet, index) => (
            <CTableRow key={chitiet.maChiTietHoaDon}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              <CTableDataCell>{chitiet.dichvu.tenDichVu}</CTableDataCell>
              <CTableDataCell className="text-center">{chitiet.soLuong}</CTableDataCell>
              <CTableDataCell>{formatCurrency(chitiet.donGia)}</CTableDataCell>
              <CTableDataCell>{formatCurrency(chitiet.thanhTien)}</CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between mb-2">
          <span>Tổng tiền dịch vụ:</span>
          <span className="font-bold">{formatCurrency(hoaDon.tongThanhToan)}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Giảm giá:</span>
          <span className="font-bold">{formatCurrency(hoaDon.giamGia)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng thanh toán:</span>
          <span>{formatCurrency(hoaDon.tongThanhToan)}</span>
        </div>
      </div>

      {hoaDon.ghiChu && (
        <div className="mt-4">
          <p className="font-bold">Ghi chú:</p>
          <p>{hoaDon.ghiChu}</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
        <p className="mt-4">Nhân viên thanh toán</p>
        <p className="mt-2">(Ký và ghi rõ họ tên)</p>
      </div>
    </div>
  )
}

InHoaDon.propTypes = {
  hoaDon: PropTypes.shape({
    maHoaDonBanLe: PropTypes.string.isRequired,
    ngayLap: PropTypes.string.isRequired,
    tongThanhToan: PropTypes.number.isRequired,
    giamGia: PropTypes.number.isRequired,
    ghiChu: PropTypes.string,
    hinhThucThanhToan: PropTypes.shape({
      tenHinhThucThanhToan: PropTypes.string.isRequired,
    }).isRequired,
    chiTietHoaDonBanLe: PropTypes.arrayOf(
      PropTypes.shape({
        maChiTietHoaDon: PropTypes.string.isRequired,
        soLuong: PropTypes.number.isRequired,
        donGia: PropTypes.number.isRequired,
        thanhTien: PropTypes.number.isRequired,
        dichvu: PropTypes.shape({
          tenDichVu: PropTypes.string.isRequired,
        }).isRequired,
      }),
    ).isRequired,
  }).isRequired,
}

export default InHoaDon
