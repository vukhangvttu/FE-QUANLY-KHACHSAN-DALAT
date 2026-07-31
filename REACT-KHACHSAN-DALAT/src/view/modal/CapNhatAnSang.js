import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormCheck,
  CModalFooter,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'
import config from 'src/service/Config'

const CapNhatAnSang = ({ visible, onClose, thongTin, onSubmit }) => {
  const navigate = useNavigate()
  const [trangthaiload, setTrangthaiload] = useState(false)
  const [toast, addToast] = useState()
  const toaster = useRef(null)

  const exampleToast = (message) => (
    <CToast autohide={true} delay={3000}>
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
        <small>Thông báo biến mất sau 3 giây</small>
      </CToastHeader>
      <CToastBody>{message}</CToastBody>
    </CToast>
  )

  const [selectedValue, setSelectedValue] = useState('')

  const handleChange = (event) => {
    setSelectedValue(event.target.value) // Cập nhật giá trị khi chọn
  }

  const onClickUpdateAnSang = async () => {
    const ma_xepphong = thongTin.ma_xepphong
    if (ma_xepphong === null || ma_xepphong === undefined)
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))

    if (selectedValue === null || selectedValue === undefined)
      return addToast(exampleToast('⚠️ Số lượng người không hợp lệ'))
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}/an-sang-moi-ngay`,
        {},

        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          params: {
            ma_xepphong: ma_xepphong,
            so_luong: selectedValue,
          },

          validateStatus: () => {
            return true
          },
        },
      )
      setTrangthaiload(false)

      if (response.status === 200) {
        addToast(exampleToast(response.data.message))
        onClose()

        const data = {
          trangthai: true,
          soluong:
            parseInt(selectedValue) === 'all' ? thongTin.tong_so_khach : parseInt(selectedValue),
          ma_xepphong: thongTin.ma_xepphong,
        }
        onSubmit(data)
      } else if (response.status === 401) {
        navigate('/login')
      } else {
        addToast(exampleToast(JSON.stringify(response.data, null, 2)))
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 500) {
          addToast(exampleToast('❌ Thêm không thành công. Internal Server Error!'))
        } else if (data?.message) {
          addToast(exampleToast(`❌ ${data.message}`))
        } else {
          addToast(exampleToast('❌ Đã xảy ra lỗi không xác định!'))
        }
      } else {
        addToast(exampleToast('❌ Lỗi kết nối đến server'))
      }
    } finally {
      setTrangthaiload(false)
    }
  }

  useEffect(() => {
    if (visible) {
      setSelectedValue(thongTin.da_an_sang?.toString())
    }
  }, [visible])

  return (
    <>
      <div className="fixed top-0 right-0 z-50">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>

      <CModal
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Cập nhật ăn sáng
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CCol className="mb-3">
            Cập nhật số lượng ăn sáng
            <span className="text-red-500"> Phòng {thongTin.ma_phong}</span>
          </CCol>
          <CCol>
            <>
              <CFormCheck
                inline
                value={'all'}
                label="Tất cả"
                type="radio"
                name="options"
                onChange={handleChange}
                checked={selectedValue === 'all'}
              />
              <CFormCheck
                inline
                value={'0'}
                label="0 người"
                type="radio"
                name="options"
                onChange={handleChange}
                checked={selectedValue === '0'}
              />
              {Array.from({ length: thongTin.tong_so_khach }, (_, index) => (
                <CFormCheck
                  key={index}
                  inline
                  type="radio"
                  name="options"
                  value={index + 1}
                  label={index + 1 + ' người'}
                  onChange={handleChange}
                  checked={selectedValue === String(index + 1)}
                />
              ))}
            </>
          </CCol>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton color="success" className="text-white px-3" onClick={onClickUpdateAnSang}>
              <FontAwesomeIcon icon={faCheck} /> Đồng ý
            </CButton>
          )}
          {trangthaiload && (
            <CButton color="success" disabled>
              <CSpinner as="span" size="sm" aria-hidden="true" />
              Đồng ý...
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

CapNhatAnSang.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  thongTin: PropTypes.shape({
    ma_xepphong: PropTypes.string,
    ma_phong: PropTypes.string,
    tong_so_khach: PropTypes.number,
    chua_an_sang: PropTypes.number,
    da_an_sang: PropTypes.number,
  }),
  onSubmit: PropTypes.func,
}

export default CapNhatAnSang
