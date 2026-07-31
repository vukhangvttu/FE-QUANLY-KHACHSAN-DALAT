import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CDatePicker,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModalFooter,
  CRow,
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
import { HuyHoaDonPhatHanhVAT } from 'src/service/HoaDonVatService'

const HuyHoaDonPhatHanhVat = ({ visible, onClose, ma_hoadon_vat, onSubmit }) => {
  const navigate = useNavigate()

  const [trangthaiload, setTrangthaiload] = useState(false)

  const onClickHuyPhatHanhVat = async () => {
    if (valueNgayThoaThuan === '' || valueNgayThoaThuan === undefined) {
      return addToast(exampleToast('⚠️ Văn bản thoả thuận không được để trống'))
    } else if (valueVanBan === '' || valueVanBan === undefined) {
      return addToast(exampleToast('⚠️ Ngày thoả thuận không được để trống'))
    } else if (valueLyDo === '' || valueLyDo === undefined) {
      return addToast(exampleToast('⚠️ Lý do không được để trống'))
    } else if (ma_hoadon_vat === '' || ma_hoadon_vat === undefined) {
      return addToast(exampleToast('⚠️ Mã hóa đơn VAT không được để trống'))
    } else {
      try {
        setTrangthaiload(true)
        // 5. Gọi API nếu dữ liệu hợp lệ
        const response = await HuyHoaDonPhatHanhVAT(
          ma_hoadon_vat,
          valueVanBan,
          valueNgayThoaThuan,
          valueLyDo,
          navigate,
        )

        console.log('huy successfully:', response)
        setTrangthaiload(false)

        if (response.status === 200) {
          if (response.data.description === 'CANCEL TRANSACTION INVOICE SUCCESS') {
            addToast(exampleToast('✔️ ' + response.data.description))

            const data = {
              trangthai: true,
              ma_hoadon_vat: ma_hoadon_vat,
            }
            onSubmit(data)
          } else {
            addToast(exampleToast('❌ Xóa không thành công'))
          }
        }
        if (response.status === 401) {
          addToast(exampleToast('❌ Bạn không có quyền thực hiện chức năng này'))
        }
        if (response.status === 400) {
          addToast(exampleToast('❌' + response.data.message))
        }
      } catch (error) {
        console.error('Error:', error)
        setTrangthaiload(false)
        // 7. Xử lý lỗi khi gọi API
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
      }
    }
  }

  const [valueVanBan, setValueVanBan] = useState('')
  const [valueNgayThoaThuan, setValueNgayThoaThuan] = useState('')
  const [valueLyDo, setValueLyDo] = useState('')

  console.log(valueVanBan)

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

  return (
    <>
      <>
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </>

      <CModal
        size="lg"
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            <span className="text-red-500">Hủy Phát Hành Hóa Đơn VAT {ma_hoadon_vat}</span>{' '}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-4 col-form-label labelcustome">
              Văn bản thoả thuận <span className="text-danger"> *</span>{' '}
            </CFormLabel>
            <CCol sm={8}>
              <CFormInput onChange={(e) => setValueVanBan(e.target.value)} required />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-4 col-form-label labelcustome">
              Ngày thoả thuận<span className="text-danger"> *</span>{' '}
            </CFormLabel>
            <CCol sm={8}>
              <CDatePicker
                locale="en-GB"
                placeholder={'dd/MM/yyyy'}
                onDateChange={(date) => setValueNgayThoaThuan(date)}
              />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CFormLabel className="col-sm-4 col-form-label labelcustome">
              Lý do<span className="text-danger"> *</span>{' '}
            </CFormLabel>
            <CCol sm={8}>
              <CFormTextarea
                onChange={(e) => setValueLyDo(e.target.value)}
                rows={3}
              ></CFormTextarea>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton
              color="success"
              className="text-white px-3"
              onClick={() => onClickHuyPhatHanhVat()}
            >
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

HuyHoaDonPhatHanhVat.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  ma_hoadon_vat: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
export default HuyHoaDonPhatHanhVat
