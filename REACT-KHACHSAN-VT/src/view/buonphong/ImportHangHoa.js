import React, { useState, useRef, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCirclePlus,
  faFileExcel,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons'
import * as XLSX from 'xlsx'
import { getAllDichVuMienPhi } from 'src/service/XepPhongBooKingService'
import axiosInstance from 'src/service/axiosConfig'
import ChiTietPhieuNhapModal from './ChiTietPhieuNhapModal'
import DanhSachPhieuNhap from './DanhSachPhieuNhap'
import InvalidRowsAlert from './InvalidRowsAlert'
import TableNhapHang from './TableNhapHang'

const ImportHangHoa = () => {
  const [rows, setRows] = useState([])
  const [invalidRows, setInvalidRows] = useState([]) // Các dòng có mã hàng không hợp lệ
  const [dichVuList, setDichVuList] = useState([]) // Danh sách dịch vụ từ API
  const [phieuNhapList, setPhieuNhapList] = useState([]) // Danh sách phiếu nhập hàng
  const [maPhieuNhapHang, setMaPhieuNhapHang] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [chiTietPhieu, setChiTietPhieu] = useState(null)
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const fileInputRef = useRef(null)



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
        <small>Vừa xong</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  // Load danh sách phiếu nhập hàng
  const loadPhieuNhapHang = async () => {
    try {
      const response = await axiosInstance.get('/phieu-nhap-hang/list')
      console.log('Response phiếu nhập hàng:', response)
      console.log('Response data:', response.data)
      
      // Kiểm tra response.data.code và lấy dữ liệu từ response.data.result
      if (response.data && response.data.code === 200) {
        setPhieuNhapList(response.data.result || [])
      } else {
        setPhieuNhapList([])
      }
    } catch (error) {
      console.error('Lỗi load danh sách phiếu nhập hàng:', error)
      addToast(exampleToast('❌ Lỗi khi tải danh sách phiếu nhập hàng'))
    }
  }

  // Load danh sách tồn kho
  // Xem chi tiết phiếu nhập hàng
  const handleViewDetail = async (maPhieuNhap) => {
    try {
      const response = await axiosInstance.get(`/phieu-nhap-hang/chi-tiet-nhap-hang/${maPhieuNhap}`)
      console.log('Chi tiết phiếu nhập hàng:', response)
      console.log('Chi tiết data:', response.data)
      
      setChiTietPhieu(response.data)
      setMaPhieuNhapHang(maPhieuNhap)
      setModalVisible(true)
    } catch (error) {
      console.error('Lỗi load chi tiết phiếu nhập hàng:', error)
      addToast(exampleToast('❌ Lỗi khi tải chi tiết phiếu nhập hàng'))
    }
  }

  // Xóa phiếu nhập hàng
  const handleDelete = async (maPhieuNhap) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phiếu nhập hàng này?')) {
      return
    }
    
    try {
      const response = await axiosInstance.delete(`/phieu-nhap-hang/${maPhieuNhap}`)
      
      // Kiểm tra response.data.code
      if (response.data && response.data.code === 200) {
        addToast(exampleToast('✔️ Xóa phiếu nhập hàng thành công'))
        
        // Reload danh sách phiếu nhập hàng
        loadPhieuNhapHang()
      } else {
        const errorMessage = response.data?.message || 'Có lỗi xảy ra khi xóa phiếu nhập hàng'
        addToast(exampleToast(`❌ ${errorMessage}`))
      }
    } catch (error) {
      console.error('Lỗi khi xóa phiếu nhập hàng:', error)
      const errorMessage = error.response?.data?.message || 'Lỗi khi xóa phiếu nhập hàng'
      addToast(exampleToast(`❌ ${errorMessage}`))
    }
  }

  // Lưu thay đổi chi tiết phiếu nhập hàng
  const handleSaveDetailChanges = async (maPhieuNhapHang, danhSach) => {
    try {
      console.log('Gửi PUT request tới:', `/phieu-nhap-hang/${maPhieuNhapHang}`)
      console.log('Danh sách chi tiết (RequestBody):', danhSach)
      
      // Backend nhận List<NhapHangRequest> trực tiếp trong body, không cần wrap object
      const response = await axiosInstance.put(`/phieu-nhap-hang/${maPhieuNhapHang}`, danhSach)
      
      if (response.data && response.data.code === 200) {
        addToast(exampleToast('✔️ Cập nhật phiếu nhập hàng thành công'))
        
        // Reload danh sách và đóng modal
        loadPhieuNhapHang()
        setModalVisible(false)
        setChiTietPhieu(null)
      } else {
        const errorMessage = response.data?.message || 'Có lỗi xảy ra khi cập nhật'
        addToast(exampleToast(`❌ ${errorMessage}`))
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật chi tiết phiếu nhập hàng:', error)
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật phiếu nhập hàng'
      addToast(exampleToast(`❌ ${errorMessage}`))
    }
  }

  // Xóa dòng trong chi tiết phiếu nhập hàng
  const handleDeleteDetailRow = async (maNhapHang, index) => {
    try {
      const response = await axiosInstance.delete(`/phieu-nhap-hang/chi-tiet/${maNhapHang}`)
      
      if (response.data && response.data.code === 200) {
        addToast(exampleToast('✔️ Xóa dòng thành công'))
        
        // Reload chi tiết
        if (chiTietPhieu?.result?.[0]?.maPhieuNhapHang) {
          handleViewDetail(chiTietPhieu.result[0].maPhieuNhapHang)
        }
      } else {
        const errorMessage = response.data?.message || 'Có lỗi xảy ra khi xóa dòng'
        addToast(exampleToast(`❌ ${errorMessage}`))
      }
    } catch (error) {
      console.error('Lỗi khi xóa dòng:', error)
      const errorMessage = error.response?.data?.message || 'Lỗi khi xóa dòng'
      addToast(exampleToast(`❌ ${errorMessage}`))
    }
  }

  // Load danh sách dịch vụ miễn phí khi component mount
  useEffect(() => {
    const loadDichVu = async () => {
      try {
        const response = await getAllDichVuMienPhi()
        setDichVuList(response || [])
      } catch (error) {
        console.error('Lỗi load danh sách dịch vụ:', error)
        addToast(exampleToast('❌ Lỗi khi tải danh sách hàng hóa'))
      }
    }
    loadDichVu()
    loadPhieuNhapHang()
  }, [])

  // Thêm dòng mới
  const handleAddRow = () => {
    const newRow = {
      stt: rows.length + 1,
      maDichVuMienPhi: '',
      maHang: '',
      tenHang: '',
      soLuong: 0,
      donViTinh: '',
      loai: '',
      ghiChu: '',
    }
    setRows([...rows, newRow])
  }

  // Xóa dòng
  const handleRemoveRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index)
    // Cập nhật lại STT
    const reindexedRows = updatedRows.map((row, idx) => ({
      ...row,
      stt: idx + 1,
    }))
    setRows(reindexedRows)
  }

  // Xóa dòng không hợp lệ
  const handleRemoveInvalidRow = (index) => {
    const updatedInvalidRows = invalidRows.filter((_, i) => i !== index)
    setInvalidRows(updatedInvalidRows)
  }

  // Xử lý khi chọn mã hàng từ combobox
  const handleMaHangChange = (index, maDichVuMienPhi) => {
    const selectedDichVu = dichVuList.find((dv) => dv.maDichVuMienPhi === maDichVuMienPhi)
    if (selectedDichVu) {
      const updatedRows = [...rows]
      updatedRows[index] = {
        ...updatedRows[index],
        maDichVuMienPhi: selectedDichVu.maDichVuMienPhi,
        maHang: selectedDichVu.maDichVuMienPhi,
        tenHang: selectedDichVu.tenDichVuMienPhi,
        donViTinh: selectedDichVu.donViTinh || '',
      }
      setRows(updatedRows)
    }
  }

  // Cập nhật giá trị của một ô
  const handleCellChange = (index, field, value) => {
    const updatedRows = [...rows]
    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    }
    setRows(updatedRows)
  }

  // Xử lý import từ Excel
  const handleImportExcel = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        const validRows = []
        const invalidRowsData = []


        // Bỏ qua dòng tiêu đề (dòng đầu tiên) và lọc bỏ dòng rỗng
        jsonData
          .slice(1)
          .filter((row) => {
            // Bỏ qua dòng rỗng: kiểm tra nếu có ít nhất mã hàng hoặc tên hàng
            return row[1] || row[2]
          })
          .forEach((row, index) => {
            const maHang = row[1] || ''
            const tenHang = row[2] || ''
            const soLuong = row[3] || 0
            const loai = row[4] || ''
            const ghiChu = row[5] || ''

            // Kiểm tra mã hàng có trong danh sách dịch vụ không
            const dichVu = dichVuList.find((dv) => dv.maDichVuMienPhi === maHang)

            if (dichVu) {
              // Mã hàng hợp lệ - thêm vào danh sách chính
              validRows.push({
                stt: validRows.length + 1,
                maDichVuMienPhi: dichVu.maDichVuMienPhi,
                maHang: dichVu.maDichVuMienPhi,
                tenHang: dichVu.tenDichVuMienPhi,
                soLuong: soLuong,
                donViTinh: dichVu.donViTinh || '',
                loai: loai,
                ghiChu: ghiChu,
              })
            } else {
              // Mã hàng không hợp lệ - thêm vào danh sách cảnh báo
              invalidRowsData.push({
                stt: invalidRowsData.length + 1,
                maHang: maHang,
                tenHang: tenHang,
                soLuong: soLuong,
                donViTinh: '',
                loai: loai,
                ghiChu: ghiChu,
                lyDo: 'Mã hàng không tồn tại trong hệ thống',
              })
            }
          })

        setRows(validRows)
        setInvalidRows(invalidRowsData)
        
        if (validRows.length > 0) {
          addToast(exampleToast(`✔️ Import thành công ${validRows.length} dòng hợp lệ`))
        }
        if (invalidRowsData.length > 0) {
          addToast(exampleToast(`⚠️ Có ${invalidRowsData.length} dòng không hợp lệ, vui lòng kiểm tra`))
        }
      } catch (error) {
        console.error('Lỗi khi đọc file Excel:', error)
        addToast(exampleToast('❌ Lỗi khi đọc file Excel'))
      }
    }
    reader.readAsArrayBuffer(file)

    // Reset input để có thể chọn lại cùng một file
    event.target.value = ''
  }

  // Xử lý lưu dữ liệu
  const handleSave = async () => {
    if (rows.length === 0) {
      addToast(exampleToast('⚠️ Chưa có dữ liệu để lưu'))
      return
    }

    // Kiểm tra dữ liệu: Mã hàng, Số lượng và Loại
    const invalidDataRows = rows.filter(
      (row) => !row.maDichVuMienPhi || !row.soLuong || row.soLuong <= 0,
    )

    if (invalidDataRows.length > 0) {
      addToast(exampleToast('⚠️ Vui lòng điền đầy đủ thông tin: Mã hàng, Số lượng (> 0) và Loại'))
      return
    }

    try {
      // Map dữ liệu theo cấu trúc API yêu cầu
      const payload = rows.map(row => ({
        maDichVu: row.maDichVuMienPhi,
        soLuong: parseInt(row.soLuong),
        loai: row.loai.trim(),
        ghiChu: row.ghiChu || ''
      }))

      // Gọi API
      const response = await axiosInstance.post('/phieu-nhap-hang', payload)

      // Kiểm tra response.data.code (API trả về status 200 nhưng có thể có lỗi trong data)
      if (response.data && response.data.code !== 200) {
        const errorMessage = response.data.message || 'Có lỗi xảy ra khi lưu phiếu nhập hàng'
        addToast(exampleToast(`❌ ${errorMessage}`))
        return
      }
      
      addToast(exampleToast('✔️ Lưu phiếu nhập hàng thành công'))
      
      // Reset dữ liệu sau khi lưu thành công
      setRows([])
      
      // Reload danh sách phiếu nhập hàng
      loadPhieuNhapHang()
    } catch (error) {
      console.error('Lỗi khi lưu phiếu nhập hàng:', error)
      const errorMessage = error.response?.data?.message || 'Lỗi khi lưu phiếu nhập hàng'
      addToast(exampleToast(`❌ ${errorMessage}`))
    }
  }

  // Export template Excel
  const handleExportTemplate = () => {
    // Tạo link để download file template từ thư mục public
    const link = document.createElement('a')
    link.href = `${process.env.PUBLIC_URL}/buongphong/template-import.xlsx`
    link.download = 'Template_Import_Hang_Hoa.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast(exampleToast('✔️ Tải template thành công'))
  }

  return (
    <>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      
      {/* Tabs Navigation */}
      <CCard className="mb-4">
        <CCardBody>
          <div className="mb-3">
            <h5 className="mb-3">Nhập hàng vào kho</h5>
                
                <div className="d-flex gap-2 mb-3">
                  <CButton
                    color="success"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                    Import từ Excel
                  </CButton>
                  
                  <CButton
                    color="info"
                    variant="outline"
                    onClick={handleExportTemplate}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                    Tải template Excel
                  </CButton>
                  
                  <CButton
                    color="primary"
                    variant="outline"
                    onClick={handleAddRow}
                  >
                    <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                    Thêm dòng
                  </CButton>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  onChange={handleImportExcel}
                />
              </div>

              {/* Bảng cảnh báo các mã hàng không hợp lệ */}
              <InvalidRowsAlert 
                invalidRows={invalidRows}
                onRemoveRow={handleRemoveInvalidRow}
              />

              {/* Bảng nhập hàng */}
              <TableNhapHang
                rows={rows}
                dichVuList={dichVuList}
                onMaHangChange={handleMaHangChange}
                onCellChange={handleCellChange}
                onRemoveRow={handleRemoveRow}
              />

              <div className="d-flex justify-content-end mt-3">
                <CButton color="primary" onClick={handleSave}>
                  <FontAwesomeIcon icon={faFloppyDisk} className="me-2" />
                  Lưu
                </CButton>
              </div>

              {/* Danh sách phiếu nhập hàng */}
              <div className="mt-4">
                <DanhSachPhieuNhap
                  phieuNhapList={phieuNhapList}
                  onRefresh={loadPhieuNhapHang}
                  onViewDetail={handleViewDetail}
                  onDelete={handleDelete}
                />
              </div>
        </CCardBody>
      </CCard>

      {/* Modal chi tiết phiếu nhập hàng */}
      <ChiTietPhieuNhapModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setChiTietPhieu(null)
        }}
        maPhieuNhapHang={maPhieuNhapHang}
        chiTietPhieu={chiTietPhieu}
        dichVuList={dichVuList}
        onSave={handleSaveDetailChanges}
        onDeleteRow={handleDeleteDetailRow}
      />
    </>
  )
}

export default ImportHangHoa
