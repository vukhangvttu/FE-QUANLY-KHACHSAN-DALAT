import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CFormInput, CFormTextarea, CModalFooter, CPopover, CTimePicker } from '@coreui/react-pro'
import { CButton, CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarAlt,
  faClock,
  faUser,
  faBed,
  faInfoCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import { CDatePicker } from '@coreui/react-pro'
import { format, parse } from 'date-fns'
import { vi } from 'date-fns/locale'

const getTomorrowAtNoon = (date) => {
  const newDate = new Date(date)
  newDate.setDate(newDate.getDate() + 1) // Cộng thêm 1 ngày
  newDate.setHours(12, 0, 0, 0) // Đặt giờ thành 12:00:00
  return newDate
}

const ChonPhongModal = ({ visible, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState('theo-ngay')

  const date = new Date()
  const [valueTGNhan, setValueTGNhan] = useState(new Date())

  // set mặc định ngày tiếp theo
  const [valueTGTra, setValueTGTra] = useState(getTomorrowAtNoon(date))

  // chọn loại phòng add vào đặt phòng nhanh

  const danhSachPhong = [
    { loaiPhong: 1, tenPhong: 'Phòng 01 giường đơn', gia: 600000, trong: 5 },
    { loaiPhong: 2, tenPhong: 'Phòng 01 giường đôi cho 2 người', gia: 800000, trong: 10 },
    { loaiPhong: 3, tenPhong: 'Phòng 02 giường đơn', gia: 750000, trong: 15 },
    {
      loaiPhong: 4,
      tenPhong: 'Phòng 01 giường đôi và 1 giường đơn cho 3 người',
      gia: 1000000,
      trong: 6,
    },
  ]

  const handleClickAddLoaiPhong = (loaiPhong, tenloai, gia, trong) => {
    console.log('hiển thị ', loaiPhong, tenloai, gia, trong)
    const newDate = {
      ngaynhan: format(new Date(valueTGNhan), 'yyyy-MM-dd'),
      gionhan: timeGioNhan,
      ngaytra: format(new Date(valueTGTra), 'yyyy-MM-dd'),
      giotra: timeGioRa,
      songay: valueSoNgay,
      maloaiphong: loaiPhong,
      tenloaiphong: tenloai,
      gia: gia,
      dangtrong: trong,
    }

    onSubmit(newDate)
  }

  const handleDateChange = (date) => {
    console.log('Ngày được chọn:', date)
    setValueTGNhan(date)
    setValueTGTra(getTomorrowAtNoon(date))
  }

  const handleDateChangeNgayRa = (date) => {
    setValueTGTra(date)
    setValueSoNgay(calculateDays(valueTGNhan, date))
  }

  const calculateDays = (checkin, checkout) => {
    if (!checkin || !checkout) return 0 // Nếu chưa chọn đủ 2 ngày thì trả về 0

    const timeDiff = checkout.getTime() - checkin.getTime() // Lấy chênh lệch thời gian (ms)
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) // Chuyển đổi ms → ngày
  }

  const [valueSoNgay, setValueSoNgay] = useState(1)

  const [timeGioNhan, setTimeGioNhan] = useState('14:00')
  const [timeGioRa, setTimeGioRa] = useState('12:00')

  return (
    <>
      <CModal
        size="lg"
        alignment="center"
        visible={visible}
        onClose={onClose}
        scrollable
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalBody>
          <div className=" mx-auto ">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">Chọn phòng</h2>
              <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-3">
              {/* <button
                className={`px-3 py-1 text-sm ${
                  activeTab === 'theo-gio' ? 'bg-green-600 text-white rounded-lg' : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('theo-gio')}
              >
                Theo giờ
              </button> */}
              <button
                className={`px-3 py-1 text-sm ${
                  activeTab === 'theo-ngay' ? 'bg-green-600 text-white rounded-lg' : 'text-gray-400'
                }`}
                onClick={() => setActiveTab('theo-ngay')}
              >
                Theo ngày
              </button>
            </div>

            {/* Date and Time Selection */}
            <div className="flex gap-2 mb-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nhận phòng</label>
                <div className="relative flex items-center">
                  <div>
                    <CDatePicker
                      locale="en-GB"
                      size="sm"
                      className="w-32"
                      date={valueTGNhan}
                      onDateChange={handleDateChange}
                      inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                      inputDateFormat={(date) =>
                        format(new Date(date), "dd 'Thg' M'", { locale: vi }).replace(
                          'Thg Thg',
                          'Thg',
                        )
                      }
                    />
                  </div>
                  <div>
                    <CTimePicker
                      size="sm"
                      className="w-20"
                      locale="en-GB"
                      seconds={false}
                      minutes={[0, 30]}
                      time={timeGioNhan}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trả phòng</label>
                <div className="relative flex items-center">
                  <div>
                    <CDatePicker
                      locale="en-GB"
                      size="sm"
                      className="w-32"
                      date={valueTGTra}
                      onDateChange={handleDateChangeNgayRa}
                      inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                      inputDateFormat={(date) =>
                        format(new Date(date), "dd 'Thg' M'", { locale: vi }).replace(
                          'Thg Thg',
                          'Thg',
                        )
                      }
                    />
                  </div>
                  <div>
                    <CTimePicker
                      size="sm"
                      className="w-20"
                      locale="en-GB"
                      seconds={false}
                      minutes={[0, 30]}
                      time={timeGioRa}
                    />
                  </div>
                </div>
              </div>

              <div className="ml-2 ">
                <label className="block text-sm text-gray-600 mb-1">Số ngày</label>
                <div className="flex justify-between">
                  {/* <CFormInput
                    size="sm"
                    type="text"
                    value="1 phòng • 1 người lớn • 0 trẻ em"
                    className="flex-1 border rounded-md w-60 text-center h-[11px]"
                    readOnly
                  /> */}
                  <button className="px-3 py-1 bg-green-100 text-green-600 rounded-md text-sm">
                    {valueSoNgay} ngày
                  </button>
                </div>
              </div>
              <div>
                <CButton color="success" className="text-white mt-4 py-1 text-sm ml-2">
                  Kiểm tra
                </CButton>
              </div>
            </div>

            {/* Room Selection Section 1 */}
            <div>
              <div className="bg-green-100 rounded-lg p-2 flex justify-between items-center mb-2">
                <div className="text-sm font-medium">Gợi ý các loại phòng</div>
                <div className="grid grid-cols-3 gap-20">
                  <div className="text-sm font-medium text-center">Giá</div>
                  <div className="text-sm font-medium text-center">SL trống</div>
                  <div className="text-sm font-medium text-center">Tổng cộng</div>
                </div>
              </div>

              {/* Room Item 1 */}

              <div>
                {danhSachPhong.map((phong, index) => (
                  <PhongItem
                    key={index}
                    loaiPhong={phong.loaiPhong}
                    tenPhong={phong.tenPhong}
                    gia={phong.gia}
                    trong={phong.trong}
                    onDatPhong={handleClickAddLoaiPhong}
                  />
                ))}
              </div>
            </div>
          </div>
        </CModalBody>
      </CModal>
    </>
  )
}

ChonPhongModal.propTypes = {
  visible: PropTypes.bool.isRequired, // visible là boolean, bắt buộc
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired, // onClose là hàm, bắt buộc
}
export default ChonPhongModal

const PhongItem = ({ loaiPhong, tenPhong, gia, trong, onDatPhong }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Dữ liệu mẫu
  const priceData = [
    { date: new Date(new Date()), price: 600000 }, // Thứ bảy, 22 Thg 02
    { date: new Date(2025, 1, 22), price: 800000 }, // Chủ nhật, 23 Thg 02
  ]

  return (
    <div className="p-2 flex justify-between items-center rounded-lg border mb-1 hover:!border-green-500">
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-medium">{tenPhong}</span>
          {/* <FontAwesomeIcon icon={faInfoCircle} className="ml-1 text-gray-400" /> */}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <FontAwesomeIcon icon={faUser} className="mr-1" />
          <span>1</span>
          <FontAwesomeIcon icon={faBed} className="ml-3 mr-1" />
          <span>1</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-end">
          <span className="font-semibold">{gia.toLocaleString()}</span>

          <div onClick={(e) => e.stopPropagation()}>
            <CPopover
              trigger="focus"
              content={
                <div className="p-2 text-left">
                  {priceData.map((item, index) => (
                    <div key={index} className="mb-1 flex gap-2 justify-between">
                      <div>{format(item.date, "EEEE, dd 'Thg' MM", { locale: vi })}</div>
                      <strong className="text-gray-600 ">{item.price.toLocaleString()} VND</strong>
                    </div>
                  ))}
                </div>
              }
              placement="top"
              visible={isPopoverOpen} // Kiểm soát hiển thị
              onHide={() => setIsPopoverOpen(false)} // Đóng popover\
              container={null}
            >
              <div
                className=" cursor-pointer"
                onClick={(e) => {
                  setIsPopoverOpen((prev) => !prev) // Toggle hiển thị
                }}
              >
                <button>
                  <FontAwesomeIcon icon={faInfoCircle} className="ml-1 text-gray-400" />
                </button>
              </div>
            </CPopover>
          </div>
        </div>
        <div className=" items-center flex justify-center">{trong}</div>
        <div className="flex items-end flex-col">
          {/* <div className="font-semibold mb-2">{(gia * trong).toLocaleString()}</div> */}
          <CButton
            color="success"
            size="sm"
            className="px-4 text-white"
            onClick={() => onDatPhong(loaiPhong, tenPhong, gia, trong)}
          >
            Đặt phòng
          </CButton>
        </div>
      </div>
    </div>
  )
}
PhongItem.propTypes = {
  loaiPhong: PropTypes.bool.isRequired,
  tenPhong: PropTypes.string.isRequired,
  gia: PropTypes.number.isRequired, // onClose là hàm, bắt buộc
  trong: PropTypes.number.isRequired,
  onDatPhong: PropTypes.func.isRequired,
}
