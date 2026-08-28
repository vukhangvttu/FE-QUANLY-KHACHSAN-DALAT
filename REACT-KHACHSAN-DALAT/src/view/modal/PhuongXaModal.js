import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSmartTable,
  CSpinner,
  CToast,
  CToastBody,
  CToaster,
  CToastHeader,
} from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import {
  createThemPhuongXa,
  getAllTinhThanh,
  getHuyenByMaTinh,
  getPhuongXaUserTuThem,
} from 'src/service/APIService'
import { useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons'
import { format } from 'date-fns'
const PhuongXaModal = ({ visible, onClose, onSubmit }) => {
  const [danhSachTinh, setDanhSachTinh] = useState([])
  const [danhSachPhuongXa, setDanhSachPhuongXa] = useState([])
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const DanhSach = async () => {
    try {
      // Gọi 3 API đồng thời với Promise.all
      const [tinhThanh, danhsachphuongxa] = await Promise.all([
        getAllTinhThanh(navigate),
        getPhuongXaUserTuThem(navigate),
      ])

      // Kiểm tra và xử lý kết quả khi tất cả API thành công
      if (tinhThanh) {
        setDanhSachTinh(tinhThanh)
      } else {
        addToast(exampleToast('⚠️ Không thể tải danh sách. Vui lòng thử lại sau!'))
      }
      if (danhsachphuongxa) {
        setDanhSachPhuongXa(danhsachphuongxa)
      } else {
        addToast(exampleToast('⚠️ Không thể tải danh sách. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      addToast(exampleToast('❌ Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại!'))
    }
  }

  useEffect(() => {
    DanhSach()
  }, [])

  const [danhSachHuyen, setDanhSachHuyen] = useState([])
  const DanhSachHuyen = async (maTinh) => {
    try {
      // Gọi API lấy thông tin booking
      const huyen = await getHuyenByMaTinh(maTinh, navigate)

      if (huyen) {
        // Gọi API lấy chi tiết booking

        setDanhSachHuyen(huyen)
      } else {
        addToast(exampleToast('Không thể tải danh sách huyện. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin huyện:', error)
      addToast(exampleToast('Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    }
  }

  const [valueTinh, setValueTinh] = useState(null)

  const handleChangeTinhThanh = (e) => {
    console.log(e)
    const maTinh = e.maTinh

    if (maTinh === '' || maTinh === undefined) {
      addToast(exampleToast('❌ Mã tỉnh hiện tại không hợp lệ'))
    } else {
      DanhSachHuyen(maTinh)
      setValueTinh(e)
    }
  }

  const [valueHuyen, setValueHuyen] = useState(null)

  const handleChangeHuyen = (e) => {
    console.log(e)
    const maHuyen = e.maHuyen

    if (maHuyen === '' || maHuyen === undefined) {
      addToast(exampleToast('❌ Mã huyện hiện tại không hợp lệ'))
    } else {
      setValueHuyen(e)
      setThemPhuongXa((prev) => ({
        ...prev,
        huyen: {
          maHuyen: e.maHuyen || '',
        },
      }))
    }
  }
  const [themPhuongXa, setThemPhuongXa] = useState({
    tenPhuongXa: '',
    huyen: { maHuyen: '' },
  })

  const onInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'tenPhuongXa') {
      // Viết hoa chữ cái đầu của mỗi từ và chuyển các chữ còn lại thành chữ thường
      const words = value.split(' ')
      const capitalizedWords = words.map((word) => {
        if (word.length === 0) return word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      const capitalizedValue = capitalizedWords.join(' ')
      setThemPhuongXa({ ...themPhuongXa, [name]: capitalizedValue })
    } else {
      setThemPhuongXa({ ...themPhuongXa, [name]: value })
    }
  }

  const [validated, setValidated] = useState(false)

  const [trangthaiload, setTrangthaiload] = useState(false)

  const loadDanhSachPhuongXa = async () => {
    try {
      setLoading(true)
      const danhsachphuongxa = await getPhuongXaUserTuThem(navigate)
      if (danhsachphuongxa) {
        setDanhSachPhuongXa(danhsachphuongxa)
      } else {
        addToast(exampleToast('⚠️ Không thể tải danh sách phường xã. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Error loading phường xã:', error)
      addToast(exampleToast('❌ Đã xảy ra lỗi khi tải danh sách phường xã'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    try {
      // Kiểm tra các trường bắt buộc
      if (!valueTinh) {
        addToast(exampleToast('⚠️ Vui lòng chọn Tỉnh/Thành phố'))
        return
      }
      if (!valueHuyen) {
        addToast(exampleToast('⚠️ Vui lòng chọn Quận/Huyện'))
        return
      }
      if (!themPhuongXa.tenPhuongXa?.trim()) {
        addToast(exampleToast('⚠️ Vui lòng nhập tên Phường/Xã'))
        return
      }

      console.log(themPhuongXa)

      setTrangthaiload(true)
      const response = await createThemPhuongXa(themPhuongXa, navigate)

      if ([400, 500].includes(response.code)) {
        addToast(exampleToast(response.message))
        return
      }

      if (response.code === 200) {
        if (response.result) {
          addToast(exampleToast('✔️ ' + response.message))
          setThemPhuongXa({
            tenPhuongXa: '',
            huyen: {
              maHuyen: valueHuyen?.maHuyen || '',
            },
          })
          // Load lại danh sách phường xã
          await loadDanhSachPhuongXa()
          onSubmit(true)
        } else {
          addToast(exampleToast('❌ Thêm phường xã không thành công'))
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

  const columnxp = [
    {
      key: 'maPhuongXa',
      label: 'Phường xã',
      // filter: false,
      // sorter: false,
    },
    {
      key: 'tenPhuongXa',
      label: 'Tên phường xã',
      // _style: { width: '20%' },
    },

    {
      key: 'tenPhuongXa_DayDu',
      label: 'Tên đầy đủ',
      // _style: { width: '20%' },
    },

    {
      key: 'thoiGianTao',
      label: 'Thời gian tạo',
      // _style: { width: '20%' },
    },
  ]

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
      <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

      <CModal
        size="lg"
        backdrop="static"
        visible={visible}
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel" className="text-red-600 font-bold">
            Phường Xã
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="justify-content-center">
            <CCol md={9} lg={7} xl={8}>
              <CForm validated={validated} onSubmit={handleSubmit}>
                <h1 className="text-center mb-3 text-blue-600 font-bold">THÊM PHƯỜNG XÃ</h1>
                <CRow className="mb-3">
                  <CFormLabel
                    htmlFor="staticEmail"
                    className="col-md-4 col-form-label labelcustome"
                  >
                    TP/Tỉnh
                  </CFormLabel>
                  <CCol md={8}>
                    <Select
                      getOptionValue={(option) => option.maTinh}
                      getOptionLabel={(option) => option.tenTinh}
                      // value={nhomKhachHang.find(
                      //   (option) =>
                      //     option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                      // )}
                      options={danhSachTinh}
                      onChange={handleChangeTinhThanh}
                      placeholder={'Chọn TP/Tỉnh'}
                      value={valueTinh}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-md-4 col-form-label labelcustome"
                  >
                    Quận/Huyện
                  </CFormLabel>
                  <CCol md={8}>
                    <Select
                      getOptionValue={(option) => option.maHuyen}
                      getOptionLabel={(option) => option.tenhuyen}
                      // value={nhomKhachHang.find(
                      //   (option) =>
                      //     option.maNhomKhachHang === booKing.nhomKhachHang.maNhomKhachHang,
                      // )}
                      options={danhSachHuyen}
                      onChange={handleChangeHuyen}
                      placeholder={'Chọn Quận/Huyện'}
                      value={valueHuyen}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CFormLabel
                    htmlFor="inputPassword"
                    className="col-md-4 col-form-label labelcustome"
                  >
                    Tên phường xã
                  </CFormLabel>
                  <CCol md={8}>
                    <CFormInput
                      type="text"
                      name="tenPhuongXa"
                      placeholder="Nhập tên phường xã"
                      onChange={(e) => onInputChange(e)}
                      value={themPhuongXa.tenPhuongXa}
                    />
                  </CCol>
                </CRow>

                <CCol></CCol>
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <CButton color="secondary" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} /> Đóng
                  </CButton>

                  {trangthaiload && (
                    <CButton color="primary" disabled>
                      <CSpinner as="span" size="sm" aria-hidden="true" className="font-semibold" />
                      Save...
                    </CButton>
                  )}

                  {!trangthaiload && (
                    <CButton
                      ype="submit"
                      color="primary"
                      variant="outline"
                      className="font-semibold"
                      onClick={handleSubmit}
                    >
                      <FontAwesomeIcon icon={faFloppyDisk} /> Save
                    </CButton>
                  )}
                </div>
              </CForm>
            </CCol>
          </CRow>

          <CSmartTable
            loading={loading}
            items={danhSachPhuongXa}
            activePage={1}
            columns={columnxp}
            columnFilter
            columnSorter
            itemsPerPageSelect
            itemsPerPage={10}
            pagination
            onFilteredItemsChange={(items) => {
              console.log(items)
            }}
            onSelectedItemsChange={(items) => {
              console.log(items)
            }}
            tableProps={{
              hover: true,
            }}
            scopedColumns={{
              tenPhuongXa_DayDu: (item) => {
                return <td className="py-2">{item.tenPhuongXa + ', ' + item.huyen.tenhuyen}</td>
              },
              thoiGianTao: (item) => {
                return (
                  <td className="py-2">{format(new Date(item.thoiGianTao), 'hh:mm dd/MM/yyyy')}</td>
                )
              },
            }}
          />
        </CModalBody>
      </CModal>
    </>
  )
}

PhuongXaModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default PhuongXaModal
