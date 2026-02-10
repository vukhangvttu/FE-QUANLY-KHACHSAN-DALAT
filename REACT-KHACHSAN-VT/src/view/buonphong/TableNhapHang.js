import React from 'react'
import PropTypes from 'prop-types'
import {
  CFormInput,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons'

const TableNhapHang = ({ 
  rows, 
  dichVuList, 
  onMaHangChange, 
  onCellChange, 
  onRemoveRow 
}) => {
  return (
    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <CTable hover bordered>
        <CTableHead className=" bg-light">
          <CTableRow>
            <CTableHeaderCell style={{ width: '50px' }}>STT</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '200px' }}>
              Mã hàng <span className="text-danger">*</span>
            </CTableHeaderCell>
            <CTableHeaderCell style={{ width: '250px' }}>Tên hàng</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '120px' }}>
              Số lượng <span className="text-danger">*</span>
            </CTableHeaderCell>
            <CTableHeaderCell style={{ width: '100px' }}>ĐVT</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '150px' }}>
              Loại <span className="text-danger">*</span>
            </CTableHeaderCell>
            <CTableHeaderCell>Ghi chú</CTableHeaderCell>
            <CTableHeaderCell style={{ width: '60px' }}></CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {rows.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={8} className="text-center text-muted py-4">
                Chưa có dữ liệu. Vui lòng thêm dòng hoặc import từ Excel.
              </CTableDataCell>
            </CTableRow>
          ) : (
            rows.map((row, index) => (
              <CTableRow key={index}>
                <CTableDataCell className="text-center">{row.stt}</CTableDataCell>
                <CTableDataCell>
                  <CFormSelect
                    value={row.maDichVuMienPhi}
                    onChange={(e) => onMaHangChange(index, e.target.value)}
                    size="sm"
                  >
                    <option value="">-- Chọn mã hàng --</option>
                    {dichVuList.map((dv) => (
                      <option key={dv.maDichVuMienPhi} value={dv.maDichVuMienPhi}>
                        {dv.maDichVuMienPhi}
                      </option>
                    ))}
                  </CFormSelect>
                </CTableDataCell>
                <CTableDataCell>
                  {row.tenHang}
                </CTableDataCell>
                <CTableDataCell>
                  <CFormInput
                    type="number"
                    value={row.soLuong}
                    onChange={(e) =>
                      onCellChange(index, 'soLuong', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                    size="sm"
                    min="0"
                  />
                </CTableDataCell>
                <CTableDataCell>
                  {row.donViTinh}
                </CTableDataCell>
                <CTableDataCell>
                  <CFormInput
                    type="text"
                    value={row.loai}
                    onChange={(e) => onCellChange(index, 'loai', e.target.value)}
                    placeholder="Loại"
                    size="sm"
                  />
                </CTableDataCell>
                <CTableDataCell>
                  <CFormInput
                    type="text"
                    value={row.ghiChu}
                    onChange={(e) => onCellChange(index, 'ghiChu', e.target.value)}
                    placeholder="Ghi chú"
                    size="sm"
                  />
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  <FontAwesomeIcon
                    icon={faDeleteLeft}
                    className="text-danger cursor-pointer"
                    onClick={() => onRemoveRow(index)}
                  />
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

TableNhapHang.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    stt: PropTypes.number,
    maDichVuMienPhi: PropTypes.string,
    maHang: PropTypes.string,
    tenHang: PropTypes.string,
    soLuong: PropTypes.number,
    donViTinh: PropTypes.string,
    loai: PropTypes.string,
    ghiChu: PropTypes.string,
  })).isRequired,
  dichVuList: PropTypes.arrayOf(PropTypes.shape({
    maDichVuMienPhi: PropTypes.string,
    tenDichVuMienPhi: PropTypes.string,
    donViTinh: PropTypes.string,
  })).isRequired,
  onMaHangChange: PropTypes.func.isRequired,
  onCellChange: PropTypes.func.isRequired,
  onRemoveRow: PropTypes.func.isRequired,
}

export default TableNhapHang
