import React, { useEffect, useRef, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CCol,
  CRow,
  CButton,
  CToast,
  CToastHeader,
  CToastBody,
  CToaster,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CForm,
  CSpinner,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

import PropTypes from 'prop-types' // Import thư viện PropTypes

import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import config from 'src/service/Config'

const DoiMatKhau = ({ visible, onClose }) => {
  let navigate = useNavigate()

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

  const [trangthaiload, setTrangThaiLoad] = useState(false)
  const [matkhaucu, setMatKhauCu] = useState('')
  const [matkhaumoi, setMatKhauMoi] = useState('')
  const [nhaplaimatkhaumoi, setNhapLaiMatKhauMoi] = useState('')

  const [showMatKhauCu, setShowMatKhauCu] = useState(false)
  const [showMatKhauMoi, setShowMatKhauMoi] = useState(false)
  const [showNhapLaiMatKhauMoi, setShowNhapLaiMatKhauMoi] = useState(false)

  const changeMatKhauCu = (e) => {
    setMatKhauCu(e.target.value)
  }
  const changeMatKhauMoi = (e) => {
    setMatKhauMoi(e.target.value)
  }
  const changeNhapLaiMatKhauMoi = (e) => {
    setNhapLaiMatKhauMoi(e.target.value)
  }

  const [validated, setValidated] = useState(false)
  const handleSubmit = (event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
      setValidated(true)
    } else {
      event.preventDefault()

      if (matkhaumoi.length < 6) {
        addToast(exampleToast('Mật khẩu mới phải có ít nhất 6 ký tự'))
        return
      }

      if (matkhaumoi !== nhaplaimatkhaumoi) {
        addToast(exampleToast('Mật khẩu mới và mật khẩu nhập lại không trùng khớp'))
        return
      }
      setTrangThaiLoad(true)
      // Gọi hàm đổi mật khẩu từ API
      axios
        .post(
          `${config.apiBaseUrl}/auth/change-password`,
          {},
          {
            params: {
              passcu: matkhaucu,
              passmoi: matkhaumoi,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        )
        .then((response) => {
          setTrangThaiLoad(false)

          console.log(response.data) // Xử lý phản hồi từ server
          if (response.data.code === 200) {
            if (response.data.result === true) {
              addToast(exampleToast(response.data.message))

              setTimeout(() => {
                const data = {
                  token: localStorage.getItem('token'),
                }
                axios
                  .post(`${config.apiBaseUrl}/auth/logout`, data)
                  .then((response) => {
                    console.log(response.data)
                    if (response.data.code === 1000) localStorage.removeItem('token')
                    // Remove the redirectUrl from sessionStorage
                    sessionStorage.removeItem('redirectUrl')

                    navigate('/login')
                  })
                  .catch((error) => {
                    console.log('Error: ', error)
                  })
              }, 1500)
            } else {
              addToast(exampleToast(response.data.message))
            }
          } else if (response.data.code === 400) {
            addToast(exampleToast(response.data.message))
          } else if (response.data.code === 401) {
            navigate('/login')
          } else addToast(exampleToast(response.data.message))
        })
        .catch((error) => {
          console.error('Error:', error)
          console.log(error.response.data.message)
          if (error.response.data !== null) {
            addToast(exampleToast(JSON.stringify(error.response.data, null, 2)))
          } else addToast(exampleToast(JSON.stringify(error.response.data, null, 2)))
        })
    }
    // setValidated(true)
  }

  return (
    <>
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

      <CModal alignment="center" visible={visible} onClose={onClose}>
        <CModalHeader>
          <CModalTitle id="VerticallyCenteredExample">Thiết lập mật khẩu mới</CModalTitle>
        </CModalHeader>
        <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CModalBody>
            <CCol>
              <CRow className="mb-1">
                <CFormLabel className="col-sm-4 col-form-label">
                  Mật khẩu cũ <span className="text-danger"> *</span>{' '}
                </CFormLabel>
                <CCol sm={8}>
                  <CInputGroup className="mb-3">
                    <CInputGroupText id="basic-addon1">
                      <FontAwesomeIcon icon={faLock} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nhập mật khẩu cũ"
                      type={showMatKhauCu ? 'text' : 'password'}
                      feedback="Bạn chưa nhập mật khẩu cũ"
                      value={matkhaucu}
                      onChange={changeMatKhauCu}
                      required
                    />
                    <CInputGroupText
                      onClick={() => setShowMatKhauCu(!showMatKhauCu)}
                      style={{ cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={showMatKhauCu ? faEyeSlash : faEye} />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
              </CRow>
              <CRow className="mb-1">
                <CFormLabel className="col-sm-4 col-form-label">
                  Mật khẩu mới <span className="text-danger"> *</span>{' '}
                </CFormLabel>
                <CCol sm={8}>
                  <CInputGroup className="mb-3">
                    <CInputGroupText id="basic-addon1">
                      <FontAwesomeIcon icon={faLock} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nhập mật khẩu mới"
                      type={showMatKhauMoi ? 'text' : 'password'}
                      feedback="Bạn chưa nhập mật khẩu mới"
                      value={matkhaumoi}
                      onChange={changeMatKhauMoi}
                      required
                    />
                    <CInputGroupText
                      onClick={() => setShowMatKhauMoi(!showMatKhauMoi)}
                      style={{ cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={showMatKhauMoi ? faEyeSlash : faEye} />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel className="col-sm-4 col-form-label">
                  Nhập lại mật khẩu mới<span className="text-danger"> *</span>{' '}
                </CFormLabel>
                <CCol sm={8}>
                  <CInputGroup className="mb-3">
                    <CInputGroupText id="basic-addon1">
                      <FontAwesomeIcon icon={faLock} />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Nhập lại mật khẩu mới"
                      type={showNhapLaiMatKhauMoi ? 'text' : 'password'}
                      feedback="Bạn chưa nhập lại mật khẩu mới"
                      value={nhaplaimatkhaumoi}
                      onChange={changeNhapLaiMatKhauMoi}
                      required
                    />
                    <CInputGroupText
                      onClick={() => setShowNhapLaiMatKhauMoi(!showNhapLaiMatKhauMoi)}
                      style={{ cursor: 'pointer' }}
                    >
                      <FontAwesomeIcon icon={showNhapLaiMatKhauMoi ? faEyeSlash : faEye} />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
              </CRow>
              <span className="text-danger">
                Lưu ý: sau khi đổi mật khẩu hoàn tất hệ thống sẽ đăng xuất
              </span>
            </CCol>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={onClose}>
              Đóng
            </CButton>

            {!trangthaiload ? (
              <CButton color="success" type="submit" className="text-white">
                <FontAwesomeIcon icon={faCircleCheck} /> Xác nhận
              </CButton>
            ) : (
              <CButton color="success" variant="outline" disabled>
                <CSpinner as="primary" size="sm" aria-hidden="true" />
                &nbsp;Xác nhận...
              </CButton>
            )}
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

// Xác định PropTypes cho component
DoiMatKhau.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose, là hàm, bắt buộc
}

export default DoiMatKhau
