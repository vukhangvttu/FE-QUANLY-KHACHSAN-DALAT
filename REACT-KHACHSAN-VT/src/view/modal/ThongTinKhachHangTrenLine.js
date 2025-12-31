import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormLabel,
  CModalFooter,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle, CSpinner } from '@coreui/react-pro'
import { getThongTinKhachHangBooKing } from 'src/service/APIService'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { getKhachHangPhongByMaXepPhong } from 'src/service/KhacHangPhongService'

const ThongTinKhachHangTrenLine = ({ visible, onClose, ma_xepphong }) => {
  const [data, setData] = useState([])
  const [danhSachKhachHangPhong, setDanhSachKhachHangPhong] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const fetchData = async () => {
    if (ma_xepphong === '' || ma_xepphong === null || ma_xepphong === undefined) {
      alert('Mã xếp phòng không hợp lệ')
      return
    }
    try {
      setLoading(true)

      // Gọi đồng thời cả hai API
      const [thongTinData, danhSachKhachHangData] = await Promise.all([
        getThongTinKhachHangBooKing(ma_xepphong, navigate),
        getKhachHangPhongByMaXepPhong(ma_xepphong, navigate),
      ])

      console.log('API Response - Thông tin:', thongTinData) // Debug
      console.log('API Response - Danh sách khách hàng:', danhSachKhachHangData) // Debug

      if (thongTinData) {
        setData(thongTinData)
      }
      if (danhSachKhachHangData) {
        setDanhSachKhachHangPhong(danhSachKhachHangData)
      }

      return { thongTinData, danhSachKhachHangData }
    } catch (error) {
      console.error('Error fetching thông tin rooms:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchData()
    }
  }, [visible])

  return (
    <>
      <CModal
        size="xl"
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Phòng: P.{data?.ma_phong}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CSpinner as="span" size="sm" variant="grow" aria-hidden="true" />
              <span className="visually-hidden" role="status">
                Loading...
              </span>
            </div>
          ) : (
            <>
              <CRow>
                <CCol xs={6} md={4}>
                  <CFormLabel className="labelcustome">BooKing ID: </CFormLabel>
                  <span className="font-semibold"> {data?.ma_booking}</span>
                </CCol>
                <CCol xs={6} md={3}>
                  <CFormLabel className="labelcustome">Loại phòng:</CFormLabel>
                  <span className="font-semibold"> {data?.ma_loai_phong}</span>
                </CCol>
                <CCol xs={6} md={5}>
                  <CFormLabel className="labelcustome">Tên: </CFormLabel>
                  <span className="font-semibold"> {data?.ten_loai_phong}</span>
                </CCol>
              </CRow>

              <CRow>
                <CCol xs={6} md={4}>
                  <CFormLabel className="labelcustome">Ngày đến: </CFormLabel>
                  <span className="font-semibold">
                    {' '}
                    {data?.ngay_den ? format(parseISO(data.ngay_den), 'dd/MM/yyyy') : '-'}
                  </span>
                </CCol>
                <CCol xs={6} md={3}>
                  <CFormLabel className="labelcustome">Ngày đi:</CFormLabel>
                  <span className="font-semibold">
                    {' '}
                    {data?.ngay_di ? format(parseISO(data.ngay_di), 'dd/MM/yyyy') : '-'}
                  </span>
                </CCol>
                <CCol xs={6} md={5}>
                  <CFormLabel className="labelcustome">Check-in: </CFormLabel>
                  <span className="font-semibold">
                    {' '}
                    {data?.thoi_gian_nhan === null
                      ? 'Chưa có thời gian nhận phòng'
                      : data?.thoi_gian_nhan
                        ? format(parseISO(data.thoi_gian_nhan), 'HH:ss dd/MM/yyyy')
                        : '-'}
                  </span>
                </CCol>
              </CRow>

              <CRow>
                <CCol xs={6} md={4}>
                  <CFormLabel className="labelcustome">Giá phòng: </CFormLabel>
                  <span className="font-semibold">
                    {' '}
                    {typeof data?.gia === 'number' ? data.gia.toLocaleString('en-US') : '0'}
                  </span>
                </CCol>
                <CCol xs={6} md={3}>
                  <CFormLabel className="labelcustome">Extra Bed:</CFormLabel>
                  <span className="font-semibold">
                    {' '}
                    {typeof data?.phu_thu_tien_giuong === 'number'
                      ? data.phu_thu_tien_giuong.toLocaleString('en-US')
                      : '0'}
                  </span>
                </CCol>
                <CCol xs={6} md={5}>
                  <CFormLabel className="labelcustome">Dịch vụ: </CFormLabel>
                  <span>
                    <span className="font-semibold">
                      {' '}
                      {typeof data?.tong_tien_dich_vu === 'number'
                        ? data.tong_tien_dich_vu.toLocaleString('en-US')
                        : '0'}
                    </span>
                  </span>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={12} md={12}>
                  <CFormLabel className="labelcustome">Nhân viên: </CFormLabel>
                  <span className="font-semibold"> {data.ma_nhan_vien}</span>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={12} md={12}>
                  <CFormLabel className="labelcustome">Ghi chú: </CFormLabel>
                  <span className="font-bold"> {data.ghi_chu}</span>
                </CCol>
              </CRow>
            </>
          )}
          <div className="relative mb-3 mt-3">
            <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
              Dach sách khách hàng
            </span>
            <div className="border-2 border-gray-500 rounded-md p-4 ">
              <CTable align="middle" responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Mã khách</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tiêu đề</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Họ</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tên</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Trẻ em</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Ngày sinh</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Quốc tịch</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody>
                  {loading ? (
                    <CTableRow>
                      <CTableDataCell colSpan="9">Đang tải...</CTableDataCell>
                    </CTableRow>
                  ) : danhSachKhachHangPhong.length > 0 ? (
                    danhSachKhachHangPhong.map((item) => (
                      <CTableRow key={item.maKhachHangPhong}>
                        <CTableDataCell>{item.maKhachHangPhong}</CTableDataCell>
                        <CTableDataCell>{item.danhXung.maDanhXung}</CTableDataCell>
                        <CTableDataCell>{item.ho}</CTableDataCell>
                        <CTableDataCell>{item.ten}</CTableDataCell>
                        <CTableDataCell>{item.soTuoiTre}</CTableDataCell>
                        <CTableDataCell>
                          {' '}
                          {item.ngaySinh ? format(parseISO(item.ngaySinh), 'dd/MM/yyyy') : 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell>{item.quocGia.tenQuocGia}</CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="9">
                        <h4>Chưa có thông tin khách</h4>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} /> Đóng
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

ThongTinKhachHangTrenLine.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  ma_xepphong: PropTypes.string.isRequired,
}
export default ThongTinKhachHangTrenLine
