import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CDatePicker,
  CFormLabel,
  CModalFooter,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTimePicker,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { format, parseISO, getDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from 'react-currency-input-field'

import { updateNgayDi } from 'src/service/XepPhongBooKingService'
import { getGiaPhongTheoMaLoaiPhong, getListGiaPhongTheoNgay } from 'src/service/APIService'

const CapNhatNgayDi = ({
  visible,
  onClose,
  maBooking,
  maXepPhong,
  ngayDen,
  ngayDi,
  gioDi,
  maPhong,
  maLoaiPhong,
  onSubmit,
}) => {
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

  const [giaPhong, setGiaPhong] = useState([])
  const [listGiaPhongTheoNgay, setListGiaPhongTheoNgay] = useState([])
  const [loading, setLoading] = useState(false)
  const [listGiaPhongMoi, setListGiaPhongMoi] = useState([])

  const fetchData = async () => {
    if (!maLoaiPhong) return

    try {
      setLoading(true)
      const [giaPhongCoDinh, listGiaPhongTheoNgay] = await Promise.all([
        getGiaPhongTheoMaLoaiPhong(maLoaiPhong, navigate),
        getListGiaPhongTheoNgay(maXepPhong, navigate),
      ])

      if (giaPhongCoDinh) {
        setGiaPhong(giaPhongCoDinh)
      }

      if (listGiaPhongTheoNgay) {
        setListGiaPhongTheoNgay(listGiaPhongTheoNgay)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      fetchData()
      // Reset các giá trị về mặc định khi mở modal
      if (ngayDi) {
        setValueNgayDi(parseISO(ngayDi))
      }
      if (gioDi) {
        setValueGioDi(gioDi.substring(0, 5))
      }
      setListGiaPhongMoi([])
    }
  }, [visible, ngayDi, gioDi])

  const [valueNgayDi, setValueNgayDi] = useState(ngayDi ? parseISO(ngayDi) : new Date())
  const [valueGioDi, setValueGioDi] = useState(gioDi ? gioDi.substring(0, 5) : '12:00')

  const handleDateChangeNgayDi = (date) => {
    setValueNgayDi(date)

    // Nếu ngày đi mới bằng ngày đến, tạo list giá với 1 ngày
    if (ngayDen && format(date, 'yyyy-MM-dd') === ngayDen) {
      const ngayDenDate = new Date(ngayDen)
      const thu = getDay(ngayDenDate)
      const isNgayLe = ngayLeVietNam.includes(format(ngayDenDate, 'MM-dd'))

      let giaPhongTuongUng = 0
      if (isNgayLe) {
        const giaNgayLe = giaPhong.find((gp) => gp.giaNgayLe)
        giaPhongTuongUng = giaNgayLe ? giaNgayLe.gia : 0
      } else if (thu === 6) {
        const giaCuoiTuan = giaPhong.find((gp) => gp.giaCuoiTuan)
        giaPhongTuongUng = giaCuoiTuan ? giaCuoiTuan.gia : 0
      } else {
        const giaNgayThuong = giaPhong.find((gp) => gp.giaNgayThuong)
        giaPhongTuongUng = giaNgayThuong ? giaNgayThuong.gia : 0
      }

      setListGiaPhongTheoNgay([
        {
          ngay: ngayDen,
          gia: giaPhongTuongUng,
        },
      ])
      setListGiaPhongMoi([])
      return
    }

    if (listGiaPhongTheoNgay.length > 0 && date) {
      const ngayCuoiCung = new Date(listGiaPhongTheoNgay[listGiaPhongTheoNgay.length - 1].ngay)
      const ngayMoi = new Date(date)

      // Lọc lại listGiaPhongTheoNgay nếu ngày mới nhỏ hơn ngày cuối cùng
      if (ngayMoi < ngayCuoiCung) {
        const listGiaPhongTheoNgayMoi = listGiaPhongTheoNgay.filter((item) => {
          const itemDate = new Date(item.ngay)
          return itemDate <= ngayMoi
        })
        setListGiaPhongTheoNgay(listGiaPhongTheoNgayMoi)
        setListGiaPhongMoi([])
      } else if (ngayMoi > ngayCuoiCung) {
        const ngayMoiList = []
        let currentDate = new Date(ngayCuoiCung)
        currentDate.setDate(currentDate.getDate() + 1)
        const ngayKetThuc = new Date(ngayMoi)
        ngayKetThuc.setDate(ngayKetThuc.getDate())
        while (currentDate <= ngayKetThuc) {
          // Xác định loại ngày và giá tương ứng
          const thu = getDay(currentDate)
          const isNgayLe = ngayLeVietNam.includes(format(currentDate, 'MM-dd'))

          let giaPhongTuongUng = 0
          if (isNgayLe) {
            const giaNgayLe = giaPhong.find((gp) => gp.giaNgayLe)
            giaPhongTuongUng = giaNgayLe ? giaNgayLe.gia : 0
          } else if (thu === 6) {
            const giaCuoiTuan = giaPhong.find((gp) => gp.giaCuoiTuan)
            giaPhongTuongUng = giaCuoiTuan ? giaCuoiTuan.gia : 0
          } else {
            const giaNgayThuong = giaPhong.find((gp) => gp.giaNgayThuong)
            giaPhongTuongUng = giaNgayThuong ? giaNgayThuong.gia : 0
          }

          ngayMoiList.push({
            ngay: format(currentDate, 'yyyy-MM-dd'),
            gia: giaPhongTuongUng,
          })
          currentDate.setDate(currentDate.getDate() + 1)
        }
        setListGiaPhongMoi(ngayMoiList)
      } else {
        setListGiaPhongMoi([])
      }
    } else {
      // Nếu không có dữ liệu cũ, tạo mới hoàn toàn
      const ngayMoiList = []
      const ngayMoi = new Date(date)
      const ngayKetThuc = new Date(date)
      ngayKetThuc.setDate(ngayKetThuc.getDate())

      // Xác định loại ngày và giá tương ứng
      const thu = getDay(ngayMoi)
      const isNgayLe = ngayLeVietNam.includes(format(ngayMoi, 'MM-dd'))

      let giaPhongTuongUng = 0
      if (isNgayLe) {
        const giaNgayLe = giaPhong.find((gp) => gp.giaNgayLe)
        giaPhongTuongUng = giaNgayLe ? giaNgayLe.gia : 0
      } else if (thu === 6) {
        const giaCuoiTuan = giaPhong.find((gp) => gp.giaCuoiTuan)
        giaPhongTuongUng = giaCuoiTuan ? giaCuoiTuan.gia : 0
      } else {
        const giaNgayThuong = giaPhong.find((gp) => gp.giaNgayThuong)
        giaPhongTuongUng = giaNgayThuong ? giaNgayThuong.gia : 0
      }

      ngayMoiList.push({
        ngay: format(ngayMoi, 'yyyy-MM-dd'),
        gia: giaPhongTuongUng,
      })
      setListGiaPhongMoi(ngayMoiList)
    }
  }

  const handleDateChangeGioDi = (time) => {
    console.log(time)

    setValueGioDi(time)
  }

  const handleChangeGiaPhongMoi = (ngay, gia) => {
    // Cập nhật giá trong listGiaPhongMoi
    setListGiaPhongMoi((prev) =>
      prev.map((item) => (item.ngay === ngay ? { ...item, gia: parseFloat(gia) || 0 } : item)),
    )

    // Cập nhật giá trong listGiaPhongTheoNgay nếu ngày đó tồn tại
    setListGiaPhongTheoNgay((prev) =>
      prev.map((item) => (item.ngay === ngay ? { ...item, gia: parseFloat(gia) || 0 } : item)),
    )
  }

  const onClickUpdateNgayDi = async () => {
    if (!maBooking || maBooking === null || maBooking === undefined) {
      return addToast(exampleToast('⚠️ Mã Booking hiện không hợp lệ'))
    }
    if (maLoaiPhong === null || maLoaiPhong === undefined) {
      return addToast(exampleToast('⚠️ Mã Phòng hiện không hợp lệ'))
    } else if (maXepPhong === null || maXepPhong === undefined) {
      return addToast(exampleToast('⚠️ Trạng thái hiện không hợp lệ'))
    } else if (ngayDi === null || ngayDi === undefined) {
      return addToast(exampleToast('⚠️ Ngày đi hiện không hợp lệ'))
    } else if (valueNgayDi === null || valueNgayDi === undefined) {
      return addToast(exampleToast('⚠️ Ngày đi mới hiện không hợp lệ'))
    } else if (valueGioDi === null || valueGioDi === undefined)
      return addToast(exampleToast('⚠️ Giờ đi mới hiện không hợp lệ'))

    const ngay_di_moi = format(valueNgayDi, 'yyyy-MM-dd')
    const gio_di_moi = valueGioDi.substring(0, 5)

    // Kiểm tra ngày đi mới không được nhỏ hơn ngày đến
    if (ngayDen && new Date(ngay_di_moi) < new Date(ngayDen)) {
      return addToast(exampleToast('⚠️ Ngày đi mới không được nhỏ hơn ngày đến'))
    }

    // Tạo mảng dữ liệu mới theo cấu trúc yêu cầu
    let danhSachGiaMoi = []

    if (ngay_di_moi === ngayDen) {
      // Nếu ngày đi mới bằng ngày đến, tính 1 đêm
      const ngayDenDate = new Date(ngayDen)
      const thu = getDay(ngayDenDate)
      const isNgayLe = ngayLeVietNam.includes(format(ngayDenDate, 'MM-dd'))

      let giaPhongTuongUng = 0
      if (isNgayLe) {
        const giaNgayLe = giaPhong.find((gp) => gp.giaNgayLe)
        giaPhongTuongUng = giaNgayLe ? giaNgayLe.gia : 0
      } else if (thu === 6) {
        const giaCuoiTuan = giaPhong.find((gp) => gp.giaCuoiTuan)
        giaPhongTuongUng = giaCuoiTuan ? giaCuoiTuan.gia : 0
      } else {
        const giaNgayThuong = giaPhong.find((gp) => gp.giaNgayThuong)
        giaPhongTuongUng = giaNgayThuong ? giaNgayThuong.gia : 0
      }

      danhSachGiaMoi = [
        {
          ngay: ngayDen,
          gia: giaPhongTuongUng,
        },
      ]
    } else if (ngay_di_moi === ngayDi) {
      // Nếu ngày đi mới trùng với ngày đi cũ, sử dụng listGiaPhongTheoNgay
      danhSachGiaMoi = listGiaPhongTheoNgay.map((item) => ({
        ngay: item.ngay,
        gia: item.gia,
      }))
    } else if (new Date(ngay_di_moi) < new Date(ngayDi)) {
      // Nếu ngày đi mới nhỏ hơn ngày đi cũ, lọc listGiaPhongTheoNgay
      danhSachGiaMoi = listGiaPhongTheoNgay
        .filter((item) => new Date(item.ngay) <= new Date(ngay_di_moi))
        .map((item) => ({
          ngay: item.ngay,
          gia: item.gia,
        }))
    } else {
      // Nếu ngày đi mới lớn hơn ngày đi cũ, kết hợp cả listGiaPhongTheoNgay và listGiaPhongMoi
      const allGiaPhong = [...listGiaPhongTheoNgay, ...listGiaPhongMoi]
      // Sắp xếp theo ngày
      allGiaPhong.sort((a, b) => new Date(a.ngay) - new Date(b.ngay))
      // Lọc các ngày trùng lặp (nếu có)
      const uniqueGiaPhong = allGiaPhong.reduce((acc, current) => {
        const x = acc.find((item) => item.ngay === current.ngay)
        if (!x) {
          return acc.concat([current])
        } else {
          return acc
        }
      }, [])

      danhSachGiaMoi = uniqueGiaPhong.map((item) => ({
        ngay: item.ngay,
        gia: item.gia,
      }))
    }

    console.log('danhSachGiaMoi', danhSachGiaMoi)

    if (danhSachGiaMoi.length === 0) return addToast(exampleToast('List giá mới đang rỗng'))

    try {
      setTrangthaiload(true)
      const response = await updateNgayDi(
        maBooking,
        maXepPhong,
        ngay_di_moi,
        gio_di_moi,
        ngayDi,
        maLoaiPhong,
        danhSachGiaMoi, // Thêm tham số mới này vào hàm updateNgayDi
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
          const updatedData = {
            ngayDi: ngay_di_moi,
            gioDi: gio_di_moi,
          }
          onSubmit(updatedData)
        } else {
          addToast(exampleToast('❌ Update không thành công'))
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

  // Danh sách ngày lễ Việt Nam (định dạng MM-DD)
  const ngayLeVietNam = [
    '01-01', // Tết Dương lịch
    '04-30', // Ngày Giải phóng miền Nam
    '05-01', // Ngày Quốc tế Lao động
    '09-02', // Quốc khánh
    '01-01', // Tết Nguyên đán (âm lịch)
    '01-02', // Tết Nguyên đán (âm lịch)
    '01-03', // Tết Nguyên đán (âm lịch)
    '01-04', // Tết Nguyên đán (âm lịch)
    '01-05', // Tết Nguyên đán (âm lịch)
    '01-06', // Tết Nguyên đán (âm lịch)
    '01-07', // Tết Nguyên đán (âm lịch)
    '04-15', // Giỗ Tổ Hùng Vương
    '05-05', // Lễ Phật đản
    '05-15', // Lễ Vu lan
    '08-15', // Tết Trung thu
    '10-10', // Ngày Giải phóng Thủ đô
    '12-25', // Giáng sinh
  ]

  // Hàm kiểm tra ngày lễ
  const isNgayLe = (date) => {
    const dateStr = format(date, 'MM-dd')
    return ngayLeVietNam.includes(dateStr)
  }

  // Hàm lấy thứ của ngày
  const getThu = (date) => {
    const thu = getDay(date)
    const thuMap = {
      0: 'CN',
      1: 'T2',
      2: 'T3',
      3: 'T4',
      4: 'T5',
      5: 'T6',
      6: 'T7',
    }
    return thuMap[thu]
  }

  // Hàm kiểm tra và trả về class màu
  const getDateColorClass = (date) => {
    if (isNgayLe(date)) {
      return '!text-red-500 !font-bold'
    }
    const thu = getDay(date)
    if (thu === 6) {
      // Thứ 7
      return '!text-red-500'
    }
    return ''
  }

  return (
    <>
      <div className="fixed top-0 right-0 z-50">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>

      <CModal
        size="lg"
        alignment="center"
        visible={visible}
        onClose={onClose}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500">
            Cập nhật ngày đi
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CCol sm={12} className="mb-2">
            Phòng P.{maPhong} thuộc loại phòng {maLoaiPhong}{' '}
            <span className="font-bold">
              Ngày đến {ngayDen ? format(parseISO(ngayDen), 'dd/MM/yyyy') : 'N/A'}{' '}
            </span>
            {', '}
            <span className="font-bold">
              Ngày đi {ngayDi ? format(parseISO(ngayDi), 'dd/MM/yyyy') : 'N/A'}{' '}
              {/* {gioDi?.substring(0, 5)} */}
            </span>{' '}
          </CCol>
          <CRow className="mb-3">
            <CCol sm={6}>
              <CFormLabel htmlFor="inputPassword" className="col-sm-6 col-form-label labelcustome">
                Ngày đi mới
              </CFormLabel>
              <CCol sm={6}>
                <CDatePicker
                  locale="en-GB"
                  date={valueNgayDi}
                  onDateChange={handleDateChangeNgayDi}
                  minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                />
              </CCol>
            </CCol>
            <CCol>
              <CFormLabel htmlFor="inputPassword" className="col-sm-6 col-form-label labelcustome">
                Giờ đi mới
              </CFormLabel>
              <CCol sm={6}>
                <CTimePicker
                  locale="en-GB"
                  seconds={false}
                  minutes={[0, 30]}
                  time={valueGioDi}
                  onTimeChange={(time) => {
                    // Thêm trực tiếp ở đây
                    handleDateChangeGioDi(time)
                  }}
                />
              </CCol>
            </CCol>
          </CRow>
          <hr />
          <CRow>
            <CCol sm={6}>
              <CCol sm={12}>
                <CTable>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Loại giá
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Giá
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {giaPhong.map((item, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          {item.giaNgayThuong
                            ? 'Ngày thường'
                            : item.giaCuoiTuan
                              ? 'Cuối tuần'
                              : item.giaNgayLe
                                ? 'Ngày lễ '
                                : 'Extra bed'}
                        </CTableDataCell>
                        <CTableDataCell>{item.gia.toLocaleString('us-US')}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCol>
            </CCol>
            <CCol sm={6}>
              <CCol sm={12}>
                <CTable>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Ngày
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col" className="!text-blue-600">
                        Giá
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading ? (
                      <CTableRow>
                        <CTableDataCell colSpan={2} className="text-center py-4">
                          <CSpinner size="sm" className="me-2" />
                          Đang tải dữ liệu...
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      <>
                        {listGiaPhongTheoNgay &&
                          listGiaPhongTheoNgay.length > 0 &&
                          listGiaPhongTheoNgay.map((item, index) => {
                            const date = parseISO(item.ngay)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const itemDate = new Date(item.ngay)
                            itemDate.setHours(0, 0, 0, 0)

                            return (
                              <CTableRow key={item.maGiaPhongTheoNgay || index}>
                                <CTableDataCell>
                                  <span className={getDateColorClass(date)}>
                                    {getThu(date)} - {format(date, 'dd/MM/yyyy')}
                                  </span>
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CurrencyInput
                                    className="outline-none w-24 border-b border-gray-500 rounded-none text-right"
                                    name="input-name"
                                    placeholder="Nhập giá"
                                    decimalsLimit={2}
                                    value={item.gia}
                                    onValueChange={(value) =>
                                      handleChangeGiaPhongMoi(item.ngay, value)
                                    }
                                  />
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })}
                        {listGiaPhongMoi.map((item, idx) => {
                          const date = parseISO(item.ngay)
                          return (
                            <CTableRow key={item.ngay}>
                              <CTableDataCell>
                                <span className={getDateColorClass(date)}>
                                  {getThu(date)} - {format(date, 'dd/MM/yyyy')}
                                </span>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CurrencyInput
                                  className="outline-none w-24 border-b border-gray-500 rounded-none text-right"
                                  name="input-name"
                                  placeholder="Nhập giá"
                                  decimalsLimit={2}
                                  value={item.gia}
                                  onValueChange={(value) =>
                                    handleChangeGiaPhongMoi(item.ngay, value)
                                  }
                                />
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                        <CTableRow className="font-bold bg-gray-100">
                          <CTableDataCell>Tạm tính</CTableDataCell>
                          <CTableDataCell className="text-center !text-green-500">
                            {[...listGiaPhongTheoNgay, ...listGiaPhongMoi]
                              .reduce((total, item) => total + (item.gia || 0), 0)
                              .toLocaleString('us-US')}
                          </CTableDataCell>
                        </CTableRow>
                      </>
                    )}
                  </CTableBody>
                </CTable>
              </CCol>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Không
          </CButton>
          {!trangthaiload && (
            <CButton color="success" className="text-white px-3" onClick={onClickUpdateNgayDi}>
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

CapNhatNgayDi.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maBooking: PropTypes.string,
  maXepPhong: PropTypes.string,
  ngayDen: PropTypes.string,
  ngayDi: PropTypes.string,
  gioDi: PropTypes.string,
  maPhong: PropTypes.string.isRequired,
  maLoaiPhong: PropTypes.string.isRequired,
  onSubmit: PropTypes.func,
}
export default CapNhatNgayDi
