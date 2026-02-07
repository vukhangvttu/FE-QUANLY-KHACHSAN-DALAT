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
  CDatePicker,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { useNavigate } from 'react-router-dom'
import { createDichVuMienPhi, getListDichVuMienPhi, getAllDichVuMienPhi } from 'src/service/XepPhongBooKingService'

import { format, parseISO } from 'date-fns'

const DichVuMienPhi = ({
  visible,
  onClose,
  maPhong,
  ma_xepphong,
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

  const [listDichVuMienPhi, setListDichVuMienPhi] = useState([])
  const [allDichVuMienPhi, setAllDichVuMienPhi] = useState([])
  const [soLuongDichVu, setSoLuongDichVu] = useState({})
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Tính tổng số lượng cho từng loại dịch vụ
  const tinhTongSoLuong = (maDichVu) => {
    return listDichVuMienPhi
      .filter((item) => item.maDichVuMienPhi.maDichVuMienPhi === maDichVu)
      .reduce((total, item) => total + item.soLuong, 0)
  }

  const fetchAllDichVuMienPhi = async () => {
    try {
      const response = await getAllDichVuMienPhi(navigate)
      if (response) {
        setAllDichVuMienPhi(response)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách dịch vụ miễn phí:', error)
      addToast(exampleToast('Lỗi khi tải danh sách dịch vụ'))
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await getListDichVuMienPhi(ma_xepphong, navigate)
      if (response) {
        // Lấy ngày được chọn theo định dạng YYYY-MM-DD
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

        // Lọc các dịch vụ có ngày bổ sung là ngày được chọn
        const selectedDayServices = response.filter((item) => item.ngayBoSung === selectedDateStr)

        // Cập nhật số lượng cho từng loại dịch vụ động
        const soLuongTemp = {}
        selectedDayServices.forEach((item) => {
          const maDichVu = item.maDichVuMienPhi.maDichVuMienPhi
          soLuongTemp[maDichVu] = item.soLuong
        })
        setSoLuongDichVu(soLuongTemp)

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
      fetchAllDichVuMienPhi()
      fetchData()
    }
  }, [visible, selectedDate])

  const [dichVuMienPhiList, setDichVuMienPhiList] = useState([])

  const handleChangeSoLuong = (maDichVu, value) => {
    const soluong = Math.abs(parseInt(value.target.value) || 0)
    
    setSoLuongDichVu((prev) => ({
      ...prev,
      [maDichVu]: soluong,
    }))

    setDichVuMienPhiList((prevList) => {
      const filteredList = prevList.filter(
        (item) => item.dichVuMienPhi.maDichVuMienPhi !== maDichVu,
      )
      if (soluong > 0) {
        return [
          ...filteredList,
          {
            xepPhongBooking: { maChiTietBooking: ma_xepphong },
            dichVuMienPhi: { maDichVuMienPhi: maDichVu },
            soLuong: soluong,
            ngayBoSung: format(selectedDate, 'yyyy-MM-dd'),
          },
        ]
      }
      return filteredList
    })
  }

  const onClickUpdatePhuThuPhong = async () => {
    if (!ma_xepphong) {
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))
    }

    try {
      setTrangthaiload(true)
      const response = await createDichVuMienPhi(
        dichVuMienPhiList,
        ma_xepphong,
        format(selectedDate, 'yyyy-MM-dd'),
        navigate
      )
      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }
      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ ' + response.message + ' Phòng ' + maPhong))

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
        scrollable
        backdrop="static"
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
          <CRow className="mb-3">
            <CCol sm={12} md={6}>
              <CFormLabel className="font-semibold">Chọn ngày:</CFormLabel>
              <CDatePicker
                locale="en-GB"
                date={selectedDate}
                onDateChange={(date) => {
                  if (date) {
                    setSelectedDate(date)
                  }
                }}
                placeholder="Chọn ngày"
              />
            </CCol>
          </CRow>
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
                       <CTableHeaderCell scope="col" className="!text-blue-600 ">
                       ĐVT
                      </CTableHeaderCell>
                      {/* <CTableHeaderCell scope="col" className="!text-blue-600 text-center">
                        Số lượng tối đa
                      </CTableHeaderCell> */}
                       
                      <CTableHeaderCell scope="col" className="!text-blue-600 text-center">
                        Tổng số lượng
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Số lượng 
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {allDichVuMienPhi.map((dichVu) => {
                      const tongSoLuong = tinhTongSoLuong(dichVu.maDichVuMienPhi)
                      const soLuongHienTai = soLuongDichVu[dichVu.maDichVuMienPhi] || 0
                      
                      return (
                        <CTableRow key={dichVu.maDichVuMienPhi}>
                          <CTableDataCell>
                            <CFormLabel>{dichVu.tenDichVuMienPhi}</CFormLabel>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormLabel>{dichVu.donViTinh}</CFormLabel>
                          </CTableDataCell>
                          {/* <CTableDataCell className="text-center">
                            {parseInt(soLuongKhach) + parseInt(soGiuongMax)} / 1 ngày
                          </CTableDataCell> */}
                           
                          <CTableDataCell className="text-center">
                            {tongSoLuong}
                          </CTableDataCell>
                          <CTableDataCell>
                            <input
                              type="number"
                              className="outline-none w-24 border-b-2 border-gray-500 rounded-none text-center"
                              min={0}
                              value={soLuongHienTai || ''}
                              onChange={(e) => handleChangeSoLuong(dichVu.maDichVuMienPhi, e)}
                            />
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
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
                           <CTableHeaderCell scope="col" className="!text-blue-600">
                          Người thêm
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
                           <CTableDataCell>
                            {item.nguoiTao}
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
              <FontAwesomeIcon icon={faCheck} /> Lưu
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
