import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CSpinner,
  CAlert,
} from '@coreui/react-pro'
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const RoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState(null)
  const [formData, setFormData] = useState({
    maLoaiPhong: '',
    tenLoaiPhong: '',
    moTa: '',
    soNguoiToiDa: '',
    dienTich: '',
    trangThai: '1',
  })

  useEffect(() => {
    fetchRoomTypes()
  }, [])

  const fetchRoomTypes = async () => {
    try {
      setLoading(true)
      // Gọi API lấy danh sách loại phòng
      const response = await fetch('/api/room-types')
      const data = await response.json()
      setRoomTypes(data)
    } catch (err) {
      setError('Không thể tải danh sách loại phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (selectedRoomType) {
        // Cập nhật loại phòng
        await fetch(`/api/room-types/${selectedRoomType.maLoaiPhong}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Thêm loại phòng mới
        await fetch('/api/room-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }
      setModalVisible(false)
      fetchRoomTypes()
    } catch (err) {
      setError('Không thể lưu loại phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (maLoaiPhong) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) {
      try {
        setLoading(true)
        await fetch(`/api/room-types/${maLoaiPhong}`, {
          method: 'DELETE',
        })
        fetchRoomTypes()
      } catch (err) {
        setError('Không thể xóa loại phòng')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEdit = (roomType) => {
    setSelectedRoomType(roomType)
    setFormData({
      maLoaiPhong: roomType.maLoaiPhong,
      tenLoaiPhong: roomType.tenLoaiPhong,
      moTa: roomType.moTa,
      soNguoiToiDa: roomType.soNguoiToiDa,
      dienTich: roomType.dienTich,
      trangThai: roomType.trangThai,
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setSelectedRoomType(null)
    setFormData({
      maLoaiPhong: '',
      tenLoaiPhong: '',
      moTa: '',
      soNguoiToiDa: '',
      dienTich: '',
      trangThai: '1',
    })
    setModalVisible(true)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản lý loại phòng</strong>
            <CButton color="primary" className="float-end" onClick={handleAdd}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Thêm loại phòng
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Mã loại phòng</CTableHeaderCell>
                    <CTableHeaderCell>Tên loại phòng</CTableHeaderCell>
                    <CTableHeaderCell>Mô tả</CTableHeaderCell>
                    <CTableHeaderCell>Số người tối đa</CTableHeaderCell>
                    <CTableHeaderCell>Diện tích</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell>Thao tác</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {roomTypes.map((roomType) => (
                    <CTableRow key={roomType.maLoaiPhong}>
                      <CTableDataCell>{roomType.maLoaiPhong}</CTableDataCell>
                      <CTableDataCell>{roomType.tenLoaiPhong}</CTableDataCell>
                      <CTableDataCell>{roomType.moTa}</CTableDataCell>
                      <CTableDataCell>{roomType.soNguoiToiDa}</CTableDataCell>
                      <CTableDataCell>{roomType.dienTich}</CTableDataCell>
                      <CTableDataCell>
                        {roomType.trangThai === '1' ? 'Hoạt động' : 'Không hoạt động'}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(roomType)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(roomType.maLoaiPhong)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>
            {selectedRoomType ? 'Cập nhật loại phòng' : 'Thêm loại phòng mới'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <CFormInput
                label="Mã loại phòng"
                value={formData.maLoaiPhong}
                onChange={(e) => setFormData({ ...formData, maLoaiPhong: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Tên loại phòng"
                value={formData.tenLoaiPhong}
                onChange={(e) => setFormData({ ...formData, tenLoaiPhong: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormTextarea
                label="Mô tả"
                value={formData.moTa}
                onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Số người tối đa"
                type="number"
                value={formData.soNguoiToiDa}
                onChange={(e) => setFormData({ ...formData, soNguoiToiDa: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Diện tích"
                value={formData.dienTich}
                onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormSelect
                label="Trạng thái"
                value={formData.trangThai}
                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
              >
                <option value="1">Hoạt động</option>
                <option value="0">Không hoạt động</option>
              </CFormSelect>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <CSpinner size="sm" /> : 'Lưu'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default RoomTypes
