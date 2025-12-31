import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormLabel,
  CModalFooter,
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
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { useNavigate } from 'react-router-dom'
import { createDichVuMienPhi, getListDichVuMienPhi } from 'src/service/XepPhongBooKingService'

import { format, parseISO } from 'date-fns'

const DichVuMienPhi = ({
  visible,
  onClose,
  maPhong,
  ma_xepphong,
  soGiuongMax,
  maLoaiPhong,
  soLuongKhach,
}) => {
  const navigate = useNavigate()
  const [trangthaiload, setTrangthaiload] = useState(false)
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

  const [loading, setLoading] = useState(false)

  const [tongPhuThu, setTongPhuThu] = useState(0)

  const [listDichVuMienPhi, setListDichVuMienPhi] = useState([])

  // Tính tổng số lượng cho từng loại dịch vụ
  const tinhTongSoLuong = (maDichVu) => {
    return listDichVuMienPhi
      .filter((item) => item.maDichVuMienPhi.maDichVuMienPhi === maDichVu)
      .reduce((total, item) => total + item.soLuong, 0)
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await getListDichVuMienPhi(ma_xepphong, navigate)
      if (response) {
        // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0]

        // Lọc các dịch vụ có ngày bổ sung là ngày hiện tại
        const todayServices = response.filter((item) => item.ngayBoSung === today)

        // Cập nhật số lượng cho từng loại dịch vụ
        const nuocSuoi = todayServices.find(
          (item) => item.maDichVuMienPhi.maDichVuMienPhi === 'NUOC_SUOI',
        )
        const tra = todayServices.find((item) => item.maDichVuMienPhi.maDichVuMienPhi === 'TRA')
        const caphe = todayServices.find((item) => item.maDichVuMienPhi.maDichVuMienPhi === 'CAPHE')

        // Cập nhật state với số lượng tương ứng
        setSoLuongNuocSuoi(nuocSuoi ? nuocSuoi.soLuong : 0)
        setSoLuongTra(tra ? tra.soLuong : 0)
        setSoLuongCafe(caphe ? caphe.soLuong : 0)

        // Lưu toàn bộ danh sách để hiển thị lịch sử
        setListDichVuMienPhi(response)
      } else {
        addToast(exampleToast('Không thể tải phụ thu. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchData()
    }
  }, [visible])

  const [soLuongNuocSuoi, setSoLuongNuocSuoi] = useState(0)
  const [soLuongTra, setSoLuongTra] = useState(0)
  const [soLuongCafe, setSoLuongCafe] = useState(0)
  const [dichVuMienPhiList, setDichVuMienPhiList] = useState([])

  const tinhTongTien = (giaGiuong, soluong, giaTreEm, soTre) => {
    setTongPhuThu(giaGiuong * soluong + giaTreEm * soTre)
  }

  const handleChangeSoLuongNuocSuoi = (value) => {
    const soluong = Math.abs(parseInt(value.target.value) || 0)
    setSoLuongNuocSuoi(soluong)

    setDichVuMienPhiList((prevList) => {
      const filteredList = prevList.filter(
        (item) => item.dichVuMienPhi.maDichVuMienPhi !== 'NUOC_SUOI',
      )
      if (soluong > 0) {
        return [
          ...filteredList,
          {
            xepPhongBooking: { maChiTietBooking: ma_xepphong },
            dichVuMienPhi: { maDichVuMienPhi: 'NUOC_SUOI' },
            soLuong: soluong,
            ngayBoSung: new Date().toISOString().split('T')[0],
          },
        ]
      }
      return filteredList
    })
  }

  const handleChangeSoLuongTra = (value) => {
    const soluong = Math.abs(parseInt(value.target.value) || 0)
    setSoLuongTra(soluong)

    setDichVuMienPhiList((prevList) => {
      const filteredList = prevList.filter((item) => item.dichVuMienPhi.maDichVuMienPhi !== 'TRA')
      if (soluong > 0) {
        return [
          ...filteredList,
          {
            xepPhongBooking: { maChiTietBooking: ma_xepphong },
            dichVuMienPhi: { maDichVuMienPhi: 'TRA' },
            soLuong: soluong,
            ngayBoSung: new Date().toISOString().split('T')[0],
          },
        ]
      }
      return filteredList
    })
  }

  const handleChangeSoLuongCafe = (value) => {
    const soluong = Math.abs(parseInt(value.target.value) || 0)
    setSoLuongCafe(soluong)

    setDichVuMienPhiList((prevList) => {
      const filteredList = prevList.filter((item) => item.dichVuMienPhi.maDichVuMienPhi !== 'CAPHE')
      if (soluong > 0) {
        return [
          ...filteredList,
          {
            xepPhongBooking: { maChiTietBooking: ma_xepphong },
            dichVuMienPhi: { maDichVuMienPhi: 'CAPHE' },
            soLuong: soluong,
            ngayBoSung: new Date().toISOString().split('T')[0],
          },
        ]
      }
      return filteredList
    })
  }

  const onClickUpdatePhuThuPhong = async () => {
    if (soLuongNuocSuoi < 0) {
      return addToast(exampleToast('⚠️ Số lượng nước suối không hợp lệ'))
    } else if (soLuongTra < 0) {
      return addToast(exampleToast('⚠️ Số lượng trà không hợp lệ'))
    } else if (soLuongCafe < 0) {
      return addToast(exampleToast('⚠️ Số lượng cà phê không hợp lệ'))
    }

    if (!ma_xepphong) {
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))
    }

    console.log(dichVuMienPhiList)

    try {
      setTrangthaiload(true)
      const response = await createDichVuMienPhi(dichVuMienPhiList, ma_xepphong, navigate)
      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }
      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✅ ' + response.message + ' Phòng ' + maPhong))

          fetchData()
          //   onSubmit(data)
        } else {
          addToast(exampleToast('Update không thành công'))
        }
      }
    } catch (error) {
      console.error('Error:', error)
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
    } finally {
      setTrangthaiload(false)
    }
  }

  return (
    <>
      <div className="fixed top-0 right-0 z-50">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>

      <CModal
        size="lg"
        // alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Dịch vụ miễn phí P.{maPhong}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="d-flex justify-content-center">
              <CSpinner />
            </div>
          ) : (
            <CRow>
              <CCol sm={12}>
                <CTable borderless>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Tên dịch vụ
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-600 text-center">
                        Số lượng tối đa
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-600 text-center">
                        Tổng số lượng
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Số lượng đã nhập hôm nay
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow>
                      <CTableDataCell>
                        <CFormLabel htmlFor="inputPassword">Nước suối (350ml)</CFormLabel>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {' '}
                        {parseInt(soLuongKhach) + parseInt(soGiuongMax)} / 1 ngày
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {tinhTongSoLuong('NUOC_SUOI')}
                      </CTableDataCell>
                      <CTableDataCell>
                        <input
                          type="number"
                          className="outline-none w-24 border-b-2 border-gray-500 rounded-none text-center"
                          min={0}
                          value={soLuongNuocSuoi || ''}
                          onChange={handleChangeSoLuongNuocSuoi}
                        />
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>
                        <CFormLabel htmlFor="inputPassword">Trà</CFormLabel>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {parseInt(soLuongKhach) + parseInt(soGiuongMax)} / 1 ngày
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {tinhTongSoLuong('TRA')}
                      </CTableDataCell>
                      <CTableDataCell>
                        <input
                          type="number"
                          className="outline-none w-24 border-b-2 border-gray-500 rounded-none text-center"
                          min={0}
                          value={soLuongTra || ''}
                          onChange={handleChangeSoLuongTra}
                        />
                      </CTableDataCell>
                    </CTableRow>
                    <CTableRow>
                      <CTableDataCell>
                        <CFormLabel htmlFor="inputPassword">Cà phê</CFormLabel>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {parseInt(soLuongKhach) + parseInt(soGiuongMax)} / 1 ngày
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {tinhTongSoLuong('CAPHE')}
                      </CTableDataCell>
                      <CTableDataCell>
                        <input
                          type="number"
                          className="outline-none w-24 border-b-2 border-gray-500 rounded-none text-center"
                          min={0}
                          value={soLuongCafe || ''}
                          onChange={handleChangeSoLuongCafe}
                        />
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </CCol>
              <hr className="mb-3 " />
              <CCol sm={12}>
                <h5 className="mb-3">Lịch sử dịch vụ miễn phí</h5>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <CTable>
                    <CTableHead className="sticky-top bg-white">
                      <CTableRow>
                        <CTableHeaderCell scope="col" className="!text-blue-600">
                          Tên dịch vụ
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="!text-blue-600">
                          Số lượng
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="!text-blue-600">
                          Ngày bổ sung
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {listDichVuMienPhi.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <CFormLabel htmlFor="inputPassword">
                              {item.maDichVuMienPhi.tenDichVuMienPhi}
                            </CFormLabel>
                          </CTableDataCell>
                          <CTableDataCell>{item.soLuong}</CTableDataCell>
                          <CTableDataCell>
                            {item.ngayBoSung
                              ? format(parseISO(item.ngayBoSung), 'dd/MM/yyyy')
                              : 'N/A'}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      <CTableRow className="font-bold">
                        <CTableDataCell>
                          <CFormLabel htmlFor="inputPassword" className="!text-red-600">
                            Tổng số lượng
                          </CFormLabel>
                        </CTableDataCell>
                        <CTableDataCell className="!text-red-600">
                          {listDichVuMienPhi.reduce((total, item) => total + item.soLuong, 0)}
                        </CTableDataCell>
                        <CTableDataCell></CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton color="success" className="text-white px-3" onClick={onClickUpdatePhuThuPhong}>
              <FontAwesomeIcon icon={faCheck} /> Đồng ý
            </CButton>
          )}
          {trangthaiload && (
            <CButton color="success" disabled>
              <CSpinner as="span" size="sm" aria-hidden="true" />
              Đồng ý...
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

DichVuMienPhi.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maPhong: PropTypes.string.isRequired,
  ma_xepphong: PropTypes.string.isRequired,
  soGiuongMax: PropTypes.number.isRequired,
  maLoaiPhong: PropTypes.string.isRequired,
  soLuongKhach: PropTypes.number.isRequired,
}

export default DichVuMienPhi
