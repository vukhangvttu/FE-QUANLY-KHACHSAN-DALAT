import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CRow,
  CSmartTable,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react-pro'
import { getAllBooKing } from 'src/service/BooKingService'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical, faPlus, faPrint } from '@fortawesome/free-solid-svg-icons'
// import XepPhongModal from '../modal/XepPhongModal'
import ReportRegistration from '../ThanhToan/ReportRegistration'
import XuatExcelXacNhanPhong from '../modal/XuatExcelXacNhanPhong'
import XuatExcelHoaDon from '../modal/XuatExcelHoaDon'
import { ROOM_ACTIONS } from '../chatroom/constants'
import { Popover } from 'flowbite-react'

const getBadge = (status) => {
  switch (status) {
    case 'Active': {
      return 'success'
    }
    case 'Inactive': {
      return 'secondary'
    }
    case 'Pending': {
      return 'warning'
    }
    case 'Banned': {
      return 'danger'
    }
    default: {
      return 'primary'
    }
  }
}

const getStatusColor = (maTrangThai) => {
  switch (maTrangThai) {
    case 1: // Đã xác nhận
      return 'success'
    case 2: // Chờ xác nhận
      return 'warning'
    case 3: // Hủy booking
      return 'danger'
    case 4: // Đã thanh toán
      return 'info'
    default:
      return 'primary'
  }
}

const DanhSachDatPhong = () => {
  const columns = [
    {
      key: 'ma_booking',
      label: 'BK-ID',
      _style: { color: 'blue' },
    },
    {
      key: 'ten_khachhang',
      label: 'Tên khách',
      _style: { width: '20%', color: 'blue' },
    },
    {
      key: 'ten_nhom_khach_hang',
      label: 'Công ty',
      _style: { color: 'blue' },
    },

    {
      key: 'ngay_den',
      label: 'Ngày đến',
      _style: { color: 'blue' },
    },
    {
      key: 'ngay_di',
      label: 'Ngày đi',
      _style: { color: 'blue' },
    },
    {
      key: 'so_luong',
      label: 'Số lượng',
      _style: { color: 'blue' },
    },

    {
      key: 'trangThaiBooKing',
      label: 'Trạng thái',
      _style: { color: 'blue' },
    },
    {
      key: 'tongtien',
      label: 'Tổng tiền',
      _style: { color: 'blue' },
    },
    {
      key: 'ma_nhan_vien',
      label: 'Nhân viên',
      _style: { color: 'blue' },
    },
    {
      key: 'show_details',
      label: '',
      _style: { width: '7%' },
      filter: false,
      sorter: false,
    },
    // {
    //   key: 'registered',
    //   sorter: (item1, item2) => {
    //     const a = new Date(item1.registered)
    //     const b = new Date(item2.registered)
    //     return a > b ? 1 : b > a ? -1 : 0
    //   },
    // },

    // 'status',
  ]

  const [booKing, setBooKing] = useState([])
  const [loading, setLoading] = useState(false)
  const DanhSach = async () => {
    try {
      setLoading(true)
      const danhsach = await getAllBooKing()
      console.log(danhsach)
      setBooKing(danhsach)
    } catch (error) {
      console.log('Lỗi getAllBooKing:', error)
    } finally {
      setLoading(false)
    }
  }

  // const [visibleXepPhong, setvisibleXepPhong] = useState(false)

  // const handleDataFromModal = (data) => {
  //   console.log(data)

  //   setvisibleXepPhong(false)
  // }

  const [maBooKing, setMaBooKing] = useState('')

  const [showReport, setShowReport] = useState(false)
  const [selectedBookingForPrint, setSelectedBookingForPrint] = useState(null)

  const handlePrint = (booking) => {
    setSelectedBookingForPrint(booking)
    setShowReport(true)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const getReportData = () => {
    if (!selectedBookingForPrint) return null

    return {
      bookingId: selectedBookingForPrint.ma_booking,
      guestName: selectedBookingForPrint.ten_khachhang,
      phone: selectedBookingForPrint?.khachHangBooKing?.sdtBooking || '',
      company: selectedBookingForPrint?.ten_nhom_khach_hang || '',
      email: selectedBookingForPrint?.khachHangBooKing?.email || '',
      arrivalDate: selectedBookingForPrint?.ngay_den
        ? format(new Date(selectedBookingForPrint.ngay_den), 'dd/MM/yyyy')
        : '',
      departureDate: selectedBookingForPrint?.ngay_di
        ? format(new Date(selectedBookingForPrint.ngay_di), 'dd/MM/yyyy')
        : '',
      rooms: [
        {
          roomType: selectedBookingForPrint?.loaiPhong?.tenLoaiPhong || '',
          quantity: 1,
          nights:
            Math.ceil(
              (new Date(selectedBookingForPrint.ngay_di) -
                new Date(selectedBookingForPrint.ngay_den)) /
                (1000 * 60 * 60 * 24),
            ) || 1,
          ratePerNight: selectedBookingForPrint.tong_tien || 0,
          total: selectedBookingForPrint.tong_tien || 0,
          note: '',
        },
      ],
      totalAmount: selectedBookingForPrint.tong_tien || 0,
      deposit: (selectedBookingForPrint.tien_coc || 0).toLocaleString('en-US') + ' ₫',
      payment: (selectedBookingForPrint.tong_tien || 0).toLocaleString('en-US') + ' ₫',
    }
  }

  const [visibleXautExcelXacNhanPhong, setVisibleXuatExcelXacNhanPhong] = useState(false)
  const handleXuatExcelXacNhanPhong = (ma_booking) => {
    setVisibleXuatExcelXacNhanPhong(true)
    setMaBooKing(ma_booking)
  }

  const [visibleXautExcelHoaDon, setVisibleXuatExcelHoaDon] = useState(false)

  useEffect(() => {
    DanhSach()
  }, [])

  return (
    <CRow className="px-2">
      <CCard>
        <CCardBody>
          <div className="d-grid gap-2 d-md-flex justify-content-md-between mb-2">
            <div className=" font-bold">Tổng danh sách: {booKing?.length}</div>
            <Link to="/dashboard/pos/danh-sach-booking/add-booking">
              <CButton color="success" className="px-4 text-white py-1">
                <FontAwesomeIcon icon={faPlus} /> Tạo booking
              </CButton>
            </Link>
          </div>

          <CSmartTable
            activePage={1}
            clickableRows
            columns={columns}
            loading={loading}
            columnFilter
            columnSorter
            items={booKing}
            itemsPerPageSelect
            itemsPerPage={20}
            pagination
            scopedColumns={{
              ngay_den: (item) => (
                <td>{item?.ngay_den ? format(new Date(item.ngay_den), 'dd/MM/yyyy') : 'N/A'}</td>
              ),
              ngay_di: (item) => (
                <td>{item?.ngay_di ? format(new Date(item.ngay_di), 'dd/MM/yyyy') : 'N/A'}</td>
              ),
              trangThaiBooKing: (item) => (
                <td>
                  <CBadge
                    color={getStatusColor(item.trang_thai)}
                    style={{
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {item.so_phong_da_thanh_toan !== 0 &&
                    item.so_phong_da_thanh_toan !== item.tong_so_phong
                      ? 'Thanh toán ' + item.trang_thai_thanh_toan
                      : item.ten_trang_thai}
                  </CBadge>
                </td>
              ),
              tongtien: (item) => <td>{(item?.tong_tien).toLocaleString('en-US')}</td>,
              status: (item) => (
                <td>
                  <CBadge color={getBadge(item.status)}>{item.status}</CBadge>
                </td>
              ),
              show_details: (item) => {
                // if (item.trang_thai === 4) {
                //   return <td></td>
                // }
                return (
                  <td>
                    <div>
                      <Popover
                        content={
                          <div className="w-64 ">
                            {item.trang_thai === 4 ? (
                              <>
                                <Link
                                  to={`/dashboard/pos/danh-sach-booking/xem-thanh-toan/${item.ma_booking}`}
                                  className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                >
                                  Xem thanh toán
                                </Link>
                                {/* {item.so_phong_da_thanh_toan !== item.tong_so_phong && (
        <Link
          to={`/dashboard/pos/danh-sach-booking/all-thanh-toan/${item.ma_booking}`}
          className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
          onClick={() => setOpenPopoverId(null)}
        >
          Thanh toán còn lại
        </Link>
      )} */}
                                {/* <div
        className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
        onClick={() => handleXuatExcelHoaDon(item.ma_booking)}
      >
        Xuất excel hóa đơn
      </div> */}
                                <Link
                                  to={`/dashboard/pos/danh-sach-booking/xuat-phieu-thanh-toan/${item.ma_booking}`}
                                  className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                >
                                  In phiếu thanh toán
                                </Link>
                              </>
                            ) : item.trang_thai !== 3 ? (
                              <div className="text-left cursor-pointer text-black">
                                {item.da_xep_phong ? (
                                  <>
                                    {item.ma_nhom_khach_hang === 'NKH2024040302' ||
                                    item.ma_nhom_khach_hang === 'NKH2024040301' ? (
                                      <Link
                                        to={`/dashboard/pos/danh-sach-booking/xuat-thong-tin-phieu-dang-ky-ota-ta/${item.ma_booking}`}
                                      >
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-blue-500">
                                          In phiếu ĐK OTA_TA
                                        </button>
                                      </Link>
                                    ) : (
                                      <Link
                                        to={`/dashboard/pos/danh-sach-booking/xuat-thong-tin-phieu-dang-ky/${item.ma_booking}`}
                                      >
                                        <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-blue-500">
                                          {/* <FontAwesomeIcon icon={faPrint} className="mr-2" /> */}
                                          In phiếu đăng ký
                                        </button>
                                      </Link>
                                    )}

                                    <Link
                                      to={`/dashboard/pos/danh-sach-booking/xuat-chi-tiet-dat-phong/${item.ma_booking}`}
                                    >
                                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-blue-500">
                                        {ROOM_ACTIONS.PRINT_REGISTRATION_FROM_CHI_TIET_DAT_PHONG}
                                      </button>
                                    </Link>

                                    <Link
                                      to={`/dashboard/pos/danh-sach-booking/edit-booking/${item.ma_booking}`}
                                      className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                    >
                                      Update booking
                                    </Link>
                                    <div
                                      className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                      onClick={() => handleXuatExcelXacNhanPhong(item.ma_booking)}
                                    >
                                      Xuất excel chi tiết đặt phòng
                                    </div>
                                    {/* <Link
            to={`/dashboard/pos/danh-sach-booking/pdf-chi-tiet-dat-phong/${item.ma_booking}`}
            className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
            onClick={() => setOpenPopoverId(null)}
          >
            PDF đặt phòng
          </Link> */}
                                    <Link
                                      to={`/dashboard/pos/danh-sach-booking/edit-xep-phong/${item.ma_booking}`}
                                      className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                    >
                                      Update xếp phòng
                                    </Link>

                                    <Link
                                      to={`/dashboard/pos/danh-sach-booking/all-thanh-toan/${item.ma_booking}`}
                                      className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                    >
                                      Thanh toán tất cả
                                    </Link>
                                  </>
                                ) : (
                                  <>
                                    <Link
                                      to={`/dashboard/pos/danh-sach-booking/edit-booking/${item.ma_booking}`}
                                      className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                    >
                                      Update booking
                                    </Link>
                                    <Link
                                      to={`/dashboard/pos/danh-sach-booking/add-xep-phong/${item.ma_booking}`}
                                      className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                                    >
                                      Xếp phòng
                                    </Link>
                                  </>
                                )}
                              </div>
                            ) : (
                              <Link
                                to={`/dashboard/pos/danh-sach-booking/edit-booking/${item.ma_booking}`}
                                className="block px-4 py-2 hover:bg-gray-100 hover:text-blue-500"
                              >
                                Update booking
                              </Link>
                            )}
                          </div>
                        }
                        arrow={true}
                        placement="right"
                      >
                        <button className="p-2 rounded-lg hover:bg-blue-200 text-current flex items-center justify-center  focus:outline-none">
                          <FontAwesomeIcon icon={faEllipsisVertical} className="text-xl" />
                        </button>
                      </Popover>
                    </div>
                  </td>
                )
              },
            }}
            tableProps={{
              className: 'add-this-custom-class',
              responsive: true,
              striped: true,
              hover: true,
            }}
            tableBodyProps={{
              className: 'align-middle',
            }}
          />
        </CCardBody>
      </CCard>

      <XuatExcelXacNhanPhong
        visible={visibleXautExcelXacNhanPhong}
        onClose={() => setVisibleXuatExcelXacNhanPhong(false)}
        ma_booking={maBooKing}
      />

      <XuatExcelHoaDon
        visible={visibleXautExcelHoaDon}
        onClose={() => setVisibleXuatExcelHoaDon(false)}
        ma_booking={maBooKing}
      />

      <CModal visible={showReport} onClose={() => setShowReport(false)} size="xl" fullscreen>
        <CModalHeader>
          <CModalTitle>Phiếu đăng ký khách sạn</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ReportRegistration data={getReportData()} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowReport(false)}>
            Đóng
          </CButton>
          <CButton color="primary" onClick={() => handlePrint(selectedBookingForPrint)}>
            <FontAwesomeIcon icon={faPrint} className="me-2" />
            In
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default DanhSachDatPhong
