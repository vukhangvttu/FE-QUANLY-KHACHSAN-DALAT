import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
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
import { CButton } from '@coreui/react-pro'
import { getBooKingByMaBooKing } from 'src/service/BooKingService'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'

import { getListPhongTrongTheoKhoanThoiGianAndBooking } from 'src/service/PhongService'
import {
  getChiTietXepPhongByMaBooKing,
  updateXepPhongBooking,
} from 'src/service/XepPhongBooKingService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons'
import XoaXepPhongModal from '../modal/XoaXepPhongModal'

const EditXepPhong = () => {
  const { ma_booking } = useParams()

  const [chiTietXepPhongBooKing, setChiTietXepPhongBooKing] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const [phongOptions, setPhongOptions] = useState([])
  const DanhSachChiTietXepPhongBooKing = async (ma_booking) => {
    try {
      setLoading(true)

      const chitietbooking = await getChiTietXepPhongByMaBooKing(ma_booking, navigate)
      if (chitietbooking) {
        setChiTietXepPhongBooKing(chitietbooking)
      } else {
        addToast(exampleToast('Không thể tải chi tiết đặt phòng. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const fetchPhongOptions = async (maloaiphong) => {
    if (!booKing?.ngayDen || !booKing?.ngayDi) {
      addToast(exampleToast('Dữ liệu chưa sẵn sàng, vui lòng load lại trang.'))
      return // Không gọi API nếu thiếu ngày đến hoặc ngày đi
    }

    try {
      const ngayDenFormatted = format(new Date(booKing.ngayDen), 'yyyy-MM-dd')
      const ngayDiFormatted = format(new Date(booKing.ngayDi), 'yyyy-MM-dd')

      const phong = await getListPhongTrongTheoKhoanThoiGianAndBooking(
        maloaiphong,
        ngayDenFormatted,
        ngayDiFormatted,
        ma_booking,
        navigate,
      )
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
    if (chiTietXepPhongBooKing.length === 0) return
    const promises = chiTietXepPhongBooKing.map((item) =>
      fetchPhongOptions(item.phong.loaiPhong.maLoaiPhong),
    )
    await Promise.all(promises)
  }

  const [booKing, setBooKing] = useState({})

  const BooKing = async (ma_booking) => {
    try {
      // Gọi API lấy thông tin booking
      const booking = await getBooKingByMaBooKing(ma_booking, navigate)

      if (booking) {
        // Gọi API lấy chi tiết booking

        setBooKing(booking)
      } else {
        addToast(exampleToast('Không thể tải thông tin đặt phòng. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [isInitialLoad, setIsInitialLoad] = useState(false)

  // Lần đầu tiên gọi dữ liệu booking và chi tiết xếp phòng
  useEffect(() => {
    BooKing(ma_booking)
    DanhSachChiTietXepPhongBooKing(ma_booking)
  }, [ma_booking])

  // Chỉ gọi fetchAllPhongOptions khi booking đã có dữ liệu và chiTietXepPhongBooKing đã có dữ liệu
  useEffect(() => {
    if (
      !isInitialLoad &&
      chiTietXepPhongBooKing.length > 0 &&
      booKing?.ngayDen &&
      booKing?.ngayDi
    ) {
      fetchAllPhongOptions()
      setIsInitialLoad(true)
    }
  }, [chiTietXepPhongBooKing, booKing?.ngayDen, booKing?.ngayDi, isInitialLoad])

  const handleMaPhongChangeDaXepPhong = (event, stt) => {
    const selectedMaPhong = event.target.value

    // Kiểm tra nếu phòng đã được chọn trong các mục khác
    const isDuplicate = chiTietXepPhongBooKing.some(
      (item) => item.phong.maPhong === selectedMaPhong && item.stt !== stt,
    )

    if (isDuplicate) {
      addToast(exampleToast('Phòng này đã được chọn. Vui lòng chọn phòng khác!'))
      return
    }

    // Cập nhật nếu không trùng
    setChiTietXepPhongBooKing((prev) =>
      prev.map((item) =>
        item.stt === stt ? { ...item, phong: { ...item.phong, maPhong: selectedMaPhong } } : item,
      ),
    )
  }

  // SAVE XẾP PHÒNG

  const [trangthaiload, setTrangthaiload] = useState(false)
  const handleClickSaveXepPhong = async () => {
    // 1. Kiểm tra mã booking chính
    if (!ma_booking) {
      return addToast(exampleToast('⚠️ Mã booking đang không hợp lệ'))
    }

    // 3. Kiểm tra chi tiết trong mảng nhanPhong
    const invalidMessage = chiTietXepPhongBooKing.some((item) => {
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
      setTrangthaiload(true)
      // 5. Gọi API nếu dữ liệu hợp lệ
      const response = await updateXepPhongBooking(ma_booking, chiTietXepPhongBooKing, navigate)

      console.log('createXepPhongBooking successfully:', response)

      setTrangthaiload(false)
      // 6. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        addToast(exampleToast('✔️ ' + response.message))
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangthaiload(false)
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

  const [visibleXoaXP, setVisibleXoaXP] = useState(false)

  const handleChoXyLyXoaXepPhong = (data) => {
    if (data === true) {
      navigate(`/dashboard/pos/danh-sach-booking/add-xep-phong/${ma_booking}`)
    }
  }

  // console.log('chi tiết', nhanPhong)
  console.log('chi tiết', chiTietXepPhongBooKing)
  console.log('booking', booKing)

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
    <div>
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      <CCard>
        <CCardBody>
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
                    GuestName:{' '}
                    {`${booKing?.danhXung?.maDanhXung} ${booKing?.khachHangBooKing?.hoKhachHangBooking} ${booKing?.khachHangBooKing?.tenKhachHangBooking}`}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Ngày đến:{' '}
                    {booKing?.ngayDen ? format(parseISO(booKing?.ngayDen), 'dd/MM/yyyy') : 'N/A'}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Ngày đi:{' '}
                    {booKing?.ngayDi ? format(parseISO(booKing?.ngayDi), 'dd/MM/yyyy') : 'N/A'}
                  </CFormLabel>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Số lượng: {booKing?.tongSoLuong}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Trạng thái: {booKing?.trangThaiBooKing?.tenTrangThaiBooKing}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Tổng tiền: {(booKing?.tonngTien || 0).toLocaleString('en-US')}
                  </CFormLabel>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Thời gian:{' '}
                    {booKing?.thoigiantao && !isNaN(Date.parse(booKing?.thoigiantao))
                      ? format(parseISO(booKing?.thoigiantao), 'dd/MM/yyyy HH:mm')
                      : 'N/A'}
                  </CFormLabel>
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="inputPassword" className="col-form-label labelcustome">
                    Yêu cầu:{' '}
                    {booKing?.yeuCaus?.map((element, index) => (
                      <span key={index}>
                        {element.dienGiai}
                        {index < booKing?.yeuCaus.length - 1 ? ', ' : ''}
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
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Loại Phòng
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-red-500">
                        Số Phòng
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Ngày Đến
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Giờ Đến
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Ngày Đi
                      </CTableHeaderCell>

                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Giờ Đi
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Số đêm
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Loại giá
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Giá
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-500">
                        Thành tiền
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9">Đang tải...</CTableDataCell>
                      </CTableRow>
                    ) : chiTietXepPhongBooKing.length > 0 ? (
                      chiTietXepPhongBooKing.map((item, itemIndex) => {
                        const stt = item.stt ? `${item.stt}` : `${itemIndex}` // Đảm bảo key duy nhất
                        const selectedMaPhong =
                          item.phong?.maPhong ||
                          chiTietXepPhongBooKing.find((p) => p.stt === stt)?.phong?.maPhong ||
                          ''
                        const selectedPhongs = chiTietXepPhongBooKing
                          .filter((_, idx) => idx !== itemIndex)
                          .map((p) => p.phong?.maPhong)
                          .filter(Boolean) // Loại bỏ undefined/null

                        // Tìm phòng hiện tại đang được chọn
                        const currentPhong = (
                          phongOptions[item.phong?.loaiPhong?.maLoaiPhong] || []
                        ).find((phong) => phong.maPhong === selectedMaPhong)

                        return (
                          <CTableRow key={stt}>
                            <CTableDataCell>
                              {item.phong?.loaiPhong?.tenLoaiPhong || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormSelect
                                className={`border-none focus:ring-0 outline-none font-bold ${
                                  currentPhong?.daDo ? 'text-red-500' : 'text-blue-700'
                                }`}
                                size="sm"
                                value={selectedMaPhong}
                                onChange={(e) => handleMaPhongChangeDaXepPhong(e, stt)}
                              >
                                <option value="" disabled>
                                  Chọn phòng
                                </option>
                                {(phongOptions[item.phong?.loaiPhong?.maLoaiPhong] || [])
                                  .filter((phong) => {
                                    const currentSelectedMaPhong = item.phong?.maPhong || ''
                                    return (
                                      !selectedPhongs.includes(phong.maPhong) ||
                                      phong.maPhong === currentSelectedMaPhong
                                    )
                                  })
                                  .map((phong) => (
                                    <option
                                      className={
                                        phong.daDo
                                          ? 'text-red-500 font-bold'
                                          : 'text-blue-600 font-bold'
                                      }
                                      key={phong.maPhong}
                                      value={phong.maPhong}
                                    >
                                      {phong.tenPhong} {phong.soGiuongThem === 1 ? '(Extra' : ''},{' '}
                                      {phong.daDo ? 'Dơ' : 'Sạch'})
                                    </option>
                                  ))}
                              </CFormSelect>
                            </CTableDataCell>
                            <CTableDataCell>
                              {item.ngayDen ? format(parseISO(item.ngayDen), 'dd/MM/yyyy') : 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>{item.gioDen?.slice(0, 5) || 'N/A'}</CTableDataCell>
                            <CTableDataCell>
                              {item.ngayDi ? format(parseISO(item.ngayDi), 'dd/MM/yyyy') : 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>{item.gioDi?.slice(0, 5) || 'N/A'}</CTableDataCell>
                            <CTableDataCell>{item.soDem}</CTableDataCell>
                            <CTableDataCell>{item.loaiGia?.tenLoaiGia || 'N/A'}</CTableDataCell>
                            <CTableDataCell>
                              {item.gia?.toLocaleString('en-US') || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {(item.gia * item.soDem).toLocaleString('en-US')}
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="9">Không có dữ liệu để hiển thị.</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCol>
            </div>
          </div>
          <CCol className="d-grid gap-2 d-md-flex justify-content-md-end">
            <CButton
              color="danger"
              className="font-semibold"
              variant="outline"
              onClick={() => setVisibleXoaXP(true)}
            >
              <FontAwesomeIcon icon={faTrash} /> Delete
            </CButton>

            {!trangthaiload && (
              <CButton
                color="success"
                className="text-white px-4"
                onClick={handleClickSaveXepPhong}
              >
                <FontAwesomeIcon icon={faFloppyDisk} /> Update
              </CButton>
            )}
            {trangthaiload && (
              <CButton color="success" disabled>
                <CSpinner as="span" size="sm" aria-hidden="true" />
                Update...
              </CButton>
            )}
          </CCol>
        </CCardBody>
      </CCard>

      <XoaXepPhongModal
        visible={visibleXoaXP}
        onClose={() => setVisibleXoaXP(false)}
        onSubmit={handleChoXyLyXoaXepPhong}
        ma_booking={ma_booking}
      />
    </div>
  )
}

export default EditXepPhong
