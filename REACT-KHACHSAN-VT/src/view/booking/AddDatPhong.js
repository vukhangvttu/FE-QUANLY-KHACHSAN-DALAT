import React, { useEffect, useRef, useState } from 'react'

import {
  CFormInput,
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react-pro'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCirclePlus,
  faUserPen,
  faXmark,
  faBaby,
  faPersonWalkingLuggage,
  faPen,
} from '@fortawesome/free-solid-svg-icons'
import { CDatePicker } from '@coreui/react-pro'
import { format, parse } from 'date-fns'
import { vi } from 'date-fns/locale'
import DichVuModal from '../dichvu/DichVuModal'
import ChonPhongModal from '../modal/ChonPhongModal'

const AddDatPhong = () => {
  const [visibleDichVu, setvisibleDichVu] = useState(false)

  const [visibleAddPhong, setvisibleAddPhong] = useState(false)

  const customVars = {
    '--cui-calendar-nav-date-color': '#333',
    '--cui-calendar-cell-hover-bg': '#f8f9fa',
  }

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 gap-2 mb-3">
        {/* Khách hàng */}
        <div className="flex items-center space-x-2 border-r border-gray-300 pr-6">
          <div className="flex flex-col flex-1">
            <span className="text-gray-500">Khách hàng</span>
            <div className="flex items-center border-b border-gray-300">
              <input
                type="text"
                placeholder="Nhập mã, Tên, SDT khách hàng"
                className="bg-transparent outline-none text-blue-500 font-semibold"
                value="Vũ Khang"
              />
              <FontAwesomeIcon icon={faXmark} className="text-gray-500 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Khách lưu trú */}
        <div className="flex flex-col items-start space-y-1  border-r border-gray-300 pr-6">
          <span className="text-gray-500">Khách lưu trú</span>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUserPen} className="text-gray-500" />
            <span>1</span>
            <span className="text-gray-400">•</span>
            <FontAwesomeIcon icon={faBaby} className="text-gray-500" />
            <span>0</span>
          </div>
        </div>

        {/* Kênh bán */}
        <div className="flex items-center space-x-2 border-r border-gray-300 pr-6">
          <div className="flex flex-col flex-1">
            <span className="text-gray-500">Kênh bán</span>
            <div className="flex items-center border-b border-gray-300">
              <FontAwesomeIcon icon={faPersonWalkingLuggage} className="text-gray-500 mr-2" />
              <select id="cars" name="cars" className="bg-transparent outline-none font-semibold">
                <option value="volvo">Khách hàng trực tiếp</option>
                <option value="saab">Đặt phòng online</option>
                <option value="fiat">Facebook</option>
                <option value="audi">Zalo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bảng giá */}
        <div className="flex items-center space-x-1 cursor-pointer text-gray-700 border-r border-gray-300 pr-6">
          <div className="flex flex-col flex-1">
            <span className="text-gray-500">Bảng giá</span>
            <div className="flex items-center border-b border-gray-300">
              <FontAwesomeIcon icon={faPersonWalkingLuggage} className="text-gray-500 mr-2" />
              <select id="cars" name="cars" className="bg-transparent outline-none font-semibold">
                <option value="volvo">Bảng giá chung</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="flex items-center space-x-2">
          <div className="flex flex-col flex-1">
            <span className="text-gray-500">Ghi chú</span>
            <div className="flex items-center ">
              <input
                type="text"
                placeholder="Chưa có ghi chú"
                className="bg-transparent outline-none text-blue-500 "
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full mx-auto bg-gray-100 gap-2">
        {/* Left Panel */}
        <div className="w-1/3 bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Sản phẩm/Dịch vụ</span>
            <span className="text-sm text-green-600 border-b border-green-600 pb-0.5">
              Danh sách (1)
            </span>
          </div>

          {/* Collapsible Section */}
          <div className="flex flex-col h-full min-h-[300px]">
            {/* Nội dung chính */}
            <div className="flex-1">
              <div className="mt-4 ">
                <div className="flex items-center mb-2 cursor-pointer">
                  <i className="fas fa-chevron-down fa-rotate-180 text-gray-600 text-xs"></i>
                  <span className="text-sm font-medium ml-2">
                    Phòng 01 giường đôi và 1 giường đơn cho 3 người (1)
                  </span>
                </div>

                {/* Room Details */}
                <div className=" shadow-xl bg-white rounded-xl  border border-gray-200 px-3 py-1 mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">P.301</span>
                    <span className="font-medium">250,000</span>
                  </div>
                  <div className="text-xs text-gray-600">18 Thg 02, 07:51 - 18 Thg 02, 08:51</div>
                </div>
              </div>
            </div>

            {/* Luôn nằm ở bottom */}
            <div className="mt-auto">
              <div className="flex items-center mb-4">
                <div
                  className="font-semibold cursor-pointer "
                  onClick={() => setvisibleAddPhong(true)}
                >
                  <FontAwesomeIcon icon={faCirclePlus} className="text-blue-500 mr-2" />
                  <span className="text-sm text-blue-500 hover:text-blue-300">Phòng mới</span>
                </div>
                <div className="ml-auto flex items-center">
                  <span className="text-sm font-medium text-green-500">Tổng cộng: 250,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-2/3">
          {/* Header with room title and more options */}

          {/* Form Area */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-2">
            <h2 className="text-lg font-medium mb-1">
              P.301 - Phòng 01 giường đôi và 1 giường đơn cho 3 người
            </h2>
            <div className="text-sm text-gray-500 pb-2 border-b">
              <FontAwesomeIcon icon={faPen} className="mr-2" />
              Nhập ghi chú ...
            </div>

            {/* Reservation Details */}
            <div className="flex items-center justify-between  py-3">
              <CTable borderless>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Hình thức</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Phòng</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nhận phòng</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Trả phòng</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Lưu trú</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableHeaderCell scope="row">
                      <CTableDataCell className="align-middle">
                        <CFormSelect
                          aria-label="Default select example"
                          options={[
                            { label: 'Giờ', value: '1' },
                            { label: 'Ngày', value: '2' },
                            { label: 'Tháng', value: '3', disabled: true },
                          ]}
                        />
                      </CTableDataCell>
                    </CTableHeaderCell>
                    <CTableDataCell>
                      <CTableDataCell className="align-middle">
                        <CFormSelect
                          aria-label="Default select example"
                          options={[
                            { label: 'P.301', value: '1' },
                            { label: 'Ngày', value: '2' },
                            { label: 'Tháng', value: '3', disabled: true },
                          ]}
                        />
                      </CTableDataCell>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CDatePicker
                        locale="en-GB"
                        timepicker
                        container="body"
                        inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                        inputDateFormat={(date) =>
                          format(new Date(date), "dd 'Thg' M',' HH:mm", { locale: vi }).replace(
                            'Thg Thg',
                            'Thg',
                          )
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CDatePicker
                        locale="en-GB"
                        timepicker
                        container="body"
                        inputDateParse={(date) => parse(date, 'dd/MM/yyyy', new Date())}
                        inputDateFormat={(date) =>
                          format(new Date(date), "dd 'Thg' M',' HH:mm", { locale: vi }).replace(
                            'Thg Thg',
                            'Thg',
                          )
                        }
                      />
                    </CTableDataCell>
                    <CTableDataCell className="w-24">
                      <CFormInput
                        type="text"
                        value={'1 giờ'}
                        aria-label="Disabled input example"
                        className="text-center"
                        disabled
                      />
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>

            {/* Time & Room Selection */}
          </div>

          {/* Order Summary Table */}
          <div className="bg-white rounded-lg shadow-sm mb-2 min-h-min">
            <table className="w-full text-sm mb-10">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">STT</th>
                  <th className="py-3 px-4 text-left font-medium">Hạng mục</th>
                  <th className="py-3 px-4 text-right font-medium">Số lượng</th>
                  <th className="py-3 px-4 text-right font-medium">Đơn giá</th>
                  <th className="py-3 px-4 text-right font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">1</td>
                  <td className="py-3 px-4">
                    Phòng 01 giường đôi và 1 giường đơn cho 3 người (Giờ)
                  </td>
                  <td className="py-3 px-4 text-right">1</td>
                  <td className="py-3 px-4 text-right">250,000</td>
                  <td className="py-3 px-4 text-right">250,000</td>
                </tr>
              </tbody>
            </table>

            <div className="flex items-center  py-4 text-lg font-medium  p-4">
              <div
                className="cursor-pointer  flex items-center"
                onClick={() => setvisibleDichVu(true)}
              >
                <FontAwesomeIcon icon={faCirclePlus} className="text-blue-500 mr-2" />
                <span className="text-sm text-blue-500 hover:text-blue-300 ">
                  Sản phẩm, dịch vụ
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm  text-green-600">Tổng tiền</span>
                <span className="text-sm font-medium text-green-600">250,000</span>
              </div>
            </div>
          </div>

          {/* Total and Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-2">
            <div className="flex justify-end gap-2 mt-4">
              <button className="border rounded-lg px-4 py-2 text-sm flex items-center">
                <span>In</span>
              </button>
              <button className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm">
                Nhận phòng
              </button>
              <button className="bg-orange-500 text-white rounded-lg px-4 py-2 text-sm">
                Đặt trước
              </button>
              <button className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm">
                Thanh toán (F9)
              </button>
            </div>
          </div>
        </div>
      </div>

      <DichVuModal visible={visibleDichVu} onClose={() => setvisibleDichVu(true)} />

      <ChonPhongModal visible={visibleAddPhong} onClose={() => setvisibleAddPhong(true)} />
    </>
  )
}

export default AddDatPhong
