import {
  CButton,
  CCol,
  CContainer,
  CDatePicker,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import { format, parse } from 'date-fns'
import { vi } from 'date-fns/locale'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'

const AddKhachHang = ({ visible, onClose }) => {
  const [ischeck, setIscheck] = useState(0)

  const handleChangeGioTinh = (e) => {
    const value = e.target.value
    setIscheck(value)
    setKhachHang((pre) => ({
      ...pre,
      NgaySinh: value,
    }))
  }

  const [ischeckLoaiKH, setIscheckLoaiKH] = useState(1)
  const [visibleAn, setVisibleAn] = useState(true)

  const handleChangeLoaiKH = (e) => {
    setIscheckLoaiKH(parseInt(e.target.value))
    if (parseInt(e.target.value) === 2) {
      setVisibleAn(false)
    } else {
      setVisibleAn(true)
    }
  }

  // save khách hàng

  const [khachHang, setKhachHang] = useState({
    HoTen: '',
    NgaySinh: '',
    GioiTinh: 0,
    Email: '',
    SDT: '',
    maloaikhang: 1,
    maquoctich: '',
    manhom_KH: '',
    MaSoThue: '',
    TenCongTy: '',
    DiaChi: '',
    GhiChu: '',
  })

  const {
    HoTen,
    Email,
    SDT,
    maloaikhang,
    maquoctich,
    manhom_KH,
    MaSoThue,
    TenCongTy,
    DiaChi,
    GhiChu,
  } = khachHang
  const onInputChange = (e) => {
    console.log(e.target.name)
    console.log(e.target.value)
    setKhachHang({ ...khachHang, [e.target.name]: e.target.value })
  }

  const [selectedDate, setSelectedDate] = useState(null)

  const handleDateChange = (date) => {
    setSelectedDate(date)
    const formattedDate = format(new Date(date), 'dd/MM/yyyy')
    console.log('Ngày đã chọn:', formattedDate)
    setKhachHang((pre) => ({
      ...pre,
      NgaySinh: formattedDate,
    }))
  }

  const handleSubmit = (event) => {
    const form = event.currentTarget

    event.preventDefault()

    console.log(khachHang)
  }

  return (
    <div>
      <CModal
        size="lg"
        alignment="center"
        visible={visible}
        onClose={onClose}
        scrollable
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel" className="text- font-bold">
            Thêm mới khách hàng
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CContainer>
            <CForm className=" needs-validation" onSubmit={handleSubmit}>
              <CRow>
                <CCol md={6}>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Tên KH <span className="text-danger"> *</span>
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="HoTen"
                        value={HoTen}
                        onChange={(e) => onInputChange(e)}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Ngày sinh
                    </CFormLabel>
                    <CCol sm={8}>
                      <CDatePicker
                        locale="en-GB"
                        container="body"
                        inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                        inputDateFormat={(date) =>
                          format(new Date(date), 'dd/MM/yyyy', { locale: vi })
                        }
                        placeholder={'__/__/____'}
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300 rounded-lg"
                        onDateChange={handleDateChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel htmlFor="inputPassword" className="col-sm-4  labelcustome">
                      Giới tính
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormCheck
                        inline
                        style={{ cursor: 'pointer' }}
                        type="radio"
                        name="inlineRadioOptions"
                        id="inlineCheckbox1"
                        label="Nam"
                        value={1}
                        checked={ischeck === 1}
                        onChange={handleChangeGioTinh}
                      />
                      <CFormCheck
                        inline
                        type="radio"
                        style={{ cursor: 'pointer' }}
                        name="inlineRadioOptions"
                        id="inlineCheckbox2"
                        label="Nữ"
                        value={2}
                        checked={ischeck === 2}
                        onChange={handleChangeGioTinh}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel className="col-sm-4 col-form-label labelcustome">Email</CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="email"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="Email"
                        value={Email}
                        onChange={(e) => onInputChange(e)}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CFormLabel className="col-sm-4 col-form-label labelcustome">
                      Điện thoại
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        placeholder="0912345678"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="SDT"
                        value={SDT}
                        onChange={(e) => onInputChange(e)}
                      />
                    </CCol>
                  </CRow>
                  {visibleAn && (
                    <CRow className="mb-3">
                      <CFormLabel className="col-sm-4 col-form-label labelcustome">
                        Quốc tịch
                      </CFormLabel>
                      <CCol sm={8}>
                        <CFormSelect
                          aria-label="Default select example"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          options={[
                            { label: 'Quốc gia' },
                            { label: 'One', value: '1' },
                            { label: 'Two', value: '2' },
                            { label: 'Three', value: '3', disabled: true },
                          ]}
                          name="maquoctich"
                          value={maquoctich}
                          onChange={(e) => onInputChange(e)}
                        />
                      </CCol>
                    </CRow>
                  )}
                </CCol>
                <CCol md={6}>
                  <CRow className="mb-3">
                    <CFormLabel htmlFor="inputPassword" className="col-sm-5 labelcustome">
                      Loại khách hàng
                    </CFormLabel>
                    <CCol sm={7}>
                      <CFormCheck
                        inline
                        type="radio"
                        style={{ cursor: 'pointer' }}
                        label="Cá nhân"
                        value={1}
                        checked={ischeckLoaiKH === 1}
                        onChange={handleChangeLoaiKH}
                      />
                      <CFormCheck
                        inline
                        type="radio"
                        style={{ cursor: 'pointer' }}
                        label="Công ty"
                        value={2}
                        checked={ischeckLoaiKH === 2}
                        onChange={handleChangeLoaiKH}
                      />
                    </CCol>
                  </CRow>
                  {visibleAn && (
                    <CRow className="mb-3">
                      <CFormLabel
                        htmlFor="inputPassword"
                        className="col-sm-4 col-form-label labelcustome"
                      >
                        Công ty
                      </CFormLabel>
                      <CCol sm={8}>
                        <CFormInput
                          type="text"
                          className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                          name="TenCongTy"
                          value={TenCongTy}
                          onChange={(e) => onInputChange(e)}
                        />
                      </CCol>
                    </CRow>
                  )}
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Mã số thuế
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="MaSoThue"
                        value={MaSoThue}
                        onChange={(e) => onInputChange(e)}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Địa chỉ
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormInput
                        type="text"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        name="DiaChi"
                        value={DiaChi}
                        onChange={(e) => onInputChange(e)}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel className="col-sm-4 col-form-label labelcustome">
                      Nhóm KH <span className="text-danger"> *</span>
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormSelect
                        aria-label="Default select example"
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300"
                        options={[
                          { label: 'Khách lẻ tháng 2-25', value: '1' },
                          { label: 'Two', value: '2' },
                          { label: 'Three', value: '3', disabled: true },
                        ]}
                        name="manhom_KH"
                        value={manhom_KH}
                        onChange={(e) => onInputChange(e)}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CFormLabel
                      htmlFor="inputPassword"
                      className="col-sm-4 col-form-label labelcustome"
                    >
                      Ghi chú
                    </CFormLabel>
                    <CCol sm={8}>
                      <CFormTextarea
                        className="peer border border-gray-300  hover:!border-green-500 transition-colors duration-300 mb-3"
                        placeholder="Nhập ghi chú ..."
                        aria-label="Disabled textarea example"
                        name="GhiChu"
                        value={GhiChu}
                        onChange={(e) => onInputChange(e)}
                      ></CFormTextarea>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
              <div className="flex justify-end items-center p-2">
                <CButton color="secondary" className="px-6 py-2 mr-2" onClick={onClose}>
                  Bỏ qua
                </CButton>
                <CButton type="submit" color="success" className="text-white px-6 py-2">
                  Lưu
                </CButton>
              </div>
            </CForm>
          </CContainer>
        </CModalBody>
      </CModal>
    </div>
  )
}
AddKhachHang.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
}
export default AddKhachHang
