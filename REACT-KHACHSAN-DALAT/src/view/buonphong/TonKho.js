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
import { faSync } from '@fortawesome/free-solid-svg-icons'
import axiosInstance from 'src/service/axiosConfig'

const TonKho = () => {
  const [tonKhoList, setTonKhoList] = useState([])
  const [toast, addToast] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
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
        <small>Vừa xong</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  // Load danh sách tồn kho
  const loadTonKho = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/phieu-nhap-hang/ton-kho')
      console.log('Response tồn kho:', response)
      console.log('Response data tồn kho:', response.data)
      
      // Kiểm tra response.data.code và lấy dữ liệu từ response.data.result
      if (response.data && response.data.code === 200) {
        setTonKhoList(response.data.result || [])
        // addToast(exampleToast('✔️ Tải danh sách tồn kho thành công'))
      } else {
        setTonKhoList([])
        addToast(exampleToast('⚠️ Không có dữ liệu tồn kho'))
      }
    } catch (error) {
      console.error('Lỗi load danh sách tồn kho:', error)
      addToast(exampleToast('❌ Lỗi khi tải danh sách tồn kho'))
    } finally {
      setIsLoading(false)
    }
  }

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadTonKho()
  }, [])

  return (
    <>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      
      <CCard>
        <CCardBody>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Danh sách tồn kho</h5>
              <CButton
                color="primary"
                variant="outline"
                onClick={loadTonKho}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faSync} className={`me-2 ${isLoading ? 'fa-spin' : ''}`} />
                Làm mới
              </CButton>
            </div>
          </div>

          {/* Bảng tồn kho */}
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: '50px' }}>STT</th>
                  <th style={{ width: '120px' }}>Mã</th>
                  <th>Tên dịch vụ</th>
                  <th className="text-center" style={{ width: '100px' }}>ĐVT</th>
                  <th className="text-center" style={{ width: '120px' }}>Tồn ban đầu</th>
                  <th className="text-center" style={{ width: '120px' }}>Đã sử dụng</th>
                  <th className="text-center" style={{ width: '120px' }}>Tồn còn lại</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : tonKhoList.length > 0 ? (
                  tonKhoList.map((item, index) => (
                    <tr key={item.ma_dich_vu_mien_phi || index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.ma_dich_vu_mien_phi || '-'}</td>
                      <td>{item.ten_dich_vu_mien_phi || '-'}</td>
                      <td className="text-center">{item.don_vi_tinh || '-'}</td>
                      <td className="text-center">{item.ton_kho_ban_dau ?? 0}</td>
                      <td className="text-center">
                        <span className={`badge ${item.da_su_dung > 0 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {item.da_su_dung ?? 0}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${item.ton_con_lai > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {item.ton_con_lai ?? 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      Không có dữ liệu tồn kho
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tổng số mặt hàng */}
          {tonKhoList.length > 0 && (
            <div className="mt-3">
              <p className="mb-0">
                <strong>Tổng số mặt hàng:</strong> {tonKhoList.length}
              </p>
            </div>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default TonKho
