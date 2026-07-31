import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormSelect,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDeleteLeft, faFloppyDisk, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

const ChiTietPhieuNhapModal = ({ visible, onClose, maPhieuNhapHang, chiTietPhieu, dichVuList, onSave, onDeleteRow, isDeleted }) => {
  const [editedRows, setEditedRows] = useState([])

  // Load dữ liệu vào state khi modal mở
  useEffect(() => {
    if (chiTietPhieu?.result) {
      const rows = chiTietPhieu.result.map((item, index) => ({
        maNhapHang: item.maNhapHang,
        stt: index + 1,
        maDichVuMienPhi: item.dichVuMienPhi?.maDichVuMienPhi || '',
        tenHang: item.dichVuMienPhi?.tenDichVuMienPhi || '',
        soLuong: item.soLuong || 0,
        donViTinh: item.dichVuMienPhi?.donViTinh || '',
        loai: item.loai || '',
        ghiChu: item.ghiChu || '',
        daXoa: item.daXoa || false,
      }))
      setEditedRows(rows)
    }
  }, [chiTietPhieu])

  // Thêm dòng mới
  const handleAddRow = () => {
    const newRow = {
      tempId: `new-${Date.now()}-${Math.random()}`, // ID tạm thời duy nhất cho dòng mới
      maNhapHang: null, // Dòng mới chưa có maNhapHang
      stt: editedRows.length + 1,
      maDichVuMienPhi: '',
      tenHang: '',
      soLuong: 0,
      donViTinh: '',
      loai: '',
      ghiChu: '',
      daXoa: false,
      isNew: true, // Đánh dấu đây là dòng mới
    }
    setEditedRows([...editedRows, newRow])
  }

  // Xử lý thay đổi mã dịch vụ
  const handleMaHangChange = (index, maDichVuMienPhi) => {
    const selectedDichVu = dichVuList.find((dv) => dv.maDichVuMienPhi === maDichVuMienPhi)
    if (selectedDichVu) {
      const updatedRows = [...editedRows]
      updatedRows[index] = {
        ...updatedRows[index],
        maDichVuMienPhi: selectedDichVu.maDichVuMienPhi,
        tenHang: selectedDichVu.tenDichVuMienPhi,
        donViTinh: selectedDichVu.donViTinh || '',
      }
      setEditedRows(updatedRows)
    }
  }

  // Xử lý thay đổi giá trị cell
  const handleCellChange = (index, field, value) => {
    const updatedRows = [...editedRows]
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    }
    setEditedRows(updatedRows)
  }

  // Xử lý xóa dòng
  const handleRemoveRow = (index, maNhapHang) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dòng này?')) {
      // Nếu là dòng mới (chưa lưu vào DB), xóa trực tiếp khỏi state
      const row = editedRows[index]
      if (row.isNew) {
        const updatedRows = editedRows.filter((_, i) => i !== index)
        const reindexedRows = updatedRows.map((r, idx) => ({
          ...r,
          stt: idx + 1,
        }))
        setEditedRows(reindexedRows)
      } else {
        // Nếu là dòng đã lưu, gọi API xóa
        onDeleteRow(maNhapHang, index)
        // Xóa khỏi state local
        const updatedRows = editedRows.filter((_, i) => i !== index)
        const reindexedRows = updatedRows.map((r, idx) => ({
          ...r,
          stt: idx + 1,
        }))
        setEditedRows(reindexedRows)
      }
    }
  }

  // Xử lý lưu
  const handleSaveChanges = () => {
    
    if (!maPhieuNhapHang) {
      alert('Không tìm thấy mã phiếu nhập hàng')
      return
    }

    const danhSachChiTiet = editedRows
      .filter(row => !row.daXoa) // Chỉ lưu các dòng chưa bị xóa
      .map(row => ({
        maNhapHang: row.maNhapHang ? row.maNhapHang : '', // Nếu có maNhapHang thì giữ nguyên, không thì để ""
        maDichVu: row.maDichVuMienPhi,
        soLuong: row.soLuong,
        loai: row.loai,
        ghiChu: row.ghiChu,
      }))

    console.log('Mã phiếu nhập hàng:', maPhieuNhapHang)
    console.log('Danh sách chi tiết:', danhSachChiTiet)
    
    onSave(maPhieuNhapHang, danhSachChiTiet)
  }
  return (
    <CModal size="xl" visible={visible} onClose={onClose} backdrop="static" >
      <CModalHeader>
        <CModalTitle>Chi tiết phiếu nhập hàng</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {chiTietPhieu ? (
          <>
            {isDeleted && (
              <div className="alert alert-danger py-2 mb-3">
                ⚠️ Phiếu nhập hàng này đã bị xóa. Không thể thực hiện thay đổi.
              </div>
            )}
            {!isDeleted && (
              <div className="d-flex justify-content-end mb-3">
                <CButton color="success" variant="outline" size="sm" onClick={handleAddRow}>
                  <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                  Thêm dòng
                </CButton>
              </div>
            )}
            
            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <CTable hover bordered>
              <CTableHead className="bg-light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '50px' }}>STT</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '200px' }}>
                    Mã dịch vụ <span className="text-danger">*</span>
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '250px' }}>Tên hàng</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '120px' }}>
                    Số lượng <span className="text-danger">*</span>
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '100px' }}>ĐVT <span className="text-danger">*</span></CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '150px' }}>
                    Nhãn hiệu 
                  </CTableHeaderCell>
                  <CTableHeaderCell>Ghi chú</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '60px' }}></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {editedRows.length > 0 ? (
                  editedRows.map((row, index) => (
                    <CTableRow 
                      key={row.tempId || `existing-${row.maNhapHang}`}
                      className={row.daXoa ? 'table-danger' : ''}
                    >
                      <CTableDataCell className="text-center">{row.stt}</CTableDataCell>
                      <CTableDataCell>
                        <CFormSelect
                          value={row.maDichVuMienPhi}
                          onChange={(e) => handleMaHangChange(index, e.target.value)}
                          size="sm"
                          disabled={row.daXoa || isDeleted}
                        >
                          <option value="">-- Chọn mã hàng --</option>
                          {dichVuList.map((dv) => (
                            <option key={dv.maDichVuMienPhi} value={dv.maDichVuMienPhi}>
                              {dv.maDichVuMienPhi}
                            </option>
                          ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>{row.tenHang}</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          value={row.soLuong}
                          onChange={(e) =>
                            handleCellChange(index, 'soLuong', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          size="sm"
                          min="0"
                          disabled={row.daXoa || isDeleted}
                        />
                      </CTableDataCell>
                      <CTableDataCell>{row.donViTinh}</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="text"
                          value={row.loai}
                          onChange={(e) => handleCellChange(index, 'loai', e.target.value)}
                          placeholder="Tên nhãn hiệu"
                          size="sm"
                          disabled={row.daXoa || isDeleted}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="text"
                          value={row.ghiChu}
                          onChange={(e) => handleCellChange(index, 'ghiChu', e.target.value)}
                          placeholder="Ghi chú"
                          size="sm"
                          disabled={row.daXoa || isDeleted}
                        />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {!row.daXoa && !isDeleted && (
                          <FontAwesomeIcon
                            icon={faDeleteLeft}
                            className="text-danger cursor-pointer"
                            onClick={() => handleRemoveRow(index, row.maNhapHang)}
                            style={{ cursor: 'pointer' }}
                          />
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={8} className="text-center text-muted py-4">
                      Không có dữ liệu chi tiết
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        {!isDeleted && (
          <CButton color="primary" onClick={handleSaveChanges}>
            <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
            Lưu thay đổi
          </CButton>
        )}
        <CButton color="secondary" onClick={onClose}>
          Đóng
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

ChiTietPhieuNhapModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
    maPhieuNhapHang: PropTypes.string,
  chiTietPhieu: PropTypes.shape({
    result: PropTypes.arrayOf(PropTypes.shape({
      maNhapHang: PropTypes.number,
      maPhieuNhapHang: PropTypes.string,
      dichVuMienPhi: PropTypes.shape({
        maDichVuMienPhi: PropTypes.string,
        tenDichVuMienPhi: PropTypes.string,
        donViTinh: PropTypes.string,
      }),
      soLuong: PropTypes.number,
      loai: PropTypes.string,
      ghiChu: PropTypes.string,
      daXoa: PropTypes.bool,
    })),
  }),
  dichVuList: PropTypes.arrayOf(PropTypes.shape({
    maDichVuMienPhi: PropTypes.string,
    tenDichVuMienPhi: PropTypes.string,
    donViTinh: PropTypes.string,
  })).isRequired,
  onSave: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
  isDeleted: PropTypes.bool,
}

export default ChiTietPhieuNhapModal
