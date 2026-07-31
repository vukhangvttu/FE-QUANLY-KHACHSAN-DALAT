import React from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CCard,
  CCardBody,
  CSmartTable,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faEye, faTrash } from '@fortawesome/free-solid-svg-icons'

const DanhSachPhieuNhap = ({ 
  phieuNhapList, 
  onRefresh, 
  onViewDetail, 
  onDelete 
}) => {
  // Định nghĩa columns cho CSmartTable
  const columns = [
    {
      key: 'stt',
      label: 'STT',
      _style: { width: '5%' },
      filter: false,
      sorter: false,
    },
    {
      key: 'ngayNhap',
      label: 'Ngày nhập',
      _style: { width: '12%' },
    },
    {
      key: 'nguoiTao',
      label: 'Người tạo',
      _style: { width: '15%' },
    },
    {
      key: 'thoiGianTao',
      label: 'Thời gian tạo',
      _style: { width: '18%' },
    },
    {
      key: 'tongSoLuong',
      label: 'Tổng số lượng',
      _style: { width: '12%' },
    },
    {
      key: 'actions',
      label: 'Thao tác',
      _style: { width: '12%' },
      filter: false,
      sorter: false,
    },
  ]

  // Transform data để thêm STT
  const tableData = phieuNhapList.map((phieu, index) => ({
    ...phieu,
    stt: index + 1,
    _props: phieu.daXoa ? { className: 'table-danger' } : {},
  }))

  return (
    <CCard className="mb-4">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Danh sách phiếu nhập hàng</h5>
          <CButton
            color="primary"
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <FontAwesomeIcon icon={faRotate} className="me-2" />
            Làm mới
          </CButton>
        </div>
        
        <CSmartTable
          columns={columns}
          items={tableData}
          itemsPerPageSelect
          itemsPerPage={10}
          pagination
          columnFilter
          columnSorter
          tableFilter
          tableFilterLabel="Tìm kiếm:"
          tableFilterPlaceholder="Nhập từ khóa..."
          itemsPerPageLabel="Số dòng mỗi trang:"
          noItemsLabel="Chưa có phiếu nhập hàng nào"
          scopedColumns={{
            stt: (item) => (
              <td className="text-center">{item.stt}</td>
            ),
            ngayNhap: (item) => (
              <td>
                {item.ngayNhap ? new Date(item.ngayNhap).toLocaleDateString('vi-VN') : ''}
              </td>
            ),
            thoiGianTao: (item) => (
              <td>
                {item.thoiGianTao ? new Date(item.thoiGianTao).toLocaleString('vi-VN') : ''}
              </td>
            ),
            tongSoLuong: (item) => (
              <td className="text-center">{item.tongSoLuong || 0}</td>
            ),
            actions: (item) => (
              <td >
                <CButton
                  color="info"
                  variant="ghost"
                  size="sm"
                  className="me-2"
                  onClick={() => onViewDetail(item.maPhieuNhapHang)}
                  title="Xem chi tiết"
                >
                  <FontAwesomeIcon icon={faEye} />
                </CButton>
                {!item.daXoa && (
                  <CButton
                    color="danger"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item.maPhieuNhapHang, item.stt)}
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </CButton>
                )}
              </td>
            ),
          }}
        />
      </CCardBody>
    </CCard>
  )
}

DanhSachPhieuNhap.propTypes = {
  phieuNhapList: PropTypes.arrayOf(PropTypes.shape({
    maPhieuNhapHang: PropTypes.string,
    ngayNhap: PropTypes.string,
    nguoiTao: PropTypes.string,
    thoiGianTao: PropTypes.string,
    tongSoLuong: PropTypes.number,
    daXoa: PropTypes.bool,
  })).isRequired,
  onRefresh: PropTypes.func.isRequired,
  onViewDetail: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default DanhSachPhieuNhap
