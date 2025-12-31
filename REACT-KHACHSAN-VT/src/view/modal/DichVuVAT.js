import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CModalFooter,
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
import { useNavigate } from 'react-router-dom'
import {
  createDichVuVATTuyChinh,
  getThongTinDichVuVAT,
  getThongTinDichVuVATTuyChinh,
} from 'src/service/HoaDonVatService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCirclePlus,
  faFloppyDisk,
  faRotateLeft,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

// Hàm tạo UUID v4 thay cho crypto.randomUUID()
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const DichVuVAT = ({ visible, onClose, ma_hoadon_vat, ma_booking }) => {
  const [loading, setLoading] = useState(false)
  const [dichvu, setDichVu] = useState([])
  const [dichvutuychinh, setDichVuTuyChinh] = useState([])
  const [rows, setRows] = useState([])
  const [checkedCodes, setCheckedCodes] = useState([])
  const navigate = useNavigate()

  // Thêm state để lưu dữ liệu ban đầu
  const [initialDichVu, setInitialDichVu] = useState([])
  const [initialDichVuTuyChinh, setInitialDichVuTuyChinh] = useState([])

  const [totalAmount, setTotalAmount] = useState(0)

  const fetchData = async () => {
    if (!ma_hoadon_vat) return
    if (!ma_booking) return

    try {
      setLoading(true)
      const [chitietdichvu, dichvutuychinh] = await Promise.all([
        getThongTinDichVuVAT(ma_booking, ma_hoadon_vat, navigate),
        getThongTinDichVuVATTuyChinh(ma_hoadon_vat, navigate),
      ])

      if (chitietdichvu) {
        setDichVu(chitietdichvu)
        // Lưu dữ liệu ban đầu
        setInitialDichVu(chitietdichvu)
      }
      if (dichvutuychinh) {
        console.log('dichvutuychinh', dichvutuychinh)
        setDichVuTuyChinh(dichvutuychinh)
        // Lưu dữ liệu ban đầu
        setInitialDichVuTuyChinh(dichvutuychinh)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchData()
    }
  }, [visible])

  // Thêm hàm handleReset
  // const handleReset = () => {
  //   // Khôi phục lại dữ liệu ban đầu
  //   setDichVu(initialDichVu)
  //   setDichVuTuyChinh(initialDichVuTuyChinh)
  //   // Xóa các dòng mới thêm
  //   // setRows([])
  //   // Reset lại checkedCodes
  //   setCheckedCodes([])
  //   // Hiển thị thông báo
  //   addToast(exampleToast('Đã khôi phục dữ liệu ban đầu'))
  // }

  // Thêm dòng mới
  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        lineNumber: dichvu.length + rows.length + 1,
        itemCode: uuidv4(), // Sử dụng hàm uuidv4 thay cho crypto.randomUUID()
        itemName: '',
        unitName: '',
        quantity: 1,
        unitPrice: 0,
      },
    ])
  }

  // Thêm hàm xóa dòng
  const handleRemoveRow = (idx) => {
    setRows((rows) => rows.filter((_, i) => i !== idx))
  }

  // Hàm xóa dòng tùy chỉnh không có trong dịch vụ gốc
  const handleRemoveCustomRow = (itemCode) => {
    setDichVuTuyChinh((prev) => prev.filter((item) => String(item.itemCode) !== String(itemCode)))
  }

  const [trangthaiload, setTrangthaiload] = useState(false)

  const handleSave = async () => {
    // 1. Lấy các dòng đã check trong dichvu
    const checkedDichVu = dichvu.filter((item) => checkedCodes.includes(String(item.itemCode)))

    // 2. Kiểm tra từng dòng rows và báo lỗi cụ thể
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.itemName || row.itemName.trim() === '') {
        addToast(exampleToast(`Dòng ${i + dichvu.length + 1}: Chưa nhập Tên hàng hóa, dịch vụ!`))
        return
      }
      if (!row.unitName || row.unitName.trim() === '') {
        addToast(exampleToast(`Dòng ${i + dichvu.length + 1}: Chưa nhập Đơn vị tính!`))
        return
      }
      if (!row.quantity || row.quantity <= 0) {
        addToast(exampleToast(`Dòng ${i + dichvu.length + 1}: Số lượng phải lớn hơn 0!`))
        return
      }
      if (!row.unitPrice || row.unitPrice <= 0) {
        addToast(exampleToast(`Dòng ${i + dichvu.length + 1}: Đơn giá phải lớn hơn 0!`))
        return
      }
    }

    // 3. Lấy tất cả các dòng hợp lệ trong rows (bao gồm cả customRowsNotInDichVu và dòng nhập mới)
    const validRows = rows.filter(
      (row) => row.itemName && row.unitName && row.quantity > 0 && row.unitPrice > 0,
    )

    // 4. Gán mã duy nhất cho từng dòng (nếu cần)
    const checkedDichVuWithKey = checkedDichVu.map((item) => ({
      ...item,
      key: item.itemCode || item.ma_dich_vu,
      hoaDonVat: {
        maHoaDonVat: ma_hoadon_vat,
      },
      itemTotalAmountWithoutTax: item.unitPrice * item.quantity,
      taxPercentage: 0,
      taxAmount: null,
      discount: null,
      itemDiscount: null,
    }))

    const validRowsWithKey = validRows.map((row, idx) => ({
      ...row,
      key: row.itemCode || `new-${idx}`,
      hoaDonVat: {
        maHoaDonVat: ma_hoadon_vat,
      },
      itemTotalAmountWithoutTax: row.unitPrice * row.quantity,
      taxPercentage: 0,
      taxAmount: null,
      discount: null,
      itemDiscount: null,
    }))

    // 5. Gộp lại thành 1 mảng gửi lên server
    const dataToSend = [...checkedDichVuWithKey, ...validRowsWithKey]

    // 7. Gửi dataToSend lên server
    // await sendToServer(dataToSend)
    console.log('Dữ liệu gửi đi:', dataToSend)

    try {
      setTrangthaiload(true)

      // 4. Gọi API nếu dữ liệu hợp lệ
      const response = await createDichVuVATTuyChinh(ma_hoadon_vat, dataToSend, navigate)

      console.log('dichvuvat created successfully:', response)

      setTrangthaiload(false)

      // 5. Kiểm tra mã phản hồi từ server
      if ([400, 500].includes(response.code)) {
        return addToast(exampleToast(response.message))
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ ' + response.message))
          onClose() // Đóng modal khi thêm thành công
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

  // Khi fetch dichvutuychinh, đồng bộ checkedCodes
  useEffect(() => {
    if (dichvutuychinh && Array.isArray(dichvutuychinh)) {
      setCheckedCodes(dichvutuychinh.map((item) => String(item.itemCode)))
      // Thêm các dòng không trùng vào rows, tránh trùng itemCode
      const dichvuItemCodes = new Set((dichvu || []).map((item) => String(item.itemCode)))
      const currentRowsItemCodes = new Set((rows || []).map((item) => String(item.itemCode)))
      const customRowsNotInDichVu = (dichvutuychinh || []).filter(
        (item) =>
          !dichvuItemCodes.has(String(item.itemCode)) &&
          !currentRowsItemCodes.has(String(item.itemCode)),
      )
      if (customRowsNotInDichVu.length > 0) {
        setRows((prevRows) => [
          ...prevRows,
          ...customRowsNotInDichVu.map((row) => ({
            lineNumber: row.lineNumber,
            itemCode: row.itemCode,
            itemName: row.itemName,
            unitName: row.unitName,
            quantity: row.quantity,
            unitPrice: row.unitPrice,
          })),
        ])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dichvutuychinh, dichvu])

  // Định nghĩa customRowsNotInDichVu để dùng cho uniqueTableRows và render bảng
  const dichvuItemCodes = new Set((dichvu || []).map((item) => String(item.itemCode)))
  const currentRowsItemCodes = new Set((rows || []).map((item) => String(item.itemCode)))
  const customRowsNotInDichVu = (dichvutuychinh || []).filter(
    (item) =>
      !dichvuItemCodes.has(String(item.itemCode)) &&
      !currentRowsItemCodes.has(String(item.itemCode)),
  )

  // Helper: Gộp các dòng hiển thị, loại bỏ trùng lặp theo itemCode
  const allTableRows = [...dichvu, ...customRowsNotInDichVu, ...rows]
  // Loại bỏ trùng lặp theo itemCode, ưu tiên giữ dòng đầu tiên
  const uniqueTableRows = []
  const seenCodes = new Set()
  for (const row of allTableRows) {
    const code = String(row.itemCode)
    if (!seenCodes.has(code)) {
      uniqueTableRows.push(row)
      seenCodes.add(code)
    }
  }
  // Đánh lại STT (lineNumber) tự tăng
  uniqueTableRows.forEach((row, idx) => {
    row.lineNumber = idx + 1
  })

  // Thêm hàm tính tổng tiền
  const calculateTotalAmount = () => {
    let total = 0
    uniqueTableRows.forEach((item) => {
      const isDichVuGoc = dichvu.some((dv) => String(dv.itemCode) === String(item.itemCode))
      if (isDichVuGoc) {
        // Chỉ cộng nếu được check
        if (checkedCodes.includes(String(item.itemCode))) {
          total += (item.unitPrice || 0) * (item.quantity || 0)
        }
      } else {
        // Dòng tự thêm luôn cộng
        total += (item.unitPrice || 0) * (item.quantity || 0)
      }
    })
    setTotalAmount(total)
  }

  // Thêm useEffect để tính lại tổng tiền khi có thay đổi
  useEffect(() => {
    calculateTotalAmount()
  }, [dichvu, dichvutuychinh, rows, checkedCodes])

  return (
    <>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

      <CModal
        size="xl"
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold  text-danger">
            Thông tin dịch vụ VAT
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CCol>
            <CTable align="middle" responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Chọn</CTableHeaderCell>
                  <CTableHeaderCell scope="col">STT</CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ minWidth: '400px' }}>
                    Tên hàng hóa, dịch vụ
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">ĐVT</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Số lượng</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Đơn giá</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Thành tiền</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Hành động</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {uniqueTableRows.map((row, idx) => (
                  <CTableRow key={row.itemCode || row.ma_dich_vu || `row-${idx}`}>
                    <CTableHeaderCell scope="row">
                      {/* Checkbox nếu là dòng dichvu, không checkbox nếu là dòng custom/rows */}
                      {dichvu.some((dv) => String(dv.itemCode) === String(row.itemCode)) ? (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`dichvu-checkbox-${idx}`}
                          checked={checkedCodes.includes(String(row.itemCode))}
                          onChange={(e) => {
                            const code = String(row.itemCode)
                            setCheckedCodes((prev) =>
                              e.target.checked ? [...prev, code] : prev.filter((c) => c !== code),
                            )
                          }}
                        />
                      ) : null}
                    </CTableHeaderCell>
                    <CTableDataCell>{row.lineNumber}</CTableDataCell>
                    <CTableDataCell>
                      {/* Nếu là dòng nhập mới thì cho phép nhập, còn lại chỉ hiển thị */}
                      {rows.some((r) => String(r.itemCode) === String(row.itemCode)) ? (
                        <input
                          type="text"
                          className="form-control"
                          value={row.itemName}
                          onChange={(e) => {
                            const value = e.target.value
                            setRows((rows) =>
                              rows.map((r) =>
                                String(r.itemCode) === String(row.itemCode)
                                  ? { ...r, itemName: value }
                                  : r,
                              ),
                            )
                          }}
                          placeholder="Nhập tên hàng hóa, dịch vụ"
                        />
                      ) : (
                        row.itemName
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {rows.some((r) => String(r.itemCode) === String(row.itemCode)) ? (
                        <input
                          type="text"
                          className="form-control"
                          value={row.unitName}
                          onChange={(e) => {
                            const value = e.target.value
                            setRows((rows) =>
                              rows.map((r) =>
                                String(r.itemCode) === String(row.itemCode)
                                  ? { ...r, unitName: value }
                                  : r,
                              ),
                            )
                          }}
                          placeholder="Nhập ĐVT"
                        />
                      ) : (
                        row.unitName
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {rows.some((r) => String(r.itemCode) === String(row.itemCode)) ? (
                        <input
                          type="number"
                          className="form-control"
                          min={1}
                          value={row.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1
                            setRows((rows) =>
                              rows.map((r) =>
                                String(r.itemCode) === String(row.itemCode)
                                  ? { ...r, quantity: value }
                                  : r,
                              ),
                            )
                          }}
                          placeholder="Số lượng"
                        />
                      ) : (
                        row.quantity
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {rows.some((r) => String(r.itemCode) === String(row.itemCode)) ? (
                        <input
                          type="text"
                          className="form-control"
                          min={0}
                          value={row.unitPrice.toLocaleString('en-US')}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, '')
                            const value = parseFloat(raw) || 0
                            setRows((rows) =>
                              rows.map((r) =>
                                String(r.itemCode) === String(row.itemCode)
                                  ? { ...r, unitPrice: value }
                                  : r,
                              ),
                            )
                          }}
                          placeholder="Đơn giá"
                        />
                      ) : (
                        row.unitPrice?.toLocaleString('en-US')
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {(row.unitPrice * row.quantity).toLocaleString('en-US')}
                    </CTableDataCell>
                    <CTableDataCell>
                      {/* Nếu là dòng nhập mới hoặc dòng custom thì cho phép xóa */}
                      {rows.some((r) => String(r.itemCode) === String(row.itemCode)) ||
                      customRowsNotInDichVu.some(
                        (r) => String(r.itemCode) === String(row.itemCode),
                      ) ? (
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => {
                            setRows((rows) =>
                              rows.filter((r) => String(r.itemCode) !== String(row.itemCode)),
                            )
                            setDichVuTuyChinh((prev) =>
                              prev.filter((r) => String(r.itemCode) !== String(row.itemCode)),
                            )
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-white" />
                        </CButton>
                      ) : null}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell colSpan="6" className="text-end !text-green-600">
                    <strong>Tổng tiền:</strong>
                  </CTableHeaderCell>
                  <CTableHeaderCell className="!text-green-600">
                    <strong>{totalAmount.toLocaleString('en-US')}</strong>
                  </CTableHeaderCell>
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
            </CTable>
            <CCol className=" d-md-flex justify-content-md-end">
              <CButton
                color="success"
                onClick={handleAddRow}
                variant="outline"
                className="p-1 px-3 text-green-500 group-hover:bg-green-100 hover:text-white"
              >
                <FontAwesomeIcon className="cursor-pointer mr-2" icon={faCirclePlus} />
                Thêm dịch vụ
              </CButton>
            </CCol>
          </CCol>
        </CModalBody>
        <CModalFooter>
          {/* <CButton color="secondary" variant="outline" onClick={handleReset}>
            <FontAwesomeIcon icon={faRotateLeft} /> Reset
          </CButton> */}

          <CButton color="secondary" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} /> Đóng
          </CButton>
          <CButton onClick={handleSave} color="success" className="text-white px-4">
            <FontAwesomeIcon icon={faFloppyDisk} /> Lưu
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

DichVuVAT.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  ma_hoadon_vat: PropTypes.string, // ma_hoadon_vat là string, không bắt buộc
  ma_booking: PropTypes.string, // ma_booking là string, không bắt buộc
}
export default DichVuVAT
