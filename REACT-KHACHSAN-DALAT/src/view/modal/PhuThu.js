import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormLabel,
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

import CurrencyInput from 'react-currency-input-field'
import { getPhuThuXepPhong, updatePhuThuXepPhong } from 'src/service/XepPhongBooKingService'
import { getGiaPhongExtraBed } from 'src/service/GiaPhongService'
import { differenceInCalendarDays, parse } from 'date-fns'

const PhuThu = ({ visible, onClose, maPhong, ma_xepphong, soGiuongMax, ngayDen, ngayDi, maLoaiPhong, onSubmit }) => {
  const navigate = useNavigate()
  const [trangthaiload, setTrangthaiload] = useState(false)
  const [toast, addToast] = useState()
  const toaster = useRef(null)

  const getSoDem = () => {
    if (!ngayDen || !ngayDi) return 1
    let d1, d2
    try {
      if (typeof ngayDen === 'string' && ngayDen.includes('/')) d1 = parse(ngayDen, 'dd/MM/yyyy', new Date())
      else d1 = new Date(ngayDen)

      if (typeof ngayDi === 'string' && ngayDi.includes('/')) d2 = parse(ngayDi, 'dd/MM/yyyy', new Date())
      else d2 = new Date(ngayDi)

      const diff = differenceInCalendarDays(d2, d1)
      return (diff > 0 && !isNaN(diff)) ? diff : 1
    } catch (e) {
      return 1
    }
  }
  const soDem = getSoDem()

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

  const [loading, setLoading] = useState(false)

  const [tongPhuThu, setTongPhuThu] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await getPhuThuXepPhong(ma_xepphong, navigate)
      console.log(response)
      if (response) {
        console.log('response', response)
        if (response.phu_thu_tien_giuong === 0) {
          const response1 = await getGiaPhongExtraBed(maLoaiPhong, navigate)
          if (response1) {
            setGiaGiuong(response1.gia)
          }
        } else {
          setGiaGiuong(response.phu_thu_tien_giuong)
        }
        setSoLuong(response.so_giuong)
        setGiaNguoiLon(response.phu_thu_nguoi_lon)
        setSoLuongNguoiLon(response.so_nguoi_lon)
        setGiaTreEm(response.phu_thu_tien_tre)
        setSoLuongTreEm(response.so_tre)
        setPhuThuCheckInSom(response.phu_thu_check_in_som || 0)
        setPhuThuCheckOutTre(response.phu_thu_check_out_tre || 0)
        setPhuThuNangHangPhong(response.phu_thu_nang_hang_phong || 0)
        setSoLuongPhuThuNangHangPhong(response.so_luong_nang_hang_phong || 0)

        setTongPhuThu(
          (response.phu_thu_tien_giuong || 0) * (response.so_giuong || 0) * soDem +
          (response.phu_thu_nguoi_lon || 0) * (response.so_nguoi_lon || 0) * soDem +
          (response.phu_thu_tien_tre || 0) * (response.so_tre || 0) * soDem +
          (response.phu_thu_check_in_som || 0) +
          (response.phu_thu_check_out_tre || 0) +
          (response.phu_thu_nang_hang_phong || 0) * (response.so_luong_nang_hang_phong || 0)
        )
      } else {
        addToast(exampleToast('Không thể tải phụ thu. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đặt phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchData()
    }
  }, [visible])

  const [giaGiuong, setGiaGiuong] = useState(0)
  const [soLuong, setSoLuong] = useState(0)
  const [giaTreEm, setGiaTreEm] = useState(0)
  const [soLuongTreEm, setSoLuongTreEm] = useState(0)
  const [giaNguoiLon, setGiaNguoiLon] = useState(0)
  const [soLuongNguoiLon, setSoLuongNguoiLon] = useState(0)
  const [phuThuCheckInSom, setPhuThuCheckInSom] = useState(0)
  const [phuThuCheckOutTre, setPhuThuCheckOutTre] = useState(0)
  const [phuThuNangHangPhong, setPhuThuNangHangPhong] = useState(0)
  const [soLuongPhuThuNangHangPhong, setSoLuongPhuThuNangHangPhong] = useState(0)
  const calculateTotal = (gGiuong, sGiuong, gNguoiLon, sNguoiLon, gTreEm, sTreEm, pCheckInSom, pCheckOutTre, pNangHang, sNangHang) => {
    setTongPhuThu(
      (gGiuong * sGiuong * soDem) +
      (gNguoiLon * sNguoiLon * soDem) +
      (gTreEm * sTreEm * soDem) +
      Number(pCheckInSom) +
      Number(pCheckOutTre) +
      (pNangHang * sNangHang)
    )
  }

  const handleChangeGiaGiuong = (value) => {
    setGiaGiuong(value)
    calculateTotal(value, soLuong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const tinhTongTien = (giaGiuong, soluong, giaTreEm, soTre) => {
    calculateTotal(giaGiuong, soluong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soTre, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangeSoLuong = (value) => {
    const soluong = value.target.value
    if (parseInt(soluong) > soGiuongMax)
      return addToast(exampleToast('Không được vượt quá số giường cho phép'))
    setSoLuong(soluong)
    calculateTotal(giaGiuong, soluong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangeGiaNguoiLon = (value) => {
    let gia = value
    if (value === null || value === undefined) gia = 0
    setGiaNguoiLon(gia)
    calculateTotal(giaGiuong, soLuong, gia, soLuongNguoiLon, giaTreEm, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangeSoLuongNguoiLon = (value) => {
    const soluong = value.target.value
    setSoLuongNguoiLon(soluong)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soluong, giaTreEm, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangeGiaTreEm = (value) => {
    let gia = value
    if (value === null || value === undefined) gia = 0
    setGiaTreEm(gia)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soLuongNguoiLon, gia, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangeSoLuongTreEm = (value) => {
    const soluong = value.target.value
    setSoLuongTreEm(soluong)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soluong, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangePhuThuCheckInSom = (value) => {
    let gia = value
    if (value === null || value === undefined) gia = 0
    setPhuThuCheckInSom(gia)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soLuongTreEm, gia, phuThuCheckOutTre, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangePhuThuCheckOutTre = (value) => {
    let gia = value
    if (value === null || value === undefined) gia = 0
    setPhuThuCheckOutTre(gia)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soLuongTreEm, phuThuCheckInSom, gia, phuThuNangHangPhong, soLuongPhuThuNangHangPhong)
  }

  const handleChangePhuThuNangHangPhong = (value) => {
    let gia = value
    if (value === null || value === undefined) gia = 0
    setPhuThuNangHangPhong(gia)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, gia, soLuongPhuThuNangHangPhong)
  }

  const handleChangeSoLuongNangHangPhong = (value) => {
    const soluong = value.target.value
    setSoLuongPhuThuNangHangPhong(soluong)
    calculateTotal(giaGiuong, soLuong, giaNguoiLon, soLuongNguoiLon, giaTreEm, soLuongTreEm, phuThuCheckInSom, phuThuCheckOutTre, phuThuNangHangPhong, soluong)
  }

  const onClickUpdatePhuThuPhong = async () => {
    if (giaGiuong === null || giaGiuong === undefined) {
      return addToast(exampleToast('⚠️ Gía giường phụ thu không hợp lệ'))
    } else if (soLuong === null || soLuong === undefined) {
      return addToast(exampleToast('⚠️ Số lượng không hợp lệ'))
    } else if (giaTreEm === null || giaTreEm === undefined) {
      return addToast(exampleToast('⚠️ Gía trẻ em phụ thu không hợp lệ'))
    } else if (soLuongTreEm === null || soLuongTreEm === undefined) {
      return addToast(exampleToast('⚠️ Số lượng trẻ em không hợp lệ'))
    } else if (giaNguoiLon === null || giaNguoiLon === undefined) {
      return addToast(exampleToast('⚠️ Gía người lớn phụ thu không hợp lệ'))
    } else if (soLuongNguoiLon === null || soLuongNguoiLon === undefined) {
      return addToast(exampleToast('⚠️ Số lượng người lớn không hợp lệ'))
    }

    if (giaNguoiLon !== 0 && soLuongNguoiLon === 0) {
      return addToast(exampleToast('⚠️ Số lượng người lớn không hợp lệ'))
    }
    if (giaTreEm !== 0 && soLuongTreEm === 0) {
      return addToast(exampleToast('⚠️ Số lượng trẻ em không hợp lệ'))
    }
    if (ma_xepphong === null || ma_xepphong === undefined) {
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))
    }

    if (giaGiuong) {
      if (soLuong === null || soLuong === undefined) {
        return addToast(exampleToast('⚠️ Chưa chọn số lượng'))
      }
    }
    if (giaTreEm) {
      if (soLuongTreEm === null || soLuongTreEm === undefined)
        return addToast(exampleToast('⚠️ Chưa chọn số lượng trẻ em'))
    }

    try {
      setTrangthaiload(true)
      const response = await updatePhuThuXepPhong(
        giaGiuong,
        soLuong,
        giaNguoiLon,
        soLuongNguoiLon,
        giaTreEm,
        soLuongTreEm,
        phuThuCheckInSom,
        phuThuCheckOutTre,
        phuThuNangHangPhong,
        soLuongPhuThuNangHangPhong,
        ma_xepphong,
        navigate,
      )

      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ ' + response.message + ' Phòng ' + maPhong))
          onClose()
          const data = {
            trangthai: true,
            soluong: parseInt(soLuong),
          }
          onSubmit(data)
        } else {
          addToast(exampleToast('Update không thành công'))
        }
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
            Thêm phụ thu P.{maPhong}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loading ? (
            <div className="d-flex justify-content-center">
              <CSpinner />
            </div>
          ) : (
            <CRow>
              <CCol sm={12}>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Giá giường (Extra Bed)
                  </CFormLabel>
                  <CCol sm={6}>
                    <CurrencyInput
                      className="outline-none border-b-2 border-gray-500 rounded-none"
                      name="input-name"
                      placeholder="500,000"
                      decimalsLimit={2}
                      value={giaGiuong === null ? 0 : giaGiuong}
                      onValueChange={handleChangeGiaGiuong}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số lượng
                  </CFormLabel>
                  <CCol sm={6}>
                    <input
                      type="number"
                      className="outline-none border-b-2 border-gray-500 rounded-none "
                      min={0}
                      value={soLuong}
                      onChange={handleChangeSoLuong}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số đêm
                  </CFormLabel>
                  <CCol sm={6}>
                    <p className='mt-1'>{soDem}</p>
                  </CCol>
                </CRow>
              </CCol>
              <hr className="mb-3 " />
              <CCol sm={12}>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Phụ thu người lớn
                  </CFormLabel>
                  <CCol sm={6}>
                    <CurrencyInput
                      className="outline-none border-b-2 border-gray-500 rounded-none"
                      name="input-name"
                      placeholder="Nhập giá"
                      decimalsLimit={2}
                      value={giaNguoiLon === null ? 0 : giaNguoiLon}
                      onValueChange={handleChangeGiaNguoiLon}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số lượng
                  </CFormLabel>
                  <CCol sm={6}>
                    <input
                      type="number"
                      className="outline-none border-b-2 border-gray-500 rounded-none "
                      min={0}
                      value={soLuongNguoiLon}
                      onChange={handleChangeSoLuongNguoiLon}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số đêm
                  </CFormLabel>
                  <CCol sm={6}>
                    <p className='mt-1'>{soDem}</p>
                  </CCol>
                </CRow>
              </CCol>
              <hr className="mb-3 " />
              <CCol sm={12}>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Phụ thu trẻ em
                  </CFormLabel>
                  <CCol sm={6}>
                    <CurrencyInput
                      className="outline-none border-b-2 border-gray-500 rounded-none"
                      name="input-name"
                      placeholder="Nhập giá"
                      decimalsLimit={2}
                      value={giaTreEm === null ? 0 : giaTreEm}
                      onValueChange={handleChangeGiaTreEm}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số lượng
                  </CFormLabel>
                  <CCol sm={6}>
                    <input
                      type="number"
                      className="outline-none border-b-2 border-gray-500 rounded-none "
                      min={0}
                      value={soLuongTreEm}
                      onChange={handleChangeSoLuongTreEm}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số đêm
                  </CFormLabel>
                  <CCol sm={6}>
                    <p className='mt-1'>{soDem}</p>
                  </CCol>
                </CRow>
              </CCol>
              <hr className="mb-3 " />
              <CCol sm={12}>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Phụ thu Check in sớm
                  </CFormLabel>
                  <CCol sm={6}>
                    <CurrencyInput
                      className="outline-none border-b-2 border-gray-500 rounded-none"
                      name="input-name"
                      placeholder="Nhập giá"
                      decimalsLimit={2}
                      value={phuThuCheckInSom === null ? 0 : phuThuCheckInSom}
                      onValueChange={handleChangePhuThuCheckInSom}
                    />
                  </CCol>
                </CRow>

              </CCol>
              <hr className="mb-3 " />
              <CCol sm={12}>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Phụ thu Check out trễ
                  </CFormLabel>
                  <CCol sm={6}>
                    <CurrencyInput
                      className="outline-none border-b-2 border-gray-500 rounded-none"
                      name="input-name"
                      placeholder="Nhập giá"
                      decimalsLimit={2}
                      value={phuThuCheckOutTre === null ? 0 : phuThuCheckOutTre}
                      onValueChange={handleChangePhuThuCheckOutTre}
                    />
                  </CCol>
                </CRow>

              </CCol>
              <hr className="mb-3 " />
              <CCol sm={12}>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Phụ thu Nâng hạng phòng
                  </CFormLabel>
                  <CCol sm={6}>
                    <CurrencyInput
                      className="outline-none border-b-2 border-gray-500 rounded-none"
                      name="input-name"
                      placeholder="Nhập giá"
                      decimalsLimit={2}
                      value={phuThuNangHangPhong === null ? 0 : phuThuNangHangPhong}
                      onValueChange={handleChangePhuThuNangHangPhong}
                    />
                  </CCol>
                </CRow>
                <CRow>
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-sm-6 col-form-label labelcustome"
                  >
                    Số lượng
                  </CFormLabel>
                  <CCol sm={6}>
                    <input
                      type="number"
                      className="outline-none border-b-2 border-gray-500 rounded-none "
                      min={0}
                      value={soLuongPhuThuNangHangPhong}
                      onChange={handleChangeSoLuongNangHangPhong}
                    />
                  </CCol>
                </CRow>

              </CCol>
              <hr className="mb-3 " />

              <CRow>
                <CFormLabel
                  htmlFor="inputPassword"
                  className="col-sm-6 col-form-label text-red-500 font-bold"
                >
                  Tổng phụ thu
                </CFormLabel>
                <CCol sm={6} className="text-center">
                  <span className="text-red-500 font-bold">
                    {tongPhuThu.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </CCol>
              </CRow>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton color="success" className="text-white px-3" onClick={onClickUpdatePhuThuPhong}>
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

PhuThu.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
  maPhong: PropTypes.string.isRequired,
  ma_xepphong: PropTypes.string.isRequired,
  soGiuongMax: PropTypes.number.isRequired,
  ngayDen: PropTypes.string.isRequired,
  ngayDi: PropTypes.string.isRequired,
  maLoaiPhong: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
export default PhuThu
