import React, { useState, useEffect } from 'react'
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
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faPrint } from '@fortawesome/free-solid-svg-icons'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { AllThongTinKhachHang, getPhuThuKhiCreateBooking } from 'src/service/ThanhToanService'
import { Link, useParams } from 'react-router-dom'
import { getDanhSachHoaDon } from 'src/service/HoaDonService'

const XemThanhToan = () => {
  const { ma_booking } = useParams()

  const [loading, setLoading] = useState(false)
  const [thongTinKhachHang, setThongTinKhachHang] = useState(null)
  const [thongTinThanhToan, setThongTinThanhToan] = useState(null)
  const [phuThuTreEm, setPhuThuTreEm] = useState(null)
  const [selectedPhong, setSelectedPhong] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [khachHangData, thanhToanData, phuThuTreEmData] = await Promise.all([
        AllThongTinKhachHang(ma_booking),
        getDanhSachHoaDon(ma_booking),
        getPhuThuKhiCreateBooking(ma_booking),
      ])

      if (khachHangData) {
        setThongTinKhachHang(khachHangData)
      }
      if (thanhToanData) {
        setThongTinThanhToan(thanhToanData)
      }
      if (phuThuTreEmData) {
        setPhuThuTreEm(phuThuTreEmData)
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

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
  }

  const formatCurrency = (amount) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    return formattedNumber
  }

  const tinhTongTienDichVu = (danhSachDichVu) => {
    return danhSachDichVu.reduce((tong, dichVu) => tong + dichVu.thanhTien, 0)
  }

  const tinhTongTienPhuThu = (phong) => {
    if (!phong) return 0
    const tienPhuThuGiuong = phong.phuThuTienGiuong * phong.soGiuong * phong.soNgayO
    const tienPhuThuTreEm = phong.phThuTreEm * phong.soTre * phong.soNgayO
    const tienPhuThuNguoiLon = phong.phuThuNguoiLon * phong.soNguoiLon * phong.soNgayO
    const phuThuCheckInSom = phong.phuThuCheckInSom
    const phuThuCheckOutTre = phong.phuThuCheckOutTre
    return (
      tienPhuThuGiuong + tienPhuThuTreEm + tienPhuThuNguoiLon + phuThuCheckInSom + phuThuCheckOutTre
    )
  }

  const tinhTongTienPhong = (phong) => {
    if (!phong) return 0
    const tienPhong = tinhTongGiaPhongTheoNgay(phong.danhSachGiaPhongTheoNgay)
    const tienDichVu = tinhTongTienDichVu(phong.danhSachDichVu)
    const tienPhuThuGiuong = phong.phuThuTienGiuong * phong.soGiuong * phong.soNgayO
    const tienPhuThuTreEm = phong.phThuTreEm * phong.soTre * phong.soNgayO
    const tienPhuThuNguoiLon = phong.phuThuNguoiLon * phong.soNguoiLon * phong.soNgayO
    const phuThuCheckInSom = phong.phuThuCheckInSom
    const phuThuCheckOutTre = phong.phuThuCheckOutTre
    return (
      tienPhong +
      tienDichVu +
      tienPhuThuGiuong +
      tienPhuThuTreEm +
      tienPhuThuNguoiLon +
      (phuThuCheckInSom || 0) +
      (phuThuCheckOutTre || 0)
    )
  }

  const tinhTongGiaPhongTheoNgay = (danhSachGiaPhongTheoNgay) =>
    Array.isArray(danhSachGiaPhongTheoNgay)
      ? danhSachGiaPhongTheoNgay.reduce((sum, item) => sum + (item.gia || 0), 0)
      : 0

  const tinhTongTienPhongBooking = (danhSachPhong) => {
    if (!Array.isArray(danhSachPhong)) return 0
    return danhSachPhong.reduce((total, phong) => {
      return total + tinhTongGiaPhongTheoNgay(phong.danhSachGiaPhongTheoNgay)
    }, 0)
  }

  const tinhTongPhuThuCheckInSomBooking = (danhSachPhong) => {
    if (!Array.isArray(danhSachPhong)) return 0
    return danhSachPhong.reduce((total, phong) => {
      return total + phong.phuThuCheckInSom
    }, 0)
  }

  const tinhTongPhuThuCheckOutTreBooking = (danhSachPhong) => {
    if (!Array.isArray(danhSachPhong)) return 0
    return danhSachPhong.reduce((total, phong) => {
      return total + phong.phuThuCheckOutTre
    }, 0)
  }

  const tinhTongTienDichVuBooking = (danhSachPhong) => {
    return danhSachPhong.reduce(
      (total, phong) => total + tinhTongTienDichVu(phong.danhSachDichVu),
      0,
    )
  }

  const tinhTongTienPhuThuTreEmBooking = (danhSachPhuThuTreEm) =>
    Array.isArray(danhSachPhuThuTreEm)
      ? danhSachPhuThuTreEm.reduce(
          (total, item) => total + item.thanhtienphuthutreem || 0 + item.thanhtienphuthuansang || 0,
          0,
        )
      : 0

  const tinhTongTienPhuThuBooking = (danhSachPhong, danhSachPhuThuTreEm) => {
    if (!Array.isArray(danhSachPhong)) return 0

    // Tính tổng phụ thu từ các phòng
    const tongPhuThuPhong = danhSachPhong.reduce(
      (tong, phong) => (phong.daThanhToan === true ? tong + tinhTongTienPhuThu(phong) : tong),
      0,
    )

    // Tính tổng phụ thu trẻ em (chỉ tính 1 lần)
    const tongPhuThuTreEm = tinhTongTienPhuThuTreEmBooking(danhSachPhuThuTreEm)

    return tongPhuThuPhong + tongPhuThuTreEm
  }

  const tinhTongTienBooking = (danhSachPhong, danhSachPhuThuTreEm) => {
    return (
      tinhTongTienPhongBooking(danhSachPhong) +
      tinhTongTienDichVuBooking(danhSachPhong) +
      tinhTongTienPhuThuBooking(danhSachPhong, danhSachPhuThuTreEm) -
      (thongTinKhachHang?.tien_coc || 0)
    )
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner />
      </div>
    )
  }

  if (!thongTinKhachHang || !thongTinThanhToan) {
    return (
      <div className="text-center py-4">
        <CAlert color="warning">Không tìm thấy thông tin thanh toán</CAlert>
      </div>
    )
  }

  const handleViewPhongDetail = (phong) => {
    console.log(phong)
    setSelectedPhong(phong)
    setShowModal(true)
  }

  const tinhTongPhuThuCheckInSom = (danhSachPhong) => {
    if (!Array.isArray(danhSachPhong)) return 0
    return danhSachPhong.reduce((sum, p) => sum + p.phuThuCheckInSom, 0)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
            <CRow>
              <CCol xs={12}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 text-blue-600 fw-bold">Thông tin thanh toán</h4>
                  <Link
                    to={`/dashboard/pos/danh-sach-booking/xem-thanh-toan/${ma_booking}/hoa-don-vat`}
                  >
                    <CButton color="primary">
                      <FontAwesomeIcon icon={faPrint} className="me-2" />
                      Print VAT
                    </CButton>
                  </Link>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="relative mb-3">
                      <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                        Thông tin khách hàng
                      </span>
                      <div className="border-2 border-blue-500 rounded-md p-4">
                        <CTable align="middle" responsive borderless>
                          <CTableBody>
                            <CTableRow>
                              <CTableHeaderCell>Mã Booking:</CTableHeaderCell>
                              <CTableDataCell>{thongTinKhachHang.ma_booking}</CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Khách hàng:</CTableHeaderCell>
                              <CTableDataCell>{thongTinKhachHang.tenkhachhang}</CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Nhóm khách hàng:</CTableHeaderCell>
                              <CTableDataCell>
                                {thongTinKhachHang.ten_nhom_khach_hang}
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Loại khách hàng:</CTableHeaderCell>
                              <CTableDataCell>{thongTinKhachHang.loai_nguon_khach}</CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Check-in:</CTableHeaderCell>
                              <CTableDataCell>
                                {formatDate(thongTinKhachHang.ngay_den)}
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Check-out:</CTableHeaderCell>
                              <CTableDataCell>
                                {formatDate(thongTinKhachHang.ngay_di)}
                              </CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                      </div>
                    </div>
                    <div className="col-md-12">
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
                              {phuThuTreEm.map((item, index) => (
                                <CTableRow key={index}>
                                  <CTableDataCell>{index + 1}</CTableDataCell>
                                  <CTableDataCell>
                                    {' '}
                                    {(item.so_luong_phu_thu_tre_em > 0 && 'Phụ thu trẻ em') ||
                                      (item.so_luong_phu_thu_an_sang > 0 && 'Phụ thu ăn sáng') ||
                                      'Phụ thu khác'}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {item.so_luong_phu_thu_tre_em || item.so_luong_phu_thu_an_sang}
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
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="relative mb-3">
                      <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                        Chi tiết thanh toán
                      </span>
                      <div className="border-2 border-green-500 rounded-md p-4">
                        <CTable align="middle" responsive borderless>
                          <CTableBody>
                            <CTableRow>
                              <CTableHeaderCell>Tổng tiền phòng:</CTableHeaderCell>
                              <CTableDataCell className="font-semibold text-end">
                                {formatCurrency(tinhTongTienPhongBooking(thongTinThanhToan))}
                                {/* {formatCurrency(thongTinKhachHang?.tong_tien)} */}
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Tổng phụ thu check-in sớm</CTableHeaderCell>
                              <CTableDataCell className="font-semibold text-right">
                                {formatCurrency(tinhTongPhuThuCheckInSomBooking(thongTinThanhToan))}
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Tổng phụ thu check-out trễ</CTableHeaderCell>
                              <CTableDataCell className="font-semibold text-right">
                                {formatCurrency(
                                  tinhTongPhuThuCheckOutTreBooking(thongTinThanhToan),
                                )}
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Tổng tiền tất cả phụ thu:</CTableHeaderCell>
                              <CTableDataCell className="font-semibold text-end">
                                {formatCurrency(
                                  tinhTongTienPhuThuBooking(thongTinThanhToan, phuThuTreEm),
                                )}
                              </CTableDataCell>
                            </CTableRow>
                            <CTableRow>
                              <CTableHeaderCell>Tổng tiền dịch vụ:</CTableHeaderCell>
                              <CTableDataCell className="font-semibold text-end">
                                {formatCurrency(tinhTongTienDichVuBooking(thongTinThanhToan))}
                              </CTableDataCell>
                            </CTableRow>

                            <CTableRow>
                              <CTableHeaderCell>Tiền khách cọc:</CTableHeaderCell>
                              <CTableDataCell className="font-semibold text-end">
                                {formatCurrency(thongTinKhachHang?.tien_coc)}
                              </CTableDataCell>
                            </CTableRow>

                            <CTableRow>
                              <CTableHeaderCell className="text-success">
                                Tổng cộng:
                              </CTableHeaderCell>
                              <CTableDataCell className="text-end text-success fw-bold">
                                {formatCurrency(
                                  tinhTongTienBooking(thongTinThanhToan, phuThuTreEm),
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                        <hr />
                        <CCol>
                          <CFormLabel
                            htmlFor="inputPassword"
                            className=" col-form-label text-green-600 font-bold"
                          >
                            Phương thức thanh toán: {thongTinKhachHang.ten_hinh_thuc_thanh_toan}
                          </CFormLabel>
                        </CCol>
                         <CCol>
                              <CFormLabel
                                htmlFor="inputPassword"
                                className=" col-form-label text-green-600 font-bold"
                              >
                                Ghi chú: {thongTinKhachHang.ghi_chu}
                              </CFormLabel>
                            </CCol>
                        <hr />
                        <CCol>
                          <CFormLabel
                            htmlFor="inputPassword"
                            className=" col-form-label labelcustome"
                          >
                            Phương thức thanh toán phụ:{' '}
                            {thongTinKhachHang.ten_hinh_thuc_thanh_toan_phu}
                          </CFormLabel>
                        </CCol>
                        {thongTinKhachHang.ma_hinh_thuc_thanh_toan_phu !== 0 && (
                          <>
                            <CCol>
                              <CFormLabel
                                htmlFor="inputPassword"
                                className=" col-form-label labelcustome"
                              >
                                Giá: {formatCurrency(thongTinKhachHang.gia_tri_thanh_toan_phu)}
                              </CFormLabel>
                            </CCol>
                            <CCol>
                              <CFormLabel
                                htmlFor="inputPassword"
                                className=" col-form-label labelcustome"
                              >
                                Ghi chú: {thongTinKhachHang.ghi_chu_thanh_toan_phu}
                              </CFormLabel>
                            </CCol>
                          </>
                        )}

                        <CCol>Nhân viên thanh toán: {thongTinKhachHang.ten_nhan_vien}</CCol>
                        <CCol>
                          Thời gian thanh toán:{' '}
                          {thongTinKhachHang?.ngay_lap
                            ? format(parseISO(thongTinKhachHang.ngay_lap), 'HH:mm dd/MM/yyyy')
                            : '-'}
                        </CCol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mb-3">
                  <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                    Chi tiết phòng và dịch vụ
                  </span>
                  <div className="border-2 border-gray-500 rounded-md p-4">
                    <CTable align="middle" responsive bordered>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Mã phòng</CTableHeaderCell>
                          <CTableHeaderCell>Loại phòng</CTableHeaderCell>
                          <CTableHeaderCell>Check-in</CTableHeaderCell>
                          <CTableHeaderCell>Check-out</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Số đêm</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Tiền phòng</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Tiền dịch vụ</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Tiền phụ thu</CTableHeaderCell>
                          <CTableHeaderCell className="text-end">Tổng cộng</CTableHeaderCell>
                          {/* <CTableHeaderCell className="text-end">Trạng thái</CTableHeaderCell> */}
                          <CTableHeaderCell className="text-end"></CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {thongTinThanhToan.map((phong) => (
                          <CTableRow key={phong.maPhong}>
                            <CTableDataCell>{phong.maPhong}</CTableDataCell>
                            <CTableDataCell>{phong.tenLoaiPhong}</CTableDataCell>
                            <CTableDataCell>{formatDate(phong.ngayDen)}</CTableDataCell>
                            <CTableDataCell>{formatDate(phong.ngayDi)}</CTableDataCell>
                            <CTableDataCell className="text-end">{phong.soNgayO}</CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(
                                tinhTongGiaPhongTheoNgay(phong?.danhSachGiaPhongTheoNgay),
                              )}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(tinhTongTienDichVu(phong.danhSachDichVu))}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(tinhTongTienPhuThu(phong))}
                            </CTableDataCell>
                            <CTableDataCell className="text-end">
                              {formatCurrency(tinhTongTienPhong(phong))}
                            </CTableDataCell>

                            {/* <CTableDataCell className="text-end">
                              {phong.daThanhToan ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </CTableDataCell> */}
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
                </div>
              </CCol>
              {/* Modal chi tiết phòng */}
              <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
                <CModalHeader>
                  <CModalTitle>
                    Chi tiết phòng {selectedPhong?.maPhong} - {selectedPhong?.tenLoaiPhong}
                  </CModalTitle>
                </CModalHeader>
                <CModalBody>
                  {/* <CCol className="mb-3">
                    <CCol>
                      <span className="labelcustome">Thời gian thanh toán: </span>
                      {selectedPhong?.ngayLap
                        ? format(parseISO(selectedPhong.ngayLap), 'dd/MM/yyyy HH:mm')
                        : '-'}
                    </CCol>
                    <CCol>
                      <span className="labelcustome">Hình thức thanh toán: </span>
                      {selectedPhong?.hinhThucThanhToan || '-'}
                    </CCol>
                    <CCol>
                      <span className="labelcustome">Ghi chú: </span>
                      {selectedPhong?.ghiChu || '-'}
                    </CCol>
                  </CCol> */}
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
                                {formatCurrency(item.gia || 0)}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">1</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(item.gia || 0)}
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
                              <CTableDataCell className="text-end ">
                                {formatCurrency(dichVu.thanhTien)}
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                          {selectedPhong.phuThuTienGiuong > 0 ? (
                            <CTableRow>
                              <CTableDataCell>Phụ thu tiền giường</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phuThuTienGiuong)}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {selectedPhong.soGiuong} giường / {selectedPhong.soNgayO} đêm
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(
                                  selectedPhong.phuThuTienGiuong *
                                    selectedPhong.soGiuong *
                                    selectedPhong.soNgayO,
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ) : (
                            ''
                          )}
                          {selectedPhong.phuThuNguoiLon > 0 ? (
                            <CTableRow>
                              <CTableDataCell>Phụ thu trẻ em</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phuThuNguoiLon)}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {selectedPhong.soNguoiLon} người lớn / {selectedPhong.soNgayO} đêm
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(
                                  selectedPhong.phuThuNguoiLon * selectedPhong.soNguoiLon,
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ) : (
                            ''
                          )}{' '}
                          {selectedPhong.phThuTreEm > 0 ? (
                            <CTableRow>
                              <CTableDataCell>Phụ thu trẻ em</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phThuTreEm)}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {selectedPhong.soTre} trẻ em / {selectedPhong.soNgayO} đêm
                              </CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(
                                  selectedPhong.phThuTreEm *
                                    selectedPhong.soTre *
                                    selectedPhong.soNgayO,
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ) : (
                            ''
                          )}
                          {selectedPhong?.phuThuCheckInSom ? (
                            <CTableRow>
                              <CTableDataCell>Phụ thu check-in sớm</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phuThuCheckInSom)}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">1</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phuThuCheckInSom)}
                              </CTableDataCell>
                            </CTableRow>
                          ) : (
                            ''
                          )}
                          {selectedPhong?.phuThuCheckOutTre ? (
                            <CTableRow>
                              <CTableDataCell>Phụ thu check-out trễ</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phuThuCheckOutTre)}
                              </CTableDataCell>
                              <CTableDataCell className="text-end">1</CTableDataCell>
                              <CTableDataCell className="text-end">
                                {formatCurrency(selectedPhong.phuThuCheckOutTre)}
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

                      {/* Bảng danh sách dịch vụ miễn phí */}
                      {/* {selectedPhong.danhSachDichVuMienPhi &&
                        selectedPhong.danhSachDichVuMienPhi.length > 0 && (
                          <div className="mt-4">
                            <h5 className="mb-3 text-blue-600 fw-bold">
                              Danh sách dịch vụ miễn phí
                            </h5>
                            <CTable bordered>
                              <CTableHead>
                                <CTableRow>
                                  <CTableHeaderCell>Tên dịch vụ</CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">
                                    Tổng số lượng
                                  </CTableHeaderCell>
                                  <CTableHeaderCell className="text-end">
                                    Số lượng còn lại
                                  </CTableHeaderCell>
                                  <CTableHeaderCell>Ghi chú</CTableHeaderCell>
                                </CTableRow>
                              </CTableHead>
                              <CTableBody>
                                {selectedPhong.danhSachDichVuMienPhi.map((dichVu, index) => (
                                  <CTableRow key={index}>
                                    <CTableDataCell>{dichVu.tenDichVuMienPhi}</CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      {dichVu.tongSoLuong}
                                    </CTableDataCell>
                                    <CTableDataCell className="text-end">
                                      {dichVu.tongSoLuongConLai}
                                    </CTableDataCell>
                                    <CTableDataCell>{dichVu.ghiChu || '-'}</CTableDataCell>
                                  </CTableRow>
                                ))}
                              </CTableBody>
                            </CTable>
                          </div>
                        )} */}
                    </div>
                  )}
                </CModalBody>
                <CModalFooter>
                  <CButton color="secondary" onClick={() => setShowModal(false)}>
                    Đóng
                  </CButton>
                  {/* <CButton color="primary">
                  <FontAwesomeIcon icon={faPrint} className="me-2" />
                  In chi tiết
                </CButton> */}
                </CModalFooter>
              </CModal>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default XemThanhToan
