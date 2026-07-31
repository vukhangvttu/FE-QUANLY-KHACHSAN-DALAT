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
  CFormSelect,
  CSpinner,
  CAlert,
  CFormCheck,
} from '@coreui/react-pro'
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const RoomPrices = () => {
  const [roomPrices, setRoomPrices] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRoomPrice, setSelectedRoomPrice] = useState(null)
  const [formData, setFormData] = useState({
    maGiaPhong: '',
    maLoaiPhong: '',
    maLoaiGia: '',
    tenLoaiGia: '',
    gia: '',
    giaNgayThuong: false,
    giaCuoiTuan: false,
    giaNgayLe: false,
    giaGiuong: false,
  })

  useEffect(() => {
    fetchRoomPrices()
    fetchRoomTypes()
  }, [])

  const fetchRoomPrices = async () => {
    try {
      setLoading(true)
      // Gọi API lấy danh sách giá phòng
      const response = await fetch('/api/room-prices')
      const data = await response.json()
      setRoomPrices(data)
    } catch (err) {
      setError('Không thể tải danh sách giá phòng')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoomTypes = async () => {
    try {
      // Gọi API lấy danh sách loại phòng
      const response = await fetch('/api/room-types')
      const data = await response.json()
      setRoomTypes(data)
    } catch (err) {
      setError('Không thể tải danh sách loại phòng')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (selectedRoomPrice) {
        // Cập nhật giá phòng
        await fetch(`/api/room-prices/${selectedRoomPrice.maGiaPhong}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      } else {
        // Thêm giá phòng mới
        await fetch('/api/room-prices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
      }
      setModalVisible(false)
      fetchRoomPrices()
    } catch (err) {
      setError('Không thể lưu giá phòng')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (maGiaPhong) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giá phòng này?')) {
      try {
        setLoading(true)
        await fetch(`/api/room-prices/${maGiaPhong}`, {
          method: 'DELETE',
        })
        fetchRoomPrices()
      } catch (err) {
        setError('Không thể xóa giá phòng')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEdit = (roomPrice) => {
    setSelectedRoomPrice(roomPrice)
    setFormData({
      maGiaPhong: roomPrice.maGiaPhong,
      maLoaiPhong: roomPrice.maLoaiPhong,
      maLoaiGia: roomPrice.maLoaiGia,
      tenLoaiGia: roomPrice.tenLoaiGia,
      gia: roomPrice.gia,
      giaNgayThuong: roomPrice.giaNgayThuong,
      giaCuoiTuan: roomPrice.giaCuoiTuan,
      giaNgayLe: roomPrice.giaNgayLe,
      giaGiuong: roomPrice.giaGiuong,
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setSelectedRoomPrice(null)
    setFormData({
      maGiaPhong: '',
      maLoaiPhong: '',
      maLoaiGia: '',
      tenLoaiGia: '',
      gia: '',
      giaNgayThuong: false,
      giaCuoiTuan: false,
      giaNgayLe: false,
      giaGiuong: false,
    })
    setModalVisible(true)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Quản lý giá phòng</strong>
            <CButton color="primary" className="float-end" onClick={handleAdd}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Thêm giá phòng
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
                    <CTableHeaderCell>Mã giá phòng</CTableHeaderCell>
                    <CTableHeaderCell>Loại phòng</CTableHeaderCell>
                    <CTableHeaderCell>Tên loại giá</CTableHeaderCell>
                    <CTableHeaderCell>Giá</CTableHeaderCell>
                    <CTableHeaderCell>Giá ngày thường</CTableHeaderCell>
                    <CTableHeaderCell>Giá cuối tuần</CTableHeaderCell>
                    <CTableHeaderCell>Giá ngày lễ</CTableHeaderCell>
                    <CTableHeaderCell>Giá giường</CTableHeaderCell>
                    <CTableHeaderCell>Thao tác</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {roomPrices.map((roomPrice) => (
                    <CTableRow key={roomPrice.maGiaPhong}>
                      <CTableDataCell>{roomPrice.maGiaPhong}</CTableDataCell>
                      <CTableDataCell>
                        {
                          roomTypes.find((type) => type.maLoaiPhong === roomPrice.maLoaiPhong)
                            ?.tenLoaiPhong
                        }
                      </CTableDataCell>
                      <CTableDataCell>{roomPrice.tenLoaiGia}</CTableDataCell>
                      <CTableDataCell>{roomPrice.gia.toLocaleString('vi-VN')} VNĐ</CTableDataCell>
                      <CTableDataCell>{roomPrice.giaNgayThuong ? 'Có' : 'Không'}</CTableDataCell>
                      <CTableDataCell>{roomPrice.giaCuoiTuan ? 'Có' : 'Không'}</CTableDataCell>
                      <CTableDataCell>{roomPrice.giaNgayLe ? 'Có' : 'Không'}</CTableDataCell>
                      <CTableDataCell>{roomPrice.giaGiuong ? 'Có' : 'Không'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(roomPrice)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(roomPrice.maGiaPhong)}
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
            {selectedRoomPrice ? 'Cập nhật giá phòng' : 'Thêm giá phòng mới'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <div className="mb-3">
              <CFormSelect
                label="Loại phòng"
                value={formData.maLoaiPhong}
                onChange={(e) => setFormData({ ...formData, maLoaiPhong: e.target.value })}
                required
              >
                <option value="">Chọn loại phòng</option>
                {roomTypes.map((type) => (
                  <option key={type.maLoaiPhong} value={type.maLoaiPhong}>
                    {type.tenLoaiPhong}
                  </option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormInput
                label="Mã loại giá"
                value={formData.maLoaiGia}
                onChange={(e) => setFormData({ ...formData, maLoaiGia: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Tên loại giá"
                value={formData.tenLoaiGia}
                onChange={(e) => setFormData({ ...formData, tenLoaiGia: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormInput
                label="Giá"
                type="number"
                value={formData.gia}
                onChange={(e) => setFormData({ ...formData, gia: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormCheck
                label="Giá ngày thường"
                checked={formData.giaNgayThuong}
                onChange={(e) => setFormData({ ...formData, giaNgayThuong: e.target.checked })}
              />
            </div>
            <div className="mb-3">
              <CFormCheck
                label="Giá cuối tuần"
                checked={formData.giaCuoiTuan}
                onChange={(e) => setFormData({ ...formData, giaCuoiTuan: e.target.checked })}
              />
            </div>
            <div className="mb-3">
              <CFormCheck
                label="Giá ngày lễ"
                checked={formData.giaNgayLe}
                onChange={(e) => setFormData({ ...formData, giaNgayLe: e.target.checked })}
              />
            </div>
            <div className="mb-3">
              <CFormCheck
                label="Giá giường"
                checked={formData.giaGiuong}
                onChange={(e) => setFormData({ ...formData, giaGiuong: e.target.checked })}
              />
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

export default RoomPrices
