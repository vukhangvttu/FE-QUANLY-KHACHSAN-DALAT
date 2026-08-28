import React, { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { CPopover, CSpinner, CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react-pro'

import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faFloppyDisk, faSearch } from '@fortawesome/free-solid-svg-icons'

import { useNavigate, useParams } from 'react-router-dom'
import { createPhieuDichVu, getAllNhomDichVu } from 'src/service/DichVu'
import config from '../../service/Config'
import GhiChuModal from '../modal/GhiChuModal'
import CurrencyInput from 'react-currency-input-field'
const DichVuModal = ({ visible, onClose, onSubmit, maPhong }) => {
  const { ma_xepphong_booking } = useParams()

  const [selectedProducts, setSelectedProducts] = useState([])

  const handleSelectProduct = (product) => {
    setSelectedProducts((prev) => {
      const existingProduct = prev.find((p) => p.maDichVu === product.maDichVu)
      if (existingProduct) {
        // Nếu sản phẩm đã tồn tại, tăng số lượng và cập nhật tổng tiền
        return prev.map((p) =>
          p.maDichVu === product.maDichVu
            ? { ...p, soLuong: p.soLuong + 1, tongTien: (p.soLuong + 1) * p.gia }
            : p,
        )
      } else {
        // Nếu là sản phẩm mới, thêm vào với STT tăng dần
        const newSTT = prev.length > 0 ? prev[prev.length - 1].STT + 1 : 1
        return [...prev, { STT: newSTT, ...product, soLuong: 1, tongTien: product.gia }]
      }
    })
  }

  const handleRemoveProduct = (maDichVu) => {
    setSelectedProducts((prev) => {
      const updatedList = prev.filter((p) => p.maDichVu !== maDichVu)

      // Cập nhật lại STT
      return updatedList.map((item, index) => ({
        ...item,
        STT: index + 1, // STT luôn từ 1, 2, 3...
      }))
    })
  }

  const handleChangeQuantity = (maDichVu, newQuantity) => {
    if (newQuantity < 0) return
    setSelectedProducts((prev) => {
      return prev.map((p) =>
        p.maDichVu === maDichVu ? { ...p, soLuong: newQuantity, tongTien: newQuantity * p.gia } : p,
      )
    })
  }

  const handleChangeGia = (maDichVu, value) => {
    // Chuyển chuỗi nhập vào thành số, loại bỏ dấu phẩy
    const newGia = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0

    // Cập nhật state
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.maDichVu === maDichVu ? { ...p, gia: newGia, tongTien: p.soLuong * newGia } : p,
      ),
    )
  }

  const [visibleGhiChu, setVisibleGhiChu] = useState(false)
  const [loading, setLoading] = useState(false)
  const [danhSachDichVu, setDanhSachDichVu] = useState([])
  const navigate = useNavigate()
  const DanhSachDichVu = async () => {
    try {
      setLoading(true)

      const chitietbooking = await getAllNhomDichVu(navigate)
      if (chitietbooking) {
        // console.log('DanhSachDichVu raw:', JSON.stringify(chitietbooking))
        setDanhSachDichVu(chitietbooking)
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

  useEffect(() => {
    if (visible) {
      DanhSachDichVu()
    }
  }, [visible])

  const convertSelectedToPhieuDichVu = (selectedProducts) => {
    return selectedProducts.map((item, index) => ({
      STT: index + 1, // Cập nhật lại STT nếu cần
      dichVu: {
        maDichVu: item.maDichVu, // Giữ mã dịch vụ
      },
      xepPhongBooKing: {
        maXepPhongBooking: ma_xepphong_booking, // Nếu có giá trị booking, cần cập nhật ở đây
      },
      soLuong: item.soLuong,
      gia: item.gia,
      ghiChu: item.ghiChu,
    }))
  }

  const [trangThaiLoad, setTrangthaiload] = useState(false)

  console.log(selectedProducts)
  const handleSubmit = async () => {
    if (
      ma_xepphong_booking === '' ||
      ma_xepphong_booking === undefined ||
      ma_xepphong_booking === null
    )
      return addToast(exampleToast('⚠️ Mã booking không hợp lệ'))
    if (maPhong === '' || maPhong === undefined || maPhong === null)
      return addToast(exampleToast('⚠️ Mã phòng không hợp lệ'))
    if (selectedProducts.length === 0) return addToast(exampleToast('⚠️ Bạn chưa thêm dịch vụ.'))

    const isInvalidDetail = selectedProducts.some((item) => {
      if (!item?.maDichVu || item.maDichVu === '0') {
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

      const data = convertSelectedToPhieuDichVu(selectedProducts)

      console.log('gui', data)
      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await createPhieuDichVu(maPhong, ma_xepphong_booking, data, navigate)

      console.log('Booking created successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ ' + response.message))
          onSubmit(true)

          setSelectedProducts([])
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

  const [activeGroup, setActiveGroup] = useState('Tất cả')
  const [searchKeyword, setSearchKeyword] = useState('')

  // Lọc danh sách dịch vụ theo nhóm đang chọn và từ khóa tìm kiếm
  const filteredDichVu = useMemo(() => {
    let filtered =
      activeGroup === 'Tất cả'
        ? danhSachDichVu.flatMap((group) => group.dichVus)
        : danhSachDichVu.find((group) => group.tenNhomDichVu === activeGroup)?.dichVus || []

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim()
      filtered = filtered.filter((dichVu) => dichVu.tenDichVu.toLowerCase().includes(keyword))
    }

    return filtered
  }, [danhSachDichVu, activeGroup, searchKeyword])

  const formatCurrency = (amount) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
    return formattedNumber
  }

  const [maDichVu, setMaDichVu] = useState('')
  const [tenDichVu, setTenDichVu] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const handleAddGhiChuProduct = (maDichVu, tenDichVu, ghiChu) => {
    setMaDichVu(maDichVu)
    setTenDichVu(tenDichVu)
    setGhiChu(ghiChu)
    setVisibleGhiChu(true)
  }
  const ChoXyLyNhapGhiChu = (note) => {
    console.log('note', note)
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.maDichVu === note.maDichVu ? { ...item, ghiChu: note.ghiChu } : item,
      ),
    )
    setVisibleGhiChu(false)
  }

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
        backdrop="static"
        visible={visible}
        onClose={onClose}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">
            <div className="font-bold">Thêm sản phẩm, dịch vụ</div>
            <div className="text-sm text-blue-500 font-bold">
              <p>P.{maPhong}</p>
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="flex flex-col ">
            {/* Main Content */}
            <div className="flex gap-3">
              {/* Left Column */}
              <div className="w-3/6 border-r border-dashed pr-3">
                {/* Search Bar */}
                <div className="mb-3">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Tìm theo tên dịch vụ"
                      className="w-full pl-10 pr-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bộ lọc nhóm dịch vụ */}
                <div className="w-full mb-3">
                  <div
                    className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    <CButton
                      color="success"
                      variant="outline"
                      size="sm"
                      className={`rounded-pill font-semibold hover:text-white flex-shrink-0 ${
                        activeGroup === 'Tất cả' ? 'bg-green-600 text-white' : 'bg-gray-300'
                      }`}
                      onClick={() => setActiveGroup('Tất cả')}
                    >
                      Tất cả
                    </CButton>
                    {danhSachDichVu.map((group) => (
                      <CButton
                        key={group.maNhomDichVu}
                        color="success"
                        variant="outline"
                        size="sm"
                        className={`rounded-pill font-semibold hover:text-white flex-shrink-0 ${
                          activeGroup === group.tenNhomDichVu
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300'
                        }`}
                        onClick={() => setActiveGroup(group.tenNhomDichVu)}
                      >
                        {group.tenNhomDichVu}
                      </CButton>
                    ))}
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div
                  className="relative grid grid-cols-4 gap-4 p-4 overflow-y-auto h-96"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                      <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                    </div>
                  ) : filteredDichVu.length > 0 ? (
                    filteredDichVu.map((product) => (
                      <div
                        key={product.maDichVu}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="w-16 h-16 mb-2 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                          {product.hinhAnh ? (
                            <img
                              src={`${config.apiBaseUrl}${product.hinhAnh}`}
                              alt={product.tenDichVu}
                              className="w-20 h-20 object-cover"
                            />
                          ) : (
                            <span className="text-sm text-gray-500">Hình ảnh</span>
                          )}
                        </div>
                        <p className="text-xs text-center font-medium">{product.tenDichVu}</p>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(product.gia)} ({product.dvt})
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 text-center text-gray-500">Không có dịch vụ</p>
                  )}
                </div>

                {/* Pagination */}
                {/* <div className="flex justify-center items-center space-x-2 p-4 border-t">
                  <button
                    className={`w-2 h-2 rounded-full ${
                      activePage === 1 ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setActivePage(1)}
                  />
                  <button
                    className={`w-2 h-2 rounded-full ${
                      activePage === 2 ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setActivePage(2)}
                  />
                  <button className="ml-2">
                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-400" />
                  </button>
                </div> */}
              </div>

              {/* Right Column */}
              <div className="w-4/6">
                {/* Room/Table Info */}
                {/* <div className="flex gap-1 mb-2">
                  <CButton
                    color="warning"
                    variant="outline"
                    className={`text-gray-900 font-semibold ${
                      activePage === 1 ? 'bg-yellow-500 ' : ''
                    } `}
                  >
                    P.301
                  </CButton>
                  <CButton color="warning" variant="outline" className="text-gray-900">
                    P.201
                  </CButton>
                </div> */}
                {/* Selected Products Table */}
                <div className="overflow-y-auto h-96 ">
                  <table className="w-full ">
                    <thead>
                      {selectedProducts.map((item) => {
                        return (
                          <>
                            <tr className="border-b ">
                              <th className="px-4 py-2 text-left font-medium text-sm">
                                {item.STT}
                              </th>
                              <th className="px-4 py-2 text-left font-medium text-sm min-w-48">
                                {item.tenDichVu}
                              </th>
                              <th className="px-4 py-2 text-right font-medium text-sm">
                                <input
                                  type="number"
                                  className="outline-none border-b border-gray-300 rounded-none text-center w-16 "
                                  min={1}
                                  value={item.soLuong}
                                  onChange={(e) =>
                                    handleChangeQuantity(item.maDichVu, Number(e.target.value))
                                  }
                                />
                              </th>
                              <th className="px-4 py-2 text-right font-medium text-sm">
                                <CurrencyInput
                                  className="outline-none w-20 border-b-2 border-gray-500 rounded-none text-right "
                                  name="input-name"
                                  placeholder="Please enter a number"
                                  value={item.gia}
                                  decimalsLimit={2}
                                  onChange={(e) => handleChangeGia(item.maDichVu, e.target.value)}
                                />
                              </th>
                              <th className="px-4 py-2 text-right font-medium text-sm">
                                {' '}
                                {formatCurrency(item.tongTien)}
                              </th>
                              <th className="px-1 text-center">
                                <CPopover
                                  content={
                                    <div className="text-sm cursor-pointer ">
                                      <div
                                        className="hover:text-blue-500 py-2"
                                        onClick={() =>
                                          handleAddGhiChuProduct(
                                            item.maDichVu,
                                            item.tenDichVu,
                                            item.ghiChu,
                                          )
                                        }
                                      >
                                        Ghi chú
                                      </div>
                                      <div
                                        className="hover:text-red-500"
                                        onClick={() => handleRemoveProduct(item.maDichVu)}
                                      >
                                        Xóa
                                      </div>
                                    </div>
                                  }
                                  placement="left"
                                  trigger="focus"
                                >
                                  <CButton color="secondary" variant="ghost" size="sm">
                                    <FontAwesomeIcon
                                      icon={faEllipsisVertical}
                                      className="text-gray-400"
                                    />
                                  </CButton>
                                </CPopover>
                              </th>
                            </tr>
                          </>
                        )
                      })}
                    </thead>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center p-2">
                  <button
                    className="px-6 py-2 mr-2 rounded-md border border-gray-300 text-gray-700"
                    onClick={onClose}
                  >
                    Bỏ qua
                  </button>
                  {trangThaiLoad === false ? (
                    <CButton
                      color="success"
                      className="text-white px-6 py-2"
                      onClick={handleSubmit}
                    >
                      <FontAwesomeIcon icon={faFloppyDisk} /> Lưu
                    </CButton>
                  ) : (
                    <CButton color="success" disabled>
                      <CSpinner as="span" size="sm" aria-hidden="true" />
                      Đồng ý...
                    </CButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CModalBody>
      </CModal>

      <GhiChuModal
        visible={visibleGhiChu}
        onClose={() => setVisibleGhiChu(false)}
        maDichVu={maDichVu}
        tenDichVu={tenDichVu}
        initialNote={ghiChu}
        onSubmit={ChoXyLyNhapGhiChu}
      />
    </>
  )
}

DichVuModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  onSubmit: PropTypes.func,
  maPhong: PropTypes.string,
}
export default DichVuModal
