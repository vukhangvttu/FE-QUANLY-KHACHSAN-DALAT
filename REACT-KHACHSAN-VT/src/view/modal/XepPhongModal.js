import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModalFooter,
  CRow,
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
import { getChiTietBooKingByMaBooKing } from 'src/service/BooKingService'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

import { getPhongByMaLoaiPhong } from 'src/service/PhongService'
import {
  createXepPhongBooking,
  getChiTietXepPhongByMaBooKing,
} from 'src/service/XepPhongBooKingService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

const XepPhongModal = ({
  visible,
  onClose,
  ma_booking,
  name,
  ngayDen,
  ngayDi,
  soLuong,
  trangThai,
  tongTien,
  yeuCaus,
  thoiGianTao,
  daXepPhong,
}) => {
  console.log('mabooking', ma_booking)
  const [chiTietBooKing, setChiTietBooKing] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const [phongOptions, setPhongOptions] = useState([])
  const DanhSachChiTietBooKing = async (ma_booking) => {
    try {
      setLoading(true)

      if (daXepPhong) {
        const chitietbooking = await getChiTietXepPhongByMaBooKing(ma_booking, navigate)
        if (chitietbooking) {
          setChiTietBooKing(chitietbooking)
        } else {
          addToast(exampleToast('Không thể tải chi tiết đặt phòng. Vui lòng thử lại sau!'))
        }
      } else {
        const chitietbooking = await getChiTietBooKingByMaBooKing(ma_booking, navigate)
        if (chitietbooking) {
          setChiTietBooKing(chitietbooking)
        } else {
          addToast(exampleToast('Không thể tải chi tiết đặt phòng. Vui lòng thử lại sau!'))
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const fetchPhongOptions = async (maloaiphong) => {
    try {
      const phong = await getPhongByMaLoaiPhong(maloaiphong, navigate)
      console.log('phong', phong)
      if (phong) {
        setPhongOptions((prevOptions) => ({
          ...prevOptions,
          [maloaiphong]: phong,
        }))
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const fetchAllPhongOptions = async () => {
    if (chiTietBooKing.length === 0) return
    if (daXepPhong) {
      const promises = chiTietBooKing.map((item) =>
        fetchPhongOptions(item.phong.loaiPhong.maLoaiPhong),
      )
      await Promise.all(promises)
    } else {
      const promises = chiTietBooKing.map((item) => fetchPhongOptions(item.loaiPhong.maLoaiPhong))
      await Promise.all(promises)
    }
  }

  // const fetchAllPhongOptions = async () => {
  //   if (chiTietBooKing.length === 0) return
  //   const promises = chiTietBooKing.map((item) => fetchPhongOptions(item.loaiPhong.maLoaiPhong))
  //   await Promise.all(promises)
  // }
  useEffect(() => {
    if (visible) {
      DanhSachChiTietBooKing(ma_booking)
    }
  }, [visible, ma_booking])

  useEffect(() => {
    if (visible) {
      if (chiTietBooKing.length > 0) {
        fetchAllPhongOptions()
      }
    }
  }, [chiTietBooKing])

  useEffect(() => {
    if (daXepPhong === false) {
      if (chiTietBooKing.length > 0) {
        // Tạo mảng phòng cần thiết dựa trên chiTietBooKing và soLuong
        const newNhanPhong = chiTietBooKing.flatMap((item) =>
          Array.from({ length: item.soLuong || 0 }, (_, index) => ({
            booKing: { maBooking: ma_booking },
            phong: { maPhong: '' },
            loaiPhong: item.loaiPhong.maLoaiPhong,
            loaiGia: { maLoaiGia: item.loaiGia.maLoaiGia },
            gia: item.gia,
            stt: `${item.loaiPhong.maLoaiPhong}-${index + 1}`, // Thêm số thứ tự phân biệt
            ngayDen: item.ngayDen,
            ngayDi: item.ngayDi,
            gioDen: item.gioDen,
            gioDi: item.gioDi,
          })),
        )
        setNhanPhong(newNhanPhong)
      }
    }
  }, [chiTietBooKing, ma_booking])

  const [nhanPhong, setNhanPhong] = useState([])

  // Hàm xử lý thay đổi phòng
  const handleMaPhongChange = (event, stt) => {
    const selectedMaPhong = event.target.value

    setNhanPhong((prev) =>
      prev.map((item) =>
        item.stt === stt ? { ...item, phong: { maPhong: selectedMaPhong } } : item,
      ),
    )
  }

  const handleMaPhongChangeDaXepPhong = (event, stt) => {
    const selectedMaPhong = event.target.value

    setChiTietBooKing((prev) =>
      prev.map((item) =>
        item.stt === stt ? { ...item, phong: { ...item.phong, maPhong: selectedMaPhong } } : item,
      ),
    )
  }

  // SAVE XẾP PHÒNG

  const handleClickSaveXepPhong = async () => {
    console.log('oke')

    // 1. Kiểm tra mã booking chính
    if (!ma_booking) {
      return addToast(exampleToast('⚠️ Mã booking đang không hợp lệ'))
    }

    // 2. Kiểm tra danh sách xếp phòng trống
    if (nhanPhong.length === 0) {
      return addToast(exampleToast('⚠️ Danh sách xếp phòng đang trống'))
    }

    // 3. Kiểm tra chi tiết trong mảng nhanPhong
    const invalidMessage = nhanPhong.some((item) => {
      if (!item.booKing?.maBooking) {
        addToast(exampleToast('⚠️ Mã booking chi tiết xếp phòng không hợp lệ'))
        return true
      }

      if (item.gia <= 0) {
        addToast(exampleToast('⚠️ Giá loại phòng trong chi tiết xếp phòng không hợp lệ'))
        return true
      }

      if (!item.phong?.maPhong) {
        addToast(exampleToast('⚠️ Bạn chưa chọn số phòng để xếp'))
        return true
      }

      return false
    })

    // 4. Nếu có lỗi thì dừng không gọi API
    if (invalidMessage) return

    try {
      // 5. Gọi API nếu dữ liệu hợp lệ
      const response = await createXepPhongBooking(ma_booking, nhanPhong, navigate)

      console.log('createXepPhongBooking successfully:', response)

      // 6. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))
      }
    } catch (error) {
      console.error('Error:', error)

      // 7. Xử lý lỗi khi gọi API
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
    }
  }

  // console.log('chi tiết', nhanPhong)
  console.log('chi tiết', chiTietBooKing)
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const exampleToast = (message) => (
    <CToast>
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
        <small>Thông báo biến mất sau 5 giây</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )
  return (
    <>
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      <CModal
        size="xl"
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold">
            Xếp phòng
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="relative mb-3">
            <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
              Thông tin booking
            </span>
            <div className="border-2 border-gray-500 rounded-md p-3 ">
              <CRow>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    BK-ID: {ma_booking}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    GuestName: {name}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Ngày đến: {ngayDen ? format(parseISO(ngayDen), 'dd/MM/yyyy') : 'N/A'}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Ngày đi: {ngayDi ? format(parseISO(ngayDi), 'dd/MM/yyyy') : 'N/A'}
                  </CFormLabel>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Số lượng: {soLuong}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Trạng thái: {trangThai}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Tổng tiền: {(tongTien || 0).toLocaleString('en-US')}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Thời gian:{' '}
                    {thoiGianTao && !isNaN(Date.parse(thoiGianTao))
                      ? format(parseISO(thoiGianTao), 'dd/MM/yyyy HH:mm')
                      : 'N/A'}
                  </CFormLabel>
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Yêu cầu:{' '}
                    {yeuCaus?.map((element, index) => (
                      <span key={index}>
                        {element.dienGiai}
                        {index < yeuCaus.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </CFormLabel>
                </CCol>
              </CRow>
            </div>
          </div>

          <div className="relative mb-3">
            <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
              Thông tin xếp phòng
            </span>
            <div className="border-2 border-gray-500 rounded-md p-2 ">
              <CCol>
                <CTable>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Loại Phòng</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Số Phòng</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Ngày Đến</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giờ Đến</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Ngày Đi</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giờ Đi</CTableHeaderCell>

                      <CTableHeaderCell scope="col">Loại giá</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giá</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {chiTietBooKing.flatMap((item, itemIndex) => {
                      const rows = daXepPhong
                        ? // Trường hợp đã xếp phòng
                          [item].map((_, i) => {
                            // Tạo key duy nhất cho mỗi dòng
                            const stt = `${item.stt}`

                            // Lấy giá trị phòng đã chọn từ database hoặc từ nhanPhong
                            const selectedMaPhong =
                              item.phong.maPhong ||
                              nhanPhong.find((p) => p.stt === stt)?.phong.maPhong ||
                              ''

                            // Lấy danh sách các phòng đã chọn ở các dòng khác
                            const selectedPhongs = chiTietBooKing
                              .filter((_, idx) => idx !== itemIndex) // Bỏ qua phòng hiện tại
                              .map((p) => p.phong.maPhong)

                            return (
                              <CTableRow key={stt}>
                                <CTableDataCell>{item.phong.loaiPhong.tenLoaiPhong}</CTableDataCell>

                                <CTableDataCell>
                                  <CFormSelect
                                    className="border-none focus:ring-0 outline-none text-blue-700 font-bold"
                                    size="sm"
                                    value={selectedMaPhong}
                                    onChange={(e) => handleMaPhongChangeDaXepPhong(e, stt)}
                                  >
                                    <option value="" disabled>
                                      Chọn phòng
                                    </option>
                                    {(phongOptions[item.phong.loaiPhong.maLoaiPhong] || [])
                                      .filter((phong) => {
                                        // Lọc phòng đã chọn, nhưng vẫn hiển thị phòng hiện tại (selectedMaPhong)
                                        return (
                                          !selectedPhongs.includes(phong.maPhong) ||
                                          phong.maPhong === selectedMaPhong
                                        )
                                      })
                                      .map((phong) => (
                                        <option key={phong.maPhong} value={phong.maPhong}>
                                          {phong.tenPhong} (Mã phòng: {phong.maPhong})
                                        </option>
                                      ))}
                                  </CFormSelect>
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.ngayDen
                                    ? format(parseISO(item.ngayDen), 'dd/MM/yyyy')
                                    : 'N/A'}
                                </CTableDataCell>
                                <CTableDataCell>{item.gioDen?.slice(0, 5) || 'N/A'}</CTableDataCell>
                                <CTableDataCell>
                                  {item.ngayDi
                                    ? format(parseISO(item.ngayDi), 'dd/MM/yyyy')
                                    : 'N/A'}
                                </CTableDataCell>
                                <CTableDataCell>{item.gioDi?.slice(0, 5) || 'N/A'}</CTableDataCell>
                                <CTableDataCell>{item.loaiGia.tenLoaiGia}</CTableDataCell>
                                <CTableDataCell>{item.gia.toLocaleString('en-US')}</CTableDataCell>
                                <CTableDataCell>{i + 1}</CTableDataCell>
                              </CTableRow>
                            )
                          })
                        : // Trường hợp chưa nhận phòng
                          Array.from({ length: item.soLuong || 0 }, (_, i) => {
                            const stt = `${item.loaiPhong.maLoaiPhong}-${i + 1}`
                            const selectedMaPhong =
                              nhanPhong.find((p) => p.stt === stt)?.phong.maPhong || ''

                            return (
                              <CTableRow key={stt}>
                                <CTableDataCell>{item.loaiPhong.tenLoaiPhong}</CTableDataCell>

                                <CTableDataCell>
                                  <CFormSelect
                                    className="border-none focus:ring-0 outline-none text-blue-700 font-bold"
                                    size="sm"
                                    value={selectedMaPhong}
                                    onChange={(e) => handleMaPhongChange(e, stt)}
                                  >
                                    <option value="" disabled>
                                      Chọn phòng
                                    </option>
                                    {(phongOptions[item.loaiPhong.maLoaiPhong] || [])
                                      .filter((phong) => {
                                        const selectedPhongs = nhanPhong
                                          .filter(
                                            (p) =>
                                              p.loaiPhong === item.loaiPhong.maLoaiPhong &&
                                              p.stt !== stt,
                                          )
                                          .map((p) => p.phong.maPhong)

                                        return !selectedPhongs.includes(phong.maPhong)
                                      })
                                      .map((phong) => (
                                        <option key={phong.maPhong} value={phong.maPhong}>
                                          {phong.tenPhong} (Mã phòng: {phong.maPhong})
                                        </option>
                                      ))}
                                  </CFormSelect>
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.ngayDen
                                    ? format(parseISO(item.ngayDen), 'dd/MM/yyyy')
                                    : 'N/A'}
                                </CTableDataCell>
                                <CTableDataCell>{item.gioDen?.slice(0, 5) || 'N/A'}</CTableDataCell>
                                <CTableDataCell>
                                  {item.ngayDi
                                    ? format(parseISO(item.ngayDi), 'dd/MM/yyyy')
                                    : 'N/A'}
                                </CTableDataCell>
                                <CTableDataCell>{item.gioDi?.slice(0, 5) || 'N/A'}</CTableDataCell>
                                <CTableDataCell>{item.loaiGia.tenLoaiGia}</CTableDataCell>
                                <CTableDataCell>{item.gia.toLocaleString('en-US')}</CTableDataCell>
                                <CTableDataCell>{i + 1}</CTableDataCell>
                              </CTableRow>
                            )
                          })

                      return rows
                    })}
                  </CTableBody>
                </CTable>
              </CCol>
            </div>
          </div>
          <CFormTextarea
            id="exampleFormControlTextarea1"
            rows={3}
            placeholder="Nhập ghi chú"
          ></CFormTextarea>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose}>
            Close
          </CButton>
          {daXepPhong === false ? (
            <CButton color="success" className="text-white px-4" onClick={handleClickSaveXepPhong}>
              <FontAwesomeIcon icon={faFloppyDisk} /> Save
            </CButton>
          ) : (
            <CButton color="success" className="text-white px-4" onClick={handleClickSaveXepPhong}>
              <FontAwesomeIcon icon={faFloppyDisk} /> Update
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

XepPhongModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  onSubmit: PropTypes.func,
  ma_booking: PropTypes.string,
  name: PropTypes.string,
  ngayDen: PropTypes.string,
  ngayDi: PropTypes.string,
  loaiPhong: PropTypes.array,
  soLuong: PropTypes.number,
  trangThai: PropTypes.string,
  tongTien: PropTypes.number,
  thoiGianTao: PropTypes.string,
  yeuCaus: PropTypes.array,
  daXepPhong: PropTypes.bool,
}
export default XepPhongModal
