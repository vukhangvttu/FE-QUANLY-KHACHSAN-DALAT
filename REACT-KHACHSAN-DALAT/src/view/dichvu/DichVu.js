import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
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
import { faCirclePlus, faFloppyDisk, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import DichVuModal from './DichVuModal'
import { getAllPhieuDichVuByMaBooKing, updatePhieuDichVu } from 'src/service/DichVu'
import CurrencyInput from 'react-currency-input-field'
import XoaDichVuTrongPhieuModal from '../modal/XoaDichVuTrongPhieuModal'
import { getXepPhongByMaXepPhong } from 'src/service/XepPhongBooKingService'

const DichVu = () => {
  const { ma_phong, ma_booking, ma_xepphong_booking } = useParams()

  const [danhSachPhieuDichVu, setDanhSachPhieuDichVu] = useState([])
  const [chiTietXepPhong, setChiTietXepPhong] = useState([])

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (ma_booking) {
      fetchData()
    }
  }, [ma_booking]) // Chạy khi `ma_booking` thay đổi

  const fetchData = async () => {
    try {
      setLoading(true)

      // Chạy hai API song song
      const [phieuDichVuData, chiTietBookingData] = await Promise.all([
        getAllPhieuDichVuByMaBooKing(ma_xepphong_booking, navigate),
        getXepPhongByMaXepPhong(ma_xepphong_booking, navigate),
      ])

      // Xử lý danh sách phiếu dịch vụ
      if (phieuDichVuData) {
        const isSameData = JSON.stringify(danhSachPhieuDichVu) === JSON.stringify(phieuDichVuData)
        if (!isSameData) {
          setDanhSachPhieuDichVu(phieuDichVuData)
          setTongSoLuong(phieuDichVuData.reduce((sum, item) => sum + item.soLuong, 0))
          setTongThanhTien(phieuDichVuData.reduce((sum, item) => sum + item.thanhTien, 0))
        }
      } else {
        addToast(exampleToast('Không thể tải danh sách phiếu dịch vụ. Vui lòng thử lại sau!'))
      }

      // Xử lý danh sách chi tiết booking
      if (chiTietBookingData) {
        setChiTietXepPhong(chiTietBookingData)
      } else {
        addToast(exampleToast('Không thể tải chi tiết xếp phòng. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const [visibleDichVu, setvisibleDichVu] = useState(false)

  const DanhSachDichVuTrongPhong = async (ma_xepphong_booking) => {
    try {
      setLoading(true)

      const dichVu = await getAllPhieuDichVuByMaBooKing(ma_xepphong_booking, navigate)
      if (dichVu) {
        setDanhSachPhieuDichVu(dichVu)

        setTongSoLuong(dichVu.reduce((sum, item) => sum + item.soLuong, 0))
        setTongThanhTien(dichVu.reduce((sum, item) => sum + item.thanhTien, 0))
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
  const ChoXyLyThemDichVu = (data) => {
    if (data) {
      DanhSachDichVuTrongPhong(ma_xepphong_booking)
      setvisibleDichVu(false)
    }
  }

  const [tongSoLuong, setTongSoLuong] = useState(0) // Lưu tổng số lượng
  const [tongThanhTien, setTongThanhTien] = useState(0)

  const handleGhiChu = (maDichVu, ghiChu) => {
    setDanhSachPhieuDichVu((prev) =>
      prev.map((item) => (item.dichVu.maDichVu === maDichVu ? { ...item, ghiChu: ghiChu } : item)),
    )
  }

  const handleChangeQuantity = (maPhieuDichVu, newQuantity) => {
    if (newQuantity < 1) return // Đảm bảo số lượng không nhỏ hơn 1

    setDanhSachPhieuDichVu((prev) => {
      let totalQuantity = 0 // Tổng số lượng tạm thời
      let totalPrice = 0 // Tổng thành tiền tạm thời

      const updatedList = prev.map((item) => {
        if (item.maPhieuDichVu === maPhieuDichVu) {
          const updatedItem = {
            ...item,
            soLuong: newQuantity,
            thanhTien: newQuantity * item.gia, // ✔️ Cập nhật tổng tiền cho từng item
          }
          totalQuantity += updatedItem.soLuong
          totalPrice += updatedItem.thanhTien
          return updatedItem
        } else {
          totalQuantity += item.soLuong
          totalPrice += item.thanhTien
          return item
        }
      })

      setTongSoLuong(totalQuantity) // ✔️ Cập nhật tổng số lượng
      setTongThanhTien(totalPrice) // ✔️ Cập nhật tổng thành tiền

      return updatedList
    })
  }

  const handleGiaChange = (event, maPhieuDichVu) => {
    const input = event.target
    const cursorPosition = input.selectionStart // Lấy vị trí con trỏ hiện tại
    const inputValue = input.value

    // Loại bỏ các ký tự không phải số
    const rawValue = inputValue.replace(/[^\d]/g, '')

    if (!isNaN(rawValue)) {
      // Chuyển đổi thành số và đảm bảo không âm
      const value = Math.max(0, Number(rawValue))

      // Định dạng lại giá trị với dấu phẩy phân cách ngàn
      const formattedValue = value.toLocaleString('en-US')

      setDanhSachPhieuDichVu((prev) => {
        let totalPrice = 0 // Biến tạm để tính tổng thành tiền

        const updatedList = prev.map((item) => {
          if (item.maPhieuDichVu === maPhieuDichVu) {
            const updatedItem = {
              ...item,
              gia: value, // Cập nhật giá
              thanhTien: value * item.soLuong, // Cập nhật tổng tiền cho item
            }
            totalPrice += updatedItem.thanhTien
            return updatedItem
          } else {
            totalPrice += item.thanhTien
            return item
          }
        })

        setTongThanhTien(totalPrice) // ✔️ Cập nhật tổng thành tiền
        return updatedList
      })

      // Tính toán vị trí con trỏ mới dựa trên sự thay đổi độ dài chuỗi
      const diff = formattedValue.length - inputValue.length
      const newCursorPosition = cursorPosition + (diff > 0 ? diff : 0)

      // Đặt lại vị trí con trỏ sau khi render
      setTimeout(() => input.setSelectionRange(newCursorPosition, newCursorPosition), 0)
    }
  }

  const [trangthaiload, setTrangthaiload] = useState(false)

  const handleSubmit = async () => {
    if (ma_booking === '' || ma_booking === undefined || ma_booking === null)
      return addToast(exampleToast('⚠️ Mã booking không hợp lệ'))
    if (danhSachPhieuDichVu.length === 0) return addToast(exampleToast('⚠️ Bạn chưa thêm dịch vụ.'))

    const isInvalidDetail = danhSachPhieuDichVu.some((item) => {
      if (
        !item?.xepPhongBooKing.maXepPhongBooking ||
        item.xepPhongBooKing.maXepPhongBooking === '0'
      ) {
        addToast(exampleToast('⚠️ Mã xếp phòng booking không hợp lệ'))
        return true
      }
      if (!item?.dichVu.maDichVu || item.dichVu.maDichVu === '0') {
        addToast(exampleToast('⚠️ Mã dịch vụ không hợp lệ'))
        return true
      }
      if (!item?.soLuong || item.soLuong <= 0) {
        addToast(exampleToast('⚠️ Chưa nhập số lượng'))
        return true
      }
      if (item?.gia === '' || item.gia <= 0) {
        addToast(exampleToast('⚠️ Giá không hợp lệ'))
        return true
      }
    })

    if (isInvalidDetail) return

    try {
      setTrangthaiload(true)

      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await updatePhieuDichVu(
        ma_booking,
        ma_phong,
        ma_xepphong_booking,
        danhSachPhieuDichVu,
        navigate,
      )

      console.log('Phieudichvu update successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ ' + response.message))
        } else {
          addToast(exampleToast('❌ Thêm dịch vụ không thành công!'))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setTrangthaiload(false)
      // 6. Xử lý lỗi khi gọi API
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
  const [loadingDichVu, setLoadingDichVu] = useState(false)

  const [visibleHTXoaDichVu, setVisibleHTXoaDichVu] = useState(false)
  const [maPhieuDichVu, setMaPhieuDichVu] = useState('')
  const [tenDichVu, setTenDichVu] = useState('')
  const handleClickHienThiXoa = (maPhieuDichVu, tenDichVu) => {
    setMaPhieuDichVu(maPhieuDichVu)
    console.log(tenDichVu)
    setTenDichVu(tenDichVu)
    setVisibleHTXoaDichVu(true)
  }

  const ChoXyLyXoaDichVu = (data) => {
    if (data.trangthai) {
      setLoadingDichVu(true)
      setDanhSachPhieuDichVu((prev) => {
        const updatedList = prev.filter((item) => item.maPhieuDichVu !== data.maPhieuDichVu)

        // Tính tổng số lượng và tổng thành tiền mới
        const totalQuantity = updatedList.reduce((sum, item) => sum + item.soLuong, 0)
        const totalPrice = updatedList.reduce((sum, item) => sum + item.thanhTien, 0)

        // Cập nhật tổng số lượng và tổng thành tiền
        setTongSoLuong(totalQuantity)
        setTongThanhTien(totalPrice)

        return updatedList
      })
      setTimeout(() => {
        setLoadingDichVu(false)
        setVisibleHTXoaDichVu(false)
      }, 500)
    }
  }

  console.log(danhSachPhieuDichVu)

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
    <CRow className="px-2">
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>
      {loading ? (
        <div className="flex items-center justify-center z-50">
          <CSpinner className="mb-3" />
        </div>
      ) : (
        <CCard>
          <CCardBody>
            <CRow>
              <CForm className=" needs-validation">
                <div className="relative mb-3">
                  <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                    Thông tin phòng P.{ma_phong}
                  </span>
                  <div className="border-2 border-gray-500 rounded-md p-4 ">
                    <CRow>
                      <CTable align="middle" responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Loại Phòng
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Số Phòng
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Ngày Đến
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Giờ Đến
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Ngày Đi
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Giờ Đi
                            </CTableHeaderCell>

                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Loại giá
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Giá
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          <CTableRow>
                            <CTableDataCell>
                              {chiTietXepPhong?.phong?.loaiPhong?.tenLoaiPhong || ''}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.phong?.tenPhong || ''}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong.ngayDen
                                ? format(parseISO(chiTietXepPhong.ngayDen), 'dd/MM/yyyy')
                                : 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.gioDen?.slice(0, 5) || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong.ngayDen
                                ? format(parseISO(chiTietXepPhong.ngayDi), 'dd/MM/yyyy')
                                : 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.gioDi?.slice(0, 5) || 'N/A'}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.loaiGia?.tenLoaiGia || ''}
                            </CTableDataCell>
                            <CTableDataCell>
                              {chiTietXepPhong?.gia?.toLocaleString('en-US') || 0}
                            </CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    </CRow>
                  </div>
                </div>

                <div className="relative mb-3">
                  <span className="absolute -top-3 left-3 bg-white px-1 text-sm font-semibold">
                    Danh sách dịch vụ P.{ma_phong}
                  </span>
                  <div className="border-2 border-gray-500 rounded-md p-4 ">
                    {loadingDichVu ? (
                      <div className="flex items-center justify-center z-50">
                        <CSpinner className="mb-3" />
                      </div>
                    ) : (
                      <CTable align="middle" responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              STT
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Hạng mục
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600 text-center">
                              Số lượng
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Đơn giá
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Thành tiền
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" className="!text-blue-600">
                              Ghi chú
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col"></CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>

                        <CTableBody>
                          {trangthaiload ? (
                            <CTableRow>
                              <CTableDataCell colSpan="9">Đang tải...</CTableDataCell>
                            </CTableRow>
                          ) : danhSachPhieuDichVu.length > 0 ? (
                            danhSachPhieuDichVu.map((item, index) => (
                              <CTableRow key={item.maPhieuDichVu}>
                                <CTableDataCell>{index + 1}</CTableDataCell>
                                <CTableDataCell>
                                  {item.dichVu.tenDichVu} ({item.dichVu.dvt})
                                </CTableDataCell>
                                <CTableDataCell className="text-center">
                                  <input
                                    type="number"
                                    className="outline-none border-b border-gray-300 rounded-none text-center w-24 "
                                    min={1}
                                    value={item.soLuong}
                                    onChange={(e) =>
                                      handleChangeQuantity(
                                        item.maPhieuDichVu,
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CurrencyInput
                                    className="outline-none w-20 border-b border-gray-300 rounded-none text-center "
                                    name="input-name"
                                    placeholder="Please enter a number"
                                    value={item.gia}
                                    decimalsLimit={2}
                                    onChange={(event) => handleGiaChange(event, item.maPhieuDichVu)}
                                  />
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.thanhTien.toLocaleString('en-US')}
                                </CTableDataCell>
                                <CTableDataCell>
                                  <input
                                    type="text"
                                    placeholder="Nhập ghi chú "
                                    className={`outline-none border-b-2 rounded-none  ${
                                      item.gia === 0 ? 'border-red-500' : 'border-gray-500'
                                    }`}
                                    value={item.ghiChu || ''}
                                    onChange={(e) =>
                                      handleGhiChu(item.dichVu.maDichVu, e.target.value)
                                    }
                                  />
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CButton
                                    color="danger"
                                    variant="ghost"
                                    className="p-1 hover:bg-red-500 hover:text-white"
                                    onClick={() =>
                                      handleClickHienThiXoa(
                                        item.maPhieuDichVu,
                                        item.dichVu.tenDichVu,
                                      )
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </CButton>
                                </CTableDataCell>
                              </CTableRow>
                            ))
                          ) : (
                            <CTableRow>
                              <CTableDataCell colSpan="9">
                                <h4>Chưa có thông tin dịch vụ</h4>
                              </CTableDataCell>
                            </CTableRow>
                          )}

                          <CTableRow>
                            <CTableDataCell className="!text-green-500" scope="col">
                              Tổng
                            </CTableDataCell>
                            <CTableDataCell></CTableDataCell>

                            <CTableDataCell scope="col" className="text-center !text-green-500">
                              {tongSoLuong}
                            </CTableDataCell>
                            <CTableDataCell scope="col" className="text-center"></CTableDataCell>
                            <CTableDataCell scope="col" className="!text-green-500">
                              {tongThanhTien.toLocaleString('en-US')}
                            </CTableDataCell>
                            <CTableDataCell scope="col" className="text-center"></CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    )}

                    <CCol className=" d-md-flex justify-content-md-end mb-3">
                      <CButton
                        color="success"
                        onClick={() => setvisibleDichVu(true)}
                        variant="outline"
                        className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
                      >
                        <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                        Thêm dịch vụ
                      </CButton>
                    </CCol>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      {trangthaiload ? (
                        <CButton color="primary" disabled>
                          <CSpinner
                            as="span"
                            size="sm"
                            aria-hidden="true"
                            className="font-semibold"
                          />
                          Update...
                        </CButton>
                      ) : danhSachPhieuDichVu.length > 0 ? (
                        <CButton color="primary" onClick={handleSubmit}>
                          {' '}
                          <FontAwesomeIcon icon={faFloppyDisk} /> Update
                        </CButton>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CForm>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      <DichVuModal
        visible={visibleDichVu}
        onClose={() => setvisibleDichVu(false)}
        onSubmit={ChoXyLyThemDichVu}
        maPhong={chiTietXepPhong?.phong?.maPhong}
      />

      <XoaDichVuTrongPhieuModal
        visible={visibleHTXoaDichVu}
        onClose={() => setVisibleHTXoaDichVu(false)}
        ma_booking={ma_booking}
        ma_phieudichvu={maPhieuDichVu}
        ten_dichvu={tenDichVu}
        onSubmit={ChoXyLyXoaDichVu}
      />
    </CRow>
  )
}

export default DichVu
