/**
 * Demo component để test hệ thống phân quyền
 * Sử dụng để kiểm tra các scope khác nhau
 */

import React, { useState } from 'react'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react-pro'
import { usePermissions } from '../hooks/usePermissions'

const PermissionDemo = () => {
  const {
    userInfo,
    allowedTabs,
    isLoading,
    isTokenValid,
    checkPermission,
    canAccessTab,
    canAccessButton,
    refreshPermissions,
  } = usePermissions()

  const [testToken, setTestToken] = useState('')

  // Function để set token test
  const handleSetTestToken = () => {
    if (testToken.trim()) {
      localStorage.setItem('token', testToken.trim())
      refreshPermissions()
    }
  }

  // Function để clear token
  const handleClearToken = () => {
    localStorage.removeItem('token')
    refreshPermissions()
  }

  // Sample tokens để test
  const sampleTokens = {
    admin:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5oYW52aWVuIjoiTlYwMDAxIiwic3ViIjoiY3ZraGFuZyIsInNjb3BlIjoiUk9MRV9MRVRBTiBCVU9OR1BIT05HIFNPRFBPSE9ORyBMSU5FUEFIT05HIFRIQU5HUEhPTkcgRFVCQU9MT0FJUEFIT05HIFNPRFBPSE9ORyBUSU5HUEhPTkcgVEhPTkdLRUQiLCJpc3MiOiJHb2xkZW4tRXJhLmNvbSIsImV4cCI6MTc2MTAzNzMxMywiaWF0IjoxNzYxMDMzNzEzLCJqdGkiOiJlZDdkZjBjOC1hNDEzLTQ0MTctOTRmNy03MjlkYzcwOTEzMzIifQ.example',
    letan:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5oYW52aWVuIjoiTlYwMDAyIiwic3ViIjoibGV0YW4iLCJzY29wZSI6IlJPTEVfTEVUQU4gU09ET1BIT05HIiwiaXNzIjoiR29sZGVuLUVyYS5jb20iLCJleHAiOjE3NjEwMzczMTMsImlhdCI6MTc2MTAzMzcxMywianRpIjoiZWQ3ZGYwYzgtYTQxMy00NDE3LTk0ZjctNzI5ZGM3MDkxMzMyIn0.example',
    buongphong:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5oYW52aWVuIjoiTlYwMDAzIiwic3ViIjoiYnVvbmdwaG9uZyIsInNjb3BlIjoiUk9MRV9MRVRBTiBCVU9OR1BIT05HIiwiaXNzIjoiR29sZGVuLUVyYS5jb20iLCJleHAiOjE3NjEwMzczMTMsImlhdCI6MTc2MTAzMzcxMywianRpIjoiZWQ3ZGYwYzgtYTQxMy00NDE3LTk0ZjctNzI5ZGM3MDkxMzMyIn0.example',
    dubao:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5oYW52aWVuIjoiTlYwMDA0Iiwic3ViIjoiZHViYW8iLCJzY29wZSI6IlJPTEVfTEVUQU4gRFVCQU9MT0FJUEFIT05HIiwiaXNzIjoiR29sZGVuLUVyYS5jb20iLCJleHAiOjE3NjEwMzczMTMsImlhdCI6MTc2MTAzMzcxMywianRpIjoiZWQ3ZGYwYzgtYTQxMy00NDE3LTk0ZjctNzI5ZGM3MDkxMzMyIn0.example',
  }

  if (isLoading) {
    return <div>Đang tải thông tin phân quyền...</div>
  }

  return (
    <div className="container-fluid">
      <CRow>
        <CCol md={12}>
          <CCard>
            <CCardHeader>
              <h4>Demo Hệ Thống Phân Quyền</h4>
            </CCardHeader>
            <CCardBody>
              {/* Token Status */}
              <div className="mb-4">
                <h5>Trạng thái Token:</h5>
                <p className={isTokenValid ? 'text-success' : 'text-danger'}>
                  {isTokenValid ? '✔️ Token hợp lệ' : '❌ Token không hợp lệ hoặc đã hết hạn'}
                </p>
              </div>

              {/* User Info */}
              {userInfo && (
                <div className="mb-4">
                  <h5>Thông tin User:</h5>
                  <ul>
                    <li>
                      <strong>Mã nhân viên:</strong> {userInfo.manhanvien}
                    </li>
                    <li>
                      <strong>Username:</strong> {userInfo.sub}
                    </li>
                    <li>
                      <strong>Scopes:</strong> {userInfo.scopes.join(', ')}
                    </li>
                  </ul>
                </div>
              )}

              {/* Allowed Tabs */}
              <div className="mb-4">
                <h5>Các Tab được phép truy cập:</h5>
                {allowedTabs.length > 0 ? (
                  <ul>
                    {allowedTabs.map((tab) => (
                      <li key={tab.key}>
                        <strong>Tab {tab.key}:</strong> {tab.name} (Scope: {tab.scope})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-warning">Không có tab nào được phép truy cập</p>
                )}
              </div>

              {/* Permission Tests */}
              <div className="mb-4">
                <h5>Kiểm tra quyền cụ thể:</h5>
                <div className="row">
                  <div className="col-md-6">
                    <h6>Quyền Tab:</h6>
                    <ul>
                      <li>SODOPHONG: {canAccessTab(2) ? '✔️' : '❌'}</li>
                      <li>BUONGPHONG: {canAccessTab(3) ? '✔️' : '❌'}</li>
                      <li>LINEPHONG: {canAccessTab(6) ? '✔️' : '❌'}</li>
                      <li>DUBAOLOAIPHONG: {canAccessTab(1) ? '✔️' : '❌'}</li>
                      <li>NHAHANG: {canAccessTab(4) ? '✔️' : '❌'}</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6>Quyền Button:</h6>
                    <ul>
                      <li>DATPHONG: {canAccessButton('DATPHONG') ? '✔️' : '❌'}</li>
                      <li>DANHSACHDATPHONG: {canAccessButton('DANHSACHDATPHONG') ? '✔️' : '❌'}</li>
                      <li>THONGKE: {canAccessButton('THONGKE') ? '✔️' : '❌'}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Token Testing */}
              <div className="mb-4">
                <h5>Test với Token mẫu:</h5>
                <div className="mb-3">
                  <CButton
                    color="primary"
                    className="me-2 mb-2"
                    onClick={() => {
                      localStorage.setItem('token', sampleTokens.admin)
                      refreshPermissions()
                    }}
                  >
                    Test Admin Token
                  </CButton>
                  <CButton
                    color="info"
                    className="me-2 mb-2"
                    onClick={() => {
                      localStorage.setItem('token', sampleTokens.letan)
                      refreshPermissions()
                    }}
                  >
                    Test Lễ Tân Token
                  </CButton>
                  <CButton
                    color="warning"
                    className="me-2 mb-2"
                    onClick={() => {
                      localStorage.setItem('token', sampleTokens.buongphong)
                      refreshPermissions()
                    }}
                  >
                    Test Buồng Phòng Token
                  </CButton>
                  <CButton
                    color="success"
                    className="me-2 mb-2"
                    onClick={() => {
                      localStorage.setItem('token', sampleTokens.dubao)
                      refreshPermissions()
                    }}
                  >
                    Test Dự Báo Token
                  </CButton>
                  <CButton color="danger" className="mb-2" onClick={handleClearToken}>
                    Clear Token
                  </CButton>
                </div>

                <div className="mb-3">
                  <label className="form-label">Hoặc nhập token tùy chỉnh:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={testToken}
                      onChange={(e) => setTestToken(e.target.value)}
                      placeholder="Nhập JWT token..."
                    />
                    <CButton color="secondary" onClick={handleSetTestToken}>
                      Set Token
                    </CButton>
                  </div>
                </div>
              </div>

              {/* Current Token Display */}
              <div className="mb-4">
                <h5>Token hiện tại:</h5>
                <div className="bg-light p-3 rounded">
                  <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                    {localStorage.getItem('token') || 'Không có token'}
                  </code>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default PermissionDemo
