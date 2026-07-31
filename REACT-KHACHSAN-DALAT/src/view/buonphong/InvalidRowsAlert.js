import React from 'react'
import PropTypes from 'prop-types'
import {
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faDeleteLeft } from '@fortawesome/free-solid-svg-icons'

const InvalidRowsAlert = ({ invalidRows, onRemoveRow }) => {
  if (invalidRows.length === 0) {
    return null
  }

  return (
    <CAlert color="warning" className="mb-3">
      <div className="d-flex align-items-center mb-2">
        <FontAwesomeIcon icon={faTriangleExclamation} className="me-2" />
        <strong>Cảnh báo: Có {invalidRows.length} mã hàng không hợp lệ</strong>
      </div>
      <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <CTable bordered size="sm">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ width: '50px' }}>STT</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '150px' }}>Mã hàng</CTableHeaderCell>
              <CTableHeaderCell>Tên hàng</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '100px' }}>Số lượng</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '100px' }}>ĐVT</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '120px' }}>Loại</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '250px' }}>Lý do</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '60px' }}></CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {invalidRows.map((row, index) => (
              <CTableRow key={index}>
                <CTableDataCell className="text-center">{row.stt}</CTableDataCell>
                <CTableDataCell>{row.maHang}</CTableDataCell>
                <CTableDataCell>{row.tenHang}</CTableDataCell>
                <CTableDataCell className="text-center">{row.soLuong}</CTableDataCell>
                <CTableDataCell>{row.donViTinh}</CTableDataCell>
                <CTableDataCell>{row.loai}</CTableDataCell>
                <CTableDataCell className="text-danger">{row.lyDo}</CTableDataCell>
                <CTableDataCell className="text-center">
                  <FontAwesomeIcon
                    icon={faDeleteLeft}
                    className="text-danger cursor-pointer"
                    onClick={() => onRemoveRow(index)}
                  />
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>
    </CAlert>
  )
}

InvalidRowsAlert.propTypes = {
  invalidRows: PropTypes.arrayOf(PropTypes.shape({
    stt: PropTypes.number,
    maHang: PropTypes.string,
    tenHang: PropTypes.string,
    soLuong: PropTypes.number,
    donViTinh: PropTypes.string,
    loai: PropTypes.string,
    lyDo: PropTypes.string,
  })).isRequired,
  onRemoveRow: PropTypes.func.isRequired,
}

export default InvalidRowsAlert
