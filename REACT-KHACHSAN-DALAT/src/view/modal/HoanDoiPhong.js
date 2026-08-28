import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CFormSelect,
  CRow,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModalFooter,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { format, getDay, parseISO } from 'date-fns'

import { getGiaPhongTheoMaLoaiPhong, getListGiaPhongTheoNgay, getGiaPhongTheoLoaiVaNgay } from 'src/service/APIService'
import { saveHoanDoiPhong } from 'src/service/HoanDoiPhongService'
import { getListPhongDangOTheoLoai } from 'src/service/PhongService'
import { getThongKePhongDangOTheoLoaiController } from 'src/service/LoaiPhongService'

const HoanDoiPhong = ({
  visible,
  onClose,
  maXepPhong1,
  ngayDen1,
  ngayDi1,
  ngayHienTai1,
  maPhong1,
  maLoaiPhong1,
  tenPhong1,
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

  const [listLoaiPhongTrong, setListLoaiPhongTrong] = useState([])
  const [selectedMaLoaiPhong2, setSelectedMaLoaiPhong2] = useState('')
  const [tenLoaiPhong2, setTenLoaiPhong2] = useState('') // Tên loại phòng 2 đã chọn
  const [phong2Options, setPhong2Options] = useState([])
  const [selectedMaPhong2, setSelectedMaPhong2] = useState('0')
  const [loading, setLoading] = useState(false)

  // Giá phòng
  const [giaPhongHienTai, setGiaPhongHienTai] = useState([]) // Giá loại phòng 1
  const [giaPhongMoi, setGiaPhongMoi] = useState([]) // Giá loại phòng 2
  const [listGiaPhongTheoNgayGoc, setListGiaPhongTheoNgayGoc] = useState([]) // Giá gốc theo ngày
  const [listGiaPhongTheoNgay, setListGiaPhongTheoNgay] = useState([]) // Giá sau khi đổi
  const [listGiaP2TheoLoaiP1, setListGiaP2TheoLoaiP1] = useState([]) // Giá P2 theo loại P1

  const ngayLeVietNam = [
    '01-01', '04-30', '05-01', '09-02',
    '01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07',
    '04-15', '05-05', '05-15', '08-15', '10-10', '12-25',
  ]

  const isNgayLe = (date) => {
    const dateStr = format(date, 'MM-dd')
    return ngayLeVietNam.includes(dateStr)
  }

  const getThu = (date) => {
    const thu = getDay(date)
    const thuMap = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' }
    return thuMap[thu]
  }

  const getDateColorClass = (date) => {
    if (isNgayLe(date)) return '!text-red-500 !font-bold'
    const thu = getDay(date)
    if (thu === 6) return '!text-red-500'
    return ''
  }

  const fetchPhongOptions = async (maloaiphong) => {
    if (!ngayHienTai1 || !ngayDi1) {
      return addToast(exampleToast('⚠️ Ngày không hợp lệ'))
    }

    try {
      const phong = await getListPhongDangOTheoLoai(
        maloaiphong,
        ngayHienTai1,
        ngayDi1,
      )
      if (phong) {
        setPhong2Options(phong)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const fetchGiaPhong = async (maLoaiPhong) => {
    try {
      const data = await getGiaPhongTheoMaLoaiPhong(maLoaiPhong)
      return data || []
    } catch (error) {
      console.error('Lỗi khi tải giá phòng:', error)
      return []
    }
  }

  const fetchListGiaPhongTheoNgay = async () => {
    try {
      const data = await getListGiaPhongTheoNgay(maXepPhong1, navigate)
      return data || []
    } catch (error) {
      console.error('Lỗi khi tải giá theo ngày:', error)
      return []
    }
  }

  useEffect(() => {
    if (visible) {
      setSelectedMaLoaiPhong2('')
      setTenLoaiPhong2('')
      setSelectedMaPhong2('0')
      setPhong2Options([])
      setGiaPhongMoi([])
      setListGiaP2TheoLoaiP1([])
      setListGiaPhongTheoNgay([])
      fetchData()
    }
  }, [visible])

  const fetchData = async () => {
    if (!maLoaiPhong1) return

    setLoading(true)
    try {
      const [loaiPhongTrong, giaHienTai, giaTheoNgay] = await Promise.all([
        getThongKePhongDangOTheoLoaiController(
          format(new Date(ngayHienTai1), 'yyyy-MM-dd'),
          format(new Date(ngayDi1), 'yyyy-MM-dd'),
        ),
        fetchGiaPhong(maLoaiPhong1),
        fetchListGiaPhongTheoNgay(),
      ])

      if (loaiPhongTrong) {
        setListLoaiPhongTrong(loaiPhongTrong)
      }
      if (giaHienTai) {
        setGiaPhongHienTai(giaHienTai)
      }
      if (giaTheoNgay) {
        setListGiaPhongTheoNgay(giaTheoNgay)
        setListGiaPhongTheoNgayGoc(giaTheoNgay)
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoaiPhong2Change = async (event) => {
    const maLoai = event.target.value
    setSelectedMaLoaiPhong2(maLoai)
    setSelectedMaPhong2('0')
    setPhong2Options([])

    // Lưu tên loại phòng 2 đã chọn
    if (maLoai) {
      const loaiPhong = listLoaiPhongTrong.find((lp) => lp.maLoaiPhong === maLoai)
      setTenLoaiPhong2(loaiPhong?.tenLoaiPhong || maLoai)
    } else {
      setTenLoaiPhong2('')
    }

    if (maLoai && maLoai !== '') {
      // Lấy giá loại phòng mới
      const giaMoi = await fetchGiaPhong(maLoai)
      setGiaPhongMoi(giaMoi)

      // Lấy danh sách phòng
      await fetchPhongOptions(maLoai)

      // Cập nhật giá theo ngày nếu khác loại phòng
      if (maLoai !== maLoaiPhong1) {
        tinhGiaPhongMoi(maLoai, giaMoi)
        // Tính giá P2 theo loại P1 (để biết P.105 đổi về P.101 sẽ có giá bao nhiêu)
        tinhGiaP2TheoLoaiP1()
      } else {
        // Nếu chọn lại đúng loại phòng ban đầu thì giữ giá cũ
        setListGiaPhongTheoNgay([...listGiaPhongTheoNgayGoc])
        setListGiaP2TheoLoaiP1([...listGiaPhongTheoNgayGoc])
      }
    } else {
      setGiaPhongMoi([])
      setListGiaP2TheoLoaiP1([])
      setListGiaPhongTheoNgay([...listGiaPhongTheoNgayGoc])
    }
  }

  // Tính giá P2 (phòng hoán đổi) theo loại P1 (loại phòng hiện tại)
  // Khi P.105 đổi về P.101, nó sẽ nhận giá theo loại P1 (loại A)
  const tinhGiaP2TheoLoaiP1 = () => {
    // P.105 đổi về P.101 sẽ nhận giá của loại A = giá gốc
    setListGiaP2TheoLoaiP1([...listGiaPhongTheoNgayGoc])
  }

  const tinhGiaPhongMoi = (maLoaiMoi, giaPhongCoDinh) => {
    const getGiaTheoLoai = (date) => {
      const d = new Date(date)
      const thu = getDay(d)
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

    const newListGiaPhong = listGiaPhongTheoNgayGoc.map((item) => {
      if (item.ngay < ngayHienTai1) return item
      return { ...item, gia: getGiaTheoLoai(item.ngay), maLoaiPhong: maLoaiMoi }
    })
    setListGiaPhongTheoNgay(newListGiaPhong)
  }

  const handlePhong2Change = (event) => {
    const maPhong = event.target.value
    setSelectedMaPhong2(maPhong)
  }

  const handleChangeGiaPhongMoi = (ngay, gia) => {
    setListGiaPhongTheoNgay((prev) =>
      prev.map((item) => (item.ngay === ngay ? { ...item, gia: parseFloat(gia) || 0 } : item)),
    )
  }

  const handleHoanDoiPhong = async () => {
    if (!maXepPhong1 || !maXepPhong1.trim()) {
      return addToast(exampleToast('⚠️ Mã xếp phòng không hợp lệ'))
    }

    if (!selectedMaLoaiPhong2 || selectedMaLoaiPhong2 === '') {
      return addToast(exampleToast('⚠️ Vui lòng chọn loại phòng'))
    }

    if (!selectedMaPhong2 || selectedMaPhong2 === '0') {
      return addToast(exampleToast('⚠️ Vui lòng chọn phòng hoán đổi'))
    }

    if (selectedMaPhong2 === maPhong1) {
      return addToast(exampleToast('⚠️ Phòng hoán đổi không được trùng với phòng hiện tại'))
    }

    try {
      setTrangthaiload(true)

      // Chuẩn bị danh sách giá phòng theo ngày
      const danhSachGiaPhong = listGiaPhongTheoNgay.map((item) => ({
        maLoaiPhong: item.maLoaiPhong,
        ngay: item.ngay,
        gia: item.gia,
      }))

      const response = await saveHoanDoiPhong(
        maXepPhong1,
        maPhong1,
        null,
        selectedMaPhong2,
        danhSachGiaPhong,
      )

      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ Hoán đổi phòng thành công'))
          onClose()
          const updatedData = {
            maPhong1Cu: maPhong1,
            maPhong1Moi: selectedMaPhong2,
            maPhong2Cu: selectedMaPhong2,
            maPhong2Moi: maPhong1,
          }
          onSubmit(updatedData)
        } else {
          addToast(exampleToast('❌ Hoán đổi phòng không thành công'))
        }
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response) {
        const { status, data } = error.response
        if (status === 500) {
          addToast(exampleToast('❌ Hoán đổi phòng không thành công. Internal Server Error!'))
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

  // Tính tổng giá cũ và mới
  const tongGiaGoc = listGiaPhongTheoNgayGoc.reduce((total, item) => total + (item.gia || 0), 0)
  const tongGiaMoi = listGiaPhongTheoNgay.reduce((total, item) => total + (item.gia || 0), 0)
  const tongGiaP2TheoLoaiP1 = listGiaP2TheoLoaiP1.reduce((total, item) => total + (item.gia || 0), 0)
  // Chênh lệch = Giá P1 theo Loại B - Giá P2 theo Loại A
  // = tongGiaMoi - tongGiaP2TheoLoaiP1
  // = tongGiaMoi - tongGiaGoc (vì P2 theo Loại A = giá gốc)
  const chenhLechDoiPhong = tongGiaMoi - tongGiaP2TheoLoaiP1
  const chenhLech = tongGiaMoi - tongGiaGoc

  return (
    <>
      <div className="fixed top-0 right-0 z-50">
        <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />
      </div>

      <CModal
        size="xl"
        alignment="center"
        visible={visible}
        onClose={onClose}
        backdrop="static"
        aria-labelledby="HoanDoiPhongLabel"
      >
        <CModalHeader>
          <CModalTitle id="HoanDoiPhongLabel" className="font-bold text-purple-600 text-xl">
            Hoán đổi phòng
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3 text-base font-medium">
            Hoán đổi phòng <span className="font-semibold text-red-500">P.{maPhong1}</span>{' '}
            (loại {tenPhong1}) sang phòng khác
          </div>

          <div className="mb-3 text-sm text-gray-600">
            <div>
              Ngày đến:{' '}
              {ngayDen1 && !isNaN(new Date(ngayDen1))
                ? format(new Date(ngayDen1), 'dd/MM/yyyy')
                : ''}
            </div>
            <div>
              Ngày đi:{' '}
              {ngayDi1 && !isNaN(new Date(ngayDi1))
                ? format(new Date(ngayDi1), 'dd/MM/yyyy')
                : ''}
            </div>
            <div className="text-blue-500">
              Ngày hiện tại:{' '}
              {ngayHienTai1 ? format(new Date(ngayHienTai1), 'dd/MM/yyyy') : ''}
            </div>
          </div>

          <CRow className="mb-4 justify-center">
            {/* Phòng 1 - chỉ hiển thị thông tin */}
            <CCol sm={5}>
              <div className="border rounded-lg p-3 bg-red-50 h-full">
                <h5 className="font-bold text-red-600 mb-2">Phòng 1 (hiện tại)</h5>
                <div className="mb-1 text-sm font-medium text-gray-700">
                  Phòng: <span className="text-red-500 font-semibold">P.{maPhong1}</span>
                </div>
                <div className="mb-1 text-sm text-gray-700">
                  Loại: <span className="text-gray-600">{tenPhong1}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Mã xếp phòng: <span className="font-mono">{maXepPhong1}</span>
                </div>
              </div>
            </CCol>

            {/* Mũi tên hoán đổi */}
            <CCol sm={1} className="flex items-center justify-center">
              <div className="text-3xl text-purple-400 font-bold">↔</div>
            </CCol>

            {/* Phòng 2 - chọn loại phòng rồi số phòng */}
            <CCol sm={5}>
              <div className="border rounded-lg p-3 bg-purple-50 h-full">
                <h5 className="font-bold text-purple-600 mb-2">Phòng 2 (hoán đổi)</h5>

                <div className="mb-2">
                  <label
                    htmlFor="chon-loai-phong-2"
                    className="block font-semibold mb-1 text-sm"
                  >
                    Chọn loại phòng
                  </label>
                  <CFormSelect
                    id="chon-loai-phong-2"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={selectedMaLoaiPhong2}
                    onChange={handleLoaiPhong2Change}
                    aria-label="Chọn loại phòng"
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

                <div className="mb-2">
                  <label htmlFor="chon-phong-2" className="block font-semibold mb-1 text-sm">
                    Chọn số phòng
                  </label>
                  <CFormSelect
                    id="chon-phong-2"
                    className="w-full border border-gray-300 rounded px-2 py-1"
                    value={selectedMaPhong2}
                    onChange={handlePhong2Change}
                    aria-label="Chọn số phòng"
                    disabled={!selectedMaLoaiPhong2}
                  >
                    <option value="0">
                      {!selectedMaLoaiPhong2 ? 'Chọn loại phòng trước' : 'Chọn phòng'}
                    </option>
                    {phong2Options?.map((phong) => {
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

                {selectedMaPhong2 && selectedMaPhong2 !== '0' && (
                  <div className="text-sm text-green-600 font-medium mt-1">
                    ✓ Đã chọn: P.{selectedMaPhong2}
                  </div>
                )}
              </div>
            </CCol>

          
          </CRow>

          <CRow>
              {/*Bảng giá  */}
              <CCol>
              <div className="border rounded-lg p-3 bg-blue-50 h-full">
                <h5 className="font-bold text-blue-600 mb-3">Bảng giá hoán đổi</h5>

                {/* Header hiển thị 2 phòng */}
                <CRow className="mb-2">
                  <CCol sm={6}>
                    <div className="bg-red-100 rounded p-2 text-center">
                      <div className="text-xs text-red-600 font-bold">P1 (Hiện tại)</div>
                      <div className="text-sm text-red-700 font-semibold">P.{maPhong1}</div>
                      <div className="text-xs text-red-600">{tenPhong1}</div>
                    </div>
                  </CCol>
                  <CCol sm={6}>
                    <div className={`rounded p-2 text-center ${
                      selectedMaLoaiPhong2 ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <div className="text-xs font-bold" style={{ 
                        color: selectedMaLoaiPhong2 ? '#9333ea' : '#9ca3af' 
                      }}>
                        P2 (Hoán đổi)
                      </div>
                      <div className="text-sm font-semibold" style={{ 
                        color: selectedMaLoaiPhong2 ? '#7c3aed' : '#9ca3af' 
                      }}>
                        {selectedMaPhong2 && selectedMaPhong2 !== '0' ? `P.${selectedMaPhong2}` : '...'}
                      </div>
                      <div className="text-xs" style={{ 
                        color: selectedMaLoaiPhong2 ? '#7c3aed' : '#9ca3af' 
                      }}>
                        {selectedMaLoaiPhong2 ? tenLoaiPhong2 : 'Chưa chọn'}
                      </div>
                    </div>
                  </CCol>
                </CRow>

                {/* Bảng giá theo ngày - 6 cột */}
                <div className="overflow-x-auto max-h-56 overflow-y-auto border rounded">
                  <CTable small responsive className="text-xs mb-0">
                    <CTableHead>
                      <CTableRow className="bg-blue-200">
                        <CTableHeaderCell scope="col" className="!text-blue-800 !py-1 !px-1 !font-bold w-20">
                          Ngày
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="!text-red-700 !py-1 !px-1 text-center !font-bold w-24">
                          P.{maPhong1}<br/><span className="font-normal text-xs">Loại A</span>
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="!text-red-700 !py-1 !px-1 text-center !font-bold w-24">
                          P.{maPhong1}<br/><span className="font-normal text-xs">Loại B</span>
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className={`!py-1 !px-1 text-center !font-bold w-24 ${selectedMaPhong2 && selectedMaPhong2 !== '0' ? '!text-purple-700' : '!text-gray-400'}`}>
                          P.{selectedMaPhong2 !== '0' ? selectedMaPhong2 : '?'}<br/><span className="font-normal text-xs">Loại A</span>
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className={`!py-1 !px-1 text-center !font-bold w-24 ${selectedMaPhong2 && selectedMaPhong2 !== '0' ? '!text-purple-700' : '!text-gray-400'}`}>
                          P.{selectedMaPhong2 !== '0' ? selectedMaPhong2 : '?'}<br/><span className="font-normal text-xs">Loại B</span>
                        </CTableHeaderCell>
                        <CTableHeaderCell scope="col" className="!text-green-700 !py-1 !px-1 text-center !font-bold w-20">
                          Lệch
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {loading ? (
                        <CTableRow>
                          <CTableDataCell colSpan={6} className="text-center py-3">
                            <CSpinner size="sm" className="me-1" />
                          </CTableDataCell>
                        </CTableRow>
                      ) : listGiaPhongTheoNgay.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={6} className="text-center py-3 text-gray-500">
                            Chưa có dữ liệu giá
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        <>
                          {listGiaPhongTheoNgay.map((item, index) => {
                            const date = parseISO(item.ngay)
                            // Giá P1 (P.110) theo Loại A (hiện tại)
                            const giaP1LoaiA = listGiaPhongTheoNgayGoc[index]?.gia || 0
                            // Giá P1 (P.110) theo Loại B (P.110 đổi sang phòng P.103 sẽ áp dụng giá này)
                            const giaP1LoaiB = item.gia || 0
                            // Giá P2 (P.103) theo Loại A (P.103 đổi về P.110 sẽ nhận giá này)
                            const giaP2LoaiA = listGiaP2TheoLoaiP1[index]?.gia || 0
                            // Giá P2 (P.103) theo Loại B (P.103 sau khi nhận khách từ P.110 sẽ áp dụng giá này)
                            // Vì P.103 và P.110 cùng Loại B nên giá = giá Loại B của P.110
                            const giaP2LoaiB = item.gia || 0
                            // Chênh lệch = Giá P1 theo Loại B - Giá P2 theo Loại A
                            const chenhGia = giaP1LoaiB - giaP2LoaiA
                            const isNgayHienTai = item.ngay >= ngayHienTai1
                            const hasP2 = selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0'

                            return (
                              <CTableRow 
                                key={item.maGiaPhongTheoNgay || index}
                                className={isNgayHienTai ? 'bg-yellow-50' : ''}
                              >
                                <CTableDataCell className="!py-1 !px-1">
                                  <span className={getDateColorClass(date)}>
                                    {getThu(date)} - {format(date, 'dd/MM')}
                                  </span>
                                  {isNgayHienTai && (
                                    <span className="text-xs text-blue-500 ml-1">✓</span>
                                  )}
                                </CTableDataCell>
                                {/* P.101 theo Loại A */}
                                <CTableDataCell className="!py-1 !px-1 text-right">
                                  <span className="text-red-600 font-medium inline-block w-full text-right">
                                    {giaP1LoaiA > 0 ? giaP1LoaiA.toLocaleString('us-US') : '-'}
                                  </span>
                                </CTableDataCell>
                                {/* P.101 theo Loại B */}
                                <CTableDataCell className="!py-1 !px-1 text-right">
                                  {hasP2 ? (
                                    <span className={`font-medium inline-block w-full text-right ${
                                      giaP1LoaiB > 0 ? (giaP1LoaiB !== giaP1LoaiA ? 'text-purple-600' : 'text-gray-600') : 'text-gray-400'
                                    }`}>
                                      {giaP1LoaiB > 0 ? giaP1LoaiB.toLocaleString('us-US') : '-'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </CTableDataCell>
                                {/* P.105 theo Loại A */}
                                <CTableDataCell className="!py-1 !px-1 text-right">
                                  {hasP2 ? (
                                    <span className={`font-medium inline-block w-full text-right ${
                                      giaP2LoaiA > 0 ? 'text-purple-600' : 'text-gray-400'
                                    }`}>
                                      {giaP2LoaiA > 0 ? giaP2LoaiA.toLocaleString('us-US') : '-'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </CTableDataCell>
                                {/* P.103 theo Loại B (P.103 sau khi nhận khách sẽ áp dụng giá Loại B) */}
                                <CTableDataCell className="!py-1 !px-1 text-right">
                                  {hasP2 ? (
                                    <span className={`font-medium inline-block w-full text-right ${
                                      giaP2LoaiB > 0 ? 'text-purple-600' : 'text-gray-400'
                                    }`}>
                                      {giaP2LoaiB > 0 ? giaP2LoaiB.toLocaleString('us-US') : '-'}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </CTableDataCell>
                                {/* Chênh lệch */}
                                <CTableDataCell className="!py-1 !px-1 text-right">
                                  {hasP2 && chenhGia !== 0 ? (
                                    <span
                                      className={`font-bold inline-block w-full text-right ${
                                        chenhGia > 0
                                          ? 'text-red-600'
                                          : 'text-green-600'
                                      }`}
                                    >
                                      {chenhGia > 0 ? '+' : ''}
                                      {chenhGia.toLocaleString('us-US')}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">-</span>
                                  )}
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })}
                          <CTableRow className="font-bold bg-gray-200">
                            <CTableDataCell className="!py-1 !px-1 !font-bold">Tạm tính</CTableDataCell>
                            {/* P.101 theo Loại A */}
                            <CTableDataCell className="!py-1 !px-1 text-right">
                              <span className="text-red-700 font-bold inline-block w-full text-right">
                                {tongGiaGoc.toLocaleString('us-US')}
                              </span>
                            </CTableDataCell>
                            {/* P.101 theo Loại B */}
                            <CTableDataCell className="!py-1 !px-1 text-right">
                              {selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0' ? (
                                <span className={`font-bold inline-block w-full text-right ${
                                  tongGiaMoi > 0 ? 'text-purple-700' : 'text-gray-400'
                                }`}>
                                  {tongGiaMoi.toLocaleString('us-US')}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </CTableDataCell>
                            {/* P.105 theo Loại A */}
                            <CTableDataCell className="!py-1 !px-1 text-right">
                              {selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0' ? (
                                <span className={`font-bold inline-block w-full text-right ${
                                  tongGiaP2TheoLoaiP1 > 0 ? 'text-purple-700' : 'text-gray-400'
                                }`}>
                                  {tongGiaP2TheoLoaiP1.toLocaleString('us-US')}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </CTableDataCell>
                            {/* P.103 theo Loại B (P.103 sau khi nhận khách sẽ áp dụng giá Loại B) */}
                            <CTableDataCell className="!py-1 !px-1 text-right">
                              {selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0' ? (
                                <span className={`font-bold inline-block w-full text-right ${
                                  tongGiaMoi > 0 ? 'text-purple-700' : 'text-gray-400'
                                }`}>
                                  {tongGiaMoi.toLocaleString('us-US')}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </CTableDataCell>
                            {/* Chênh lệch */}
                            <CTableDataCell className="!py-1 !px-1 text-right">
                              {selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0' ? (
                                <span
                                  className={`font-bold inline-block w-full text-right ${
                                    chenhLechDoiPhong > 0
                                      ? 'text-red-600'
                                      : chenhLechDoiPhong < 0
                                        ? 'text-green-600'
                                        : 'text-gray-500'
                                  }`}
                                >
                                  {chenhLechDoiPhong > 0 ? '+' : ''}
                                  {chenhLechDoiPhong.toLocaleString('us-US')}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        </>
                      )}
                    </CTableBody>
                  </CTable>
                </div>

                {/* Chênh lệch tổng */}
                {selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0' && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-300">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Chênh lệch hoán đổi:</div>
                      <div
                        className={`text-lg font-bold ${
                          chenhLechDoiPhong > 0
                            ? 'text-red-600'
                            : chenhLechDoiPhong < 0
                              ? 'text-green-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {chenhLechDoiPhong > 0 ? '+' : ''}
                        {chenhLechDoiPhong.toLocaleString('us-US')} VNĐ
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      P.{maPhong1} ({tenPhong1}) ↔ P.{selectedMaPhong2} ({tenLoaiPhong2})
                    </div>
                    {chenhLechDoiPhong > 0 && (
                      <div className="text-xs text-red-500 mt-1 text-center">
                        ↑ Khách phải trả thêm {chenhLechDoiPhong.toLocaleString('us-US')} VNĐ
                      </div>
                    )}
                    {chenhLechDoiPhong < 0 && (
                      <div className="text-xs text-green-500 mt-1 text-center">
                        ↓ Khách được hoàn {Math.abs(chenhLechDoiPhong).toLocaleString('us-US')} VNĐ
                      </div>
                    )}
                  </div>
                )}

                {/* Giải thích */}
                {selectedMaLoaiPhong2 && selectedMaPhong2 && selectedMaPhong2 !== '0' && (
                  <div className="mt-2 text-xs text-gray-500 p-2 bg-gray-100 rounded">
                    <div className="font-semibold mb-1">📋 Giải thích 4 giá:</div>
                    <div>• <span className="text-red-600">P.{maPhong1} Loại A</span>: Giá hiện tại của P.{maPhong1}</div>
                    <div>• <span className="text-purple-600">P.{maPhong1} Loại B</span>: Giá P.{maPhong1} nếu áp dụng loại {tenLoaiPhong2}</div>
                    <div>• <span className="text-purple-600">P.{selectedMaPhong2} Loại A</span>: Giá P.{selectedMaPhong2} nếu áp dụng loại {tenPhong1}</div>
                    <div>• <span className="text-purple-600">P.{selectedMaPhong2} Loại B</span>: Giá P.{selectedMaPhong2} nếu áp dụng loại {tenLoaiPhong2}</div>
                    <div className="mt-1">• <span className="text-green-600">Chênh lệch</span>: = P.{maPhong1} Loại B - P.{selectedMaPhong2} Loại A</div>
                  </div>
                )}
              </div>
            </CCol>
          </CRow>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 font-medium">
              ⚠️ Lưu ý: Hoán đổi phòng sẽ trao đổi thông tin khách hàng và booking giữa 2
              phòng. Giá mới áp dụng từ ngày hiện tại tới hết ngày đi của booking.
            </p>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onClose} variant="outline">
            Đóng
          </CButton>
          {!trangthaiload ? (
            <CButton
              color="primary"
              className="text-white px-3"
              onClick={handleHoanDoiPhong}
              disabled={!selectedMaPhong2 || selectedMaPhong2 === '0'}
            >
              <FontAwesomeIcon icon={faCheck} /> Đồng ý hoán đổi
            </CButton>
          ) : (
            <CButton color="primary" disabled>
              <CSpinner as="span" size="sm" aria-hidden="true" />
              Đang xử lý...
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

HoanDoiPhong.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  maXepPhong1: PropTypes.string,
  ngayDen1: PropTypes.string,
  ngayDi1: PropTypes.string.isRequired,
  ngayHienTai1: PropTypes.string,
  maPhong1: PropTypes.string.isRequired,
  maLoaiPhong1: PropTypes.string.isRequired,
  tenPhong1: PropTypes.string,
  onSubmit: PropTypes.func,
}
export default HoanDoiPhong
