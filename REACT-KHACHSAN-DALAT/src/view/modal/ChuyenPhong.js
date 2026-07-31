import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormLabel,
  CFormSelect,
  CModalFooter,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { format, parseISO, getDay } from 'date-fns'
import CurrencyInput from 'react-currency-input-field'
import { getGiaPhongTheoMaLoaiPhong, getListGiaPhongTheoNgay } from 'src/service/APIService'

import { getListPhongTrongTheoKhoanThoiGian } from 'src/service/PhongService'
import { saveChuyenPhong } from 'src/service/ChuyenPhongService'
import { getAllLoaiPhongTrongTrongKhoanThoiGian } from 'src/service/LoaiPhongService'

const ChuyenPhong = ({
  visible,
  onClose,
  maXepPhong,
  ngayDen,
  ngayDi,
  ngayHienTai,
  maPhong,
  maLoaiPhong,
  tenPhong,
  onSubmit,
}) => {
  const navigate = useNavigate()
  const [trangthaiload, setTrangthaiload] = useState(false)
  const [toast, addToast] = useState()
  const toaster = useRef(null)
  const [giaPhong, setGiaPhong] = useState([])
  const [listGiaPhongTheoNgay, setListGiaPhongTheoNgay] = useState([])
  const [loading, setLoading] = useState(false)
  const [listGiaPhongTheoNgayGoc, setListGiaPhongTheoNgayGoc] = useState([])

  const [selectedMaLoaiPhong, setSelectedMaLoaiPhong] = useState(maLoaiPhong || '')

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

  const handleChuyenPhong = async () => {
    // Kiểm tra các thông tin cơ bản
    if (!maXepPhong || maXepPhong === null || maXepPhong === undefined || maXepPhong === '') {
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))
    }

    if (!maPhong || maPhong === null || maPhong === undefined || maPhong === '') {
      return addToast(exampleToast('⚠️ Mã phòng hiện tại không hợp lệ'))
    }

    if (!maLoaiPhong || maLoaiPhong === null || maLoaiPhong === undefined || maLoaiPhong === '') {
      return addToast(exampleToast('⚠️ Mã loại phòng không hợp lệ'))
    }

    if (
      !selectedMaPhong ||
      selectedMaPhong === null ||
      selectedMaPhong === undefined ||
      selectedMaPhong === '0'
    ) {
      return addToast(exampleToast('⚠️ Vui lòng chọn phòng mới'))
    }

    if (
      !selectedMaLoaiPhong ||
      selectedMaLoaiPhong === null ||
      selectedMaLoaiPhong === undefined ||
      selectedMaLoaiPhong === ''
    ) {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng mới'))
    }

    // Kiểm tra ngày
    if (!ngayDen || ngayDen === null || ngayDen === undefined || ngayDen === '') {
      return addToast(exampleToast('⚠️ Ngày đến không hợp lệ'))
    }

    if (!ngayDi || ngayDi === null || ngayDi === undefined || ngayDi === '') {
      return addToast(exampleToast('⚠️ Ngày đi không hợp lệ'))
    }

    if (!ngayHienTai || ngayHienTai === null || ngayHienTai === undefined || ngayHienTai === '') {
      return addToast(exampleToast('⚠️ Ngày hiện tại không hợp lệ'))
    }

    // Kiểm tra logic ngày
    const ngayDenDate = new Date(ngayDen)
    const ngayDiDate = new Date(ngayDi)
    const ngayHienTaiDate = new Date(ngayHienTai)

    if (ngayDenDate >= ngayDiDate) {
      return addToast(exampleToast('⚠️ Ngày đến phải nhỏ hơn ngày đi'))
    }

    if (ngayHienTaiDate > ngayDiDate) {
      return addToast(exampleToast('⚠️ Ngày hiện tại không được lớn hơn ngày đi'))
    }

    // Kiểm tra phòng mới không được trùng với phòng cũ
    if (selectedMaPhong === maPhong) {
      return addToast(exampleToast('⚠️ Phòng mới không được trùng với phòng hiện tại'))
    }

    // Kiểm tra danh sách giá phòng
    if (!listGiaPhongTheoNgay || listGiaPhongTheoNgay.length === 0) {
      return addToast(exampleToast('⚠️ Danh sách giá phòng không hợp lệ'))
    }

    // Kiểm tra giá phòng có hợp lệ không
    const giaPhongKhongHopLe = listGiaPhongTheoNgay.some((item) => {
      return !item.gia || item.gia <= 0 || isNaN(item.gia)
    })

    if (giaPhongKhongHopLe) {
      return addToast(exampleToast('⚠️ Có ngày có giá phòng không hợp lệ (phải lớn hơn 0)'))
    }

    // Kiểm tra phòng mới có tồn tại trong danh sách phòng trống không
    const phongMoiHopLe = phongOptions.some((phong) => phong.maPhong === selectedMaPhong)
    if (!phongMoiHopLe) {
      return addToast(exampleToast('⚠️ Phòng mới không tồn tại trong danh sách phòng trống'))
    }

    // Kiểm tra loại phòng mới có tồn tại trong danh sách loại phòng trống không
    const loaiPhongMoiHopLe = listLoaiPhongTrong.some(
      (lp) => lp.maLoaiPhong === selectedMaLoaiPhong,
    )
    if (!loaiPhongMoiHopLe) {
      return addToast(
        exampleToast('⚠️ Loại phòng mới không tồn tại trong danh sách loại phòng trống'),
      )
    }

    // Chuẩn bị dữ liệu danh sách giá phòng theo ngày
    const danhSachGiaPhong = listGiaPhongTheoNgay.map((item) => ({
      maLoaiPhong: item.maLoaiPhong,
      ngay: item.ngay,
      gia: item.gia,
    }))

    try {
      setTrangthaiload(true)
      const response = await saveChuyenPhong(
        maXepPhong,
        maPhong,
        selectedMaPhong,
        maLoaiPhong,
        danhSachGiaPhong, // truyền thêm danh sách giá phòng theo ngày
      )

      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✅ Chuyển phòng thành công'))
          onClose()
          const updatedData = {
            maPhongCu: maPhong,
            maPhongMoi: selectedMaPhong,
            maLoaiPhongMoi: selectedMaLoaiPhong,
            danhSachGiaPhong,
          }
          onSubmit(updatedData)
        } else {
          addToast(exampleToast('❌ Chuyển phòng không thành công'))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 500) {
          addToast(exampleToast('❌ Chuyển phòng không thành công. Internal Server Error!'))
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
  const [phongOptions, setPhongOptions] = useState([])

  const fetchPhongOptions = async (maloaiphong) => {
    if (ngayHienTai === null || ngayHienTai === undefined || ngayHienTai === '') {
      return addToast(exampleToast('⚠️ Ngày đến mới hiện không hợp lệ'))
    }
    if (ngayDi === null || ngayDi === undefined || ngayDi === '') {
      return addToast(exampleToast('⚠️ Ngày đi mới hiện không hợp lệ'))
    }

    if (maLoaiPhong === null || maLoaiPhong === undefined) {
      return addToast(exampleToast('⚠️ Mã Phòng hiện không hợp lệ'))
    }
    if (maXepPhong === null || maXepPhong === undefined) {
      return addToast(exampleToast('⚠️ Mã xếp phòng hiện không hợp lệ'))
    }

    try {
      const phong = await getListPhongTrongTheoKhoanThoiGian(
        maloaiphong,
        ngayHienTai,
        ngayDi,
        navigate,
      )
      console.log('phong', phong)

      if (phong) {
        setPhongOptions(phong)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [selectedMaPhong, setselectedMaPhong] = useState('0')

  const handleMaPhongChange = (event) => {
    const MaPhong = event.target.value
    setselectedMaPhong(MaPhong)
  }

  const handleLoaiPhongChange = async (event) => {
    const maLoai = event.target.value
    setSelectedMaLoaiPhong(maLoai)
    await fetchPhongOptions(maLoai)
    setselectedMaPhong('0')

    // Nếu chọn lại đúng loại phòng ban đầu thì hiển thị lại giá phòng cũ
    if (maLoai === maLoaiPhong) {
      setListGiaPhongTheoNgay(listGiaPhongTheoNgayGoc)
      return
    }

    // Lấy giá loại phòng mới
    const giaPhongCoDinh = await getGiaPhongTheoMaLoaiPhong(maLoai)
    setGiaPhong(giaPhongCoDinh || [])

    const getGiaTheoLoai = (date) => {
      const d = new Date(date)
      const thu = d.getDay()
      const isNgayLe = ngayLeVietNam.includes(format(d, 'MM-dd'))
      if (isNgayLe) {
        const giaNgayLe = giaPhongCoDinh.find((gp) => gp.giaNgayLe)
        return giaNgayLe ? giaNgayLe.gia : 0
      } else if (thu === 6) {
        const giaCuoiTuan = giaPhongCoDinh.find((gp) => gp.giaCuoiTuan)
        return giaCuoiTuan ? giaCuoiTuan.gia : 0
      } else {
        const giaNgayThuong = giaPhongCoDinh.find((gp) => gp.giaNgayThuong)
        return giaNgayThuong ? giaNgayThuong.gia : 0
      }
    }
    const newListGiaPhong = listGiaPhongTheoNgay.map((item) => {
      if (item.ngay < ngayHienTai) return item // giữ giá cũ và loại phòng cũ
      return { ...item, gia: getGiaTheoLoai(item.ngay), maLoaiPhong: maLoai } // cập nhật giá và loại phòng mới
    })
    setListGiaPhongTheoNgay(newListGiaPhong)
  }

  const [listLoaiPhongTrong, setListLoaiPhongTrong] = useState([])
  const [loadKiemTra, setLoadKiemTra] = useState(false)
  const kiemTraPhongTrong = async (ngayDen, ngayDi) => {
    const ngay_den = format(ngayDen, 'yyyy-MM-dd')
    const ngay_di = format(ngayDi, 'yyyy-MM-dd')
    console.log('ngay_den', ngay_den)
    console.log('ngay_dI', ngay_di)
    try {
      setLoadKiemTra(true)

      const listloaiphong = await getAllLoaiPhongTrongTrongKhoanThoiGian(
        ngay_den,
        ngay_di,
        navigate,
      )
      if (listloaiphong) {
        setListLoaiPhongTrong(listloaiphong)
        addToast(exampleToast('✔️ Tải danh sách thành công'))
      } else {
        addToast(exampleToast('❌ Không thể tải danh sách loại phòng trống. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách loại phòng trống:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoadKiemTra(false)
    }
  }

  useEffect(() => {
    if (visible) {
      setSelectedMaLoaiPhong(maLoaiPhong || '')
      fetchData()
      fetchPhongOptions(maLoaiPhong)
    }
  }, [visible, maLoaiPhong])

  const fetchData = async () => {
    if (!maLoaiPhong) return

    try {
      setLoading(true)
      const [phongTrong, giaPhongCoDinh, listGiaPhongTheoNgay] = await Promise.all([
        kiemTraPhongTrong(ngayHienTai, ngayDi),
        getGiaPhongTheoMaLoaiPhong(maLoaiPhong, navigate),
        getListGiaPhongTheoNgay(maXepPhong, navigate),
      ])

      if (phongTrong) {
        setListLoaiPhongTrong(phongTrong)
      }

      if (giaPhongCoDinh) {
        setGiaPhong(giaPhongCoDinh)
      }

      if (listGiaPhongTheoNgay) {
        setListGiaPhongTheoNgay(listGiaPhongTheoNgay)
        setListGiaPhongTheoNgayGoc(listGiaPhongTheoNgay)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeGiaPhongMoi = (ngay, gia) => {
    setListGiaPhongTheoNgay((prev) =>
      prev.map((item) => (item.ngay === ngay ? { ...item, gia: parseFloat(gia) || 0 } : item)),
    )
  }

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
  const ngayLeVietNam = [
    '01-01',
    '04-30',
    '05-01',
    '09-02',
    '01-01',
    '01-02',
    '01-03',
    '01-04',
    '01-05',
    '01-06',
    '01-07',
    '04-15',
    '05-05',
    '05-15',
    '08-15',
    '10-10',
    '12-25',
  ]
  const isNgayLe = (date) => {
    const dateStr = format(date, 'MM-dd')
    return ngayLeVietNam.includes(dateStr)
  }
  const getDateColorClass = (date) => {
    if (isNgayLe(date)) return '!text-red-500 !font-bold'
    const thu = getDay(date)
    if (thu === 6) return '!text-red-500'
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
        backdrop="static"
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="LiveDemoExampleLabel" className="font-bold text-red-500 text-xl">
            Chuyển phòng
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-2 text-base font-medium">
            Chuyển phòng từ <span className="font-semibold">P.{maPhong}</span> loại {tenPhong} sang
            phòng mới
          </div>
          <div className="mb-2 text-blue-700 font-semibold ">
            Chuyển phòng khác loại thời gian áp dụng tính từ ngày hiện tại tới hết ngày đi của
            booking
          </div>

          <div>
            Ngày đến:{' '}
            {ngayDen && !isNaN(new Date(ngayDen)) ? format(new Date(ngayDen), 'dd/MM/yyyy') : ''}
          </div>
          <div>
            Ngày đi:{' '}
            {ngayDen && !isNaN(new Date(ngayDi)) ? format(new Date(ngayDi), 'dd/MM/yyyy') : ''}
          </div>
          <div className="text-blue-500">
            Ngày hiện tại: {format(ngayHienTai ? ngayHienTai : new Date(), 'dd/MM/yyyy')}
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Cột trái: Chọn loại phòng, số phòng, bảng giá loại phòng */}
            <div className="flex-1 min-w-[260px]">
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label htmlFor="chon-loai-phong" className="block  font-semibold mb-1">
                    Chọn loại phòng mới
                  </label>
                  <CFormSelect
                    id="chon-loai-phong"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={selectedMaLoaiPhong}
                    onChange={handleLoaiPhongChange}
                    aria-label="Chọn loại phòng mới"
                    tabIndex={0}
                  >
                    <option value="">Chọn loại phòng</option>
                    {listLoaiPhongTrong.map((lp) => (
                      <option
                        key={lp.maLoaiPhong}
                        value={lp.maLoaiPhong}
                        disabled={lp.soPhongTrong === 0}
                      >
                        {lp.tenLoaiPhong} (Trống: {lp.soPhongTrong})
                      </option>
                    ))}
                  </CFormSelect>
                </div>
                <div className="flex-1">
                  <label htmlFor="chon-so-phong" className="block  font-semibold mb-1">
                    Chọn số phòng mới
                  </label>
                  <CFormSelect
                    id="chon-so-phong"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={selectedMaPhong}
                    onChange={handleMaPhongChange}
                    aria-label="Chọn số phòng mới"
                    tabIndex={0}
                  >
                    <option value="0">Chọn phòng</option>
                    {phongOptions?.map((phong) => {
                      let extra = phong.soGiuongThem === 1 ? ' - Extra' : ''
                      let doStr = phong.daDo === true ? ' - Dơ' : ''
                      return (
                        <option key={phong.maPhong} value={phong.maPhong}>
                          {phong.tenPhong} {extra}
                          {doStr}
                        </option>
                      )
                    })}
                  </CFormSelect>
                </div>
              </div>
            </div>
          </div>
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
                <div className="overflow-x-auto min-w-[320px]">
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
                                      {item.maLoaiPhong}, {getThu(date)} -{' '}
                                      {format(date, 'dd/MM/yyyy')}
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
                              {[...listGiaPhongTheoNgay]
                                .reduce((total, item) => total + (item.gia || 0), 0)
                                .toLocaleString('us-US')}
                            </CTableDataCell>
                          </CTableRow>
                        </>
                      )}
                    </CTableBody>
                  </CTable>
                </div>
              </CCol>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Đóng
          </CButton>
          {!trangthaiload && (
            <CButton color="success" className="text-white px-3" onClick={handleChuyenPhong}>
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

ChuyenPhong.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maXepPhong: PropTypes.string,
  ngayDen: PropTypes.string,
  ngayDi: PropTypes.string.isRequired,
  ngayHienTai: PropTypes.string,
  maPhong: PropTypes.string.isRequired,
  maLoaiPhong: PropTypes.string.isRequired,
  tenPhong: PropTypes.string,
  onSubmit: PropTypes.func,
}
export default ChuyenPhong
