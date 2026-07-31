import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faEye } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import config from 'src/service/Config'
import InHoaDon from './InHoaDon'
import PropTypes from 'prop-types'

const LichSuThanhToan = ({ isActive = false }) => {
  const [lichSuThanhToan, setLichSuThanhToan] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHoaDon, setSelectedHoaDon] = useState(null)
  const [visibleChiTiet, setVisibleChiTiet] = useState(false)
  const [visibleInHoaDon, setVisibleInHoaDon] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isActive) {
      fetchLichSuThanhToan()
    }
  }, [isActive])

  const fetchLichSuThanhToan = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${config.apiBaseUrl}/hoa-don-nha-hang`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      console.log(response.data.result)

      if (response.status === 200) {
        setLichSuThanhToan(response.data.result)
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử thanh toán:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleXemChiTiet = (hoaDon) => {
    setSelectedHoaDon(hoaDon)
    setVisibleChiTiet(true)
  }

  const handleInHoaDon = (hoaDon) => {
    setSelectedHoaDon(hoaDon)
    setVisibleInHoaDon(true)
  }

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner />
      </div>
    )
  }

  return (
    <div className="p-4">
      <CCard>
        <CCardBody>
          <h2 className="text-2xl font-bold mb-4">Lịch sử thanh toán</h2>
          <div className="overflow-x-auto">
            <CTable align="middle" responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Mã hóa đơn</CTableHeaderCell>
                  <CTableHeaderCell>Ngày thanh toán</CTableHeaderCell>
                  <CTableHeaderCell>Khách hàng</CTableHeaderCell>
                  <CTableHeaderCell>Tổng tiền</CTableHeaderCell>
                  <CTableHeaderCell>Phương thức</CTableHeaderCell>
                  <CTableHeaderCell>Thao tác</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {lichSuThanhToan.map((hoaDon) => (
                  <CTableRow key={hoaDon.maHoaDonBanLe}>
                    <CTableDataCell>{hoaDon.maHoaDonBanLe}</CTableDataCell>
                    <CTableDataCell>{formatDate(hoaDon.ngayLap)}</CTableDataCell>
                    <CTableDataCell>Khách lẻ</CTableDataCell>
                    <CTableDataCell>{formatCurrency(hoaDon.tongThanhToan)}</CTableDataCell>
                    <CTableDataCell>{hoaDon.hinhThucThanhToan.tenHinhThucThanhToan}</CTableDataCell>
                    <CTableDataCell>
                      <div className="flex gap-2">
                        <CButton color="info" size="sm" onClick={() => handleXemChiTiet(hoaDon)}>
                          <FontAwesomeIcon icon={faEye} />
                        </CButton>
                        <CButton color="primary" size="sm" onClick={() => handleInHoaDon(hoaDon)}>
                          <FontAwesomeIcon icon={faPrint} />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
      </CCard>

      {/* Modal chi tiết hóa đơn */}
      <CModal
        size="lg"
        visible={visibleChiTiet}
        onClose={() => setVisibleChiTiet(false)}
        aria-labelledby="ChiTietHoaDonModal"
      >
        <CModalHeader>
          <CModalTitle id="ChiTietHoaDonModal">Chi tiết hóa đơn</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedHoaDon && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold">Mã hóa đơn:</p>
                  <p>{selectedHoaDon.maHoaDonBanLe}</p>
                </div>
                <div>
                  <p className="font-bold">Ngày thanh toán:</p>
                  <p>{formatDate(selectedHoaDon.ngayLap)}</p>
                </div>
                <div>
                  <p className="font-bold">Khách hàng:</p>
                  <p>Khách lẻ</p>
                </div>
                <div>
                  <p className="font-bold">Phương thức thanh toán:</p>
                  <p>{selectedHoaDon.hinhThucThanhToan.tenHinhThucThanhToan}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Danh sách dịch vụ:</h3>
                <CTable align="middle" responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Tên dịch vụ</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Số lượng</CTableHeaderCell>
                      <CTableHeaderCell>Đơn giá</CTableHeaderCell>
                      <CTableHeaderCell>Thành tiền</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {selectedHoaDon.chiTietHoaDonBanLe.map((chitiet, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>{chitiet.dichvu.tenDichVu}</CTableDataCell>
                        <CTableDataCell className="text-center">{chitiet.soLuong}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(chitiet.donGia)}</CTableDataCell>
                        <CTableDataCell>{formatCurrency(chitiet.thanhTien)}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Tổng tiền dịch vụ:</span>
                  <span className="font-bold">{formatCurrency(selectedHoaDon.tongThanhToan)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Giảm giá:</span>
                  <span className="font-bold">{formatCurrency(selectedHoaDon.giamGia)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng thanh toán:</span>
                  <span>{formatCurrency(selectedHoaDon.tongThanhToan)}</span>
                </div>
              </div>

              {selectedHoaDon.ghiChu && (
                <div>
                  <p className="font-bold">Ghi chú:</p>
                  <p>{selectedHoaDon.ghiChu}</p>
                </div>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleChiTiet(false)}>
            Đóng
          </CButton>
          <CButton color="primary" onClick={() => handleInHoaDon(selectedHoaDon)}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            In hóa đơn
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal in hóa đơn */}
      <CModal
        size="xl"
        visible={visibleInHoaDon}
        onClose={() => setVisibleInHoaDon(false)}
        aria-labelledby="InHoaDonModal"
      >
        <CModalHeader>
          <CModalTitle id="InHoaDonModal">In hóa đơn</CModalTitle>
        </CModalHeader>
        <CModalBody>{selectedHoaDon && <InHoaDon hoaDon={selectedHoaDon} />}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleInHoaDon(false)}>
            Đóng
          </CButton>
          <CButton color="primary" onClick={() => window.print()}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            In
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

LichSuThanhToan.propTypes = {
  isActive: PropTypes.bool,
}

export default LichSuThanhToan
