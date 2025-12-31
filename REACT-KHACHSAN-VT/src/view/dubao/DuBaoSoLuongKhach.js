import { CCol, CDatePicker, CFormLabel, CRow, CSpinner } from '@coreui/react-pro'

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getThongKeKhachHangTheoNgay } from 'src/service/ThongKeService'
import { format } from 'date-fns'

const DuBaoSoLuongKhach = ({ isActive }) => {
  const [customerData, setCustomerData] = useState([])
  const [loading, setLoading] = useState(false)

  // Generate dates for the week
  const generateDates = (checkin, checkout) => {
    if (!checkin || !checkout) return []

    const formatDate = (date) => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const start = new Date(checkin)
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())

    const end = new Date(checkout)
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())

    const days = []
    const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      days.push({
        date: formatDate(currentDate),
        day: currentDate.getDate(),
        name: dayNames[currentDate.getDay()],
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const [days, setDays] = useState([])

  const getTomorrowAtNoon = (date) => {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + 6)
    newDate.setHours(12, 0, 0, 0)
    return newDate
  }

  const date = new Date()
  const [valueNgayBD, setValueNgayBD] = useState(new Date())
  const [valueNgayKT, setValueNgayKT] = useState(getTomorrowAtNoon(date))

  const handleDateChangeNgayDen = (date) => {
    setValueNgayBD(date)
    setValueNgayKT(getTomorrowAtNoon(date))
    if (isActive) {
      setDays(generateDates(date, getTomorrowAtNoon(date)))
      fetchCustomerData()
    }
  }

  const handleDateChangeNgayDi = (date) => {
    setValueNgayKT(date)
    if (isActive) {
      setDays(generateDates(valueNgayBD, date))
      fetchCustomerData()
    }
  }

  useEffect(() => {
    if (isActive) {
      setDays(generateDates(valueNgayBD, valueNgayKT))
      fetchCustomerData()
    }
  }, [isActive])

  const navigate = useNavigate()

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      const ngayDen = format(valueNgayBD, 'yyyy-MM-dd')
      const ngayDi = format(valueNgayKT, 'yyyy-MM-dd')

      const response = await getThongKeKhachHangTheoNgay(ngayDen, ngayDi, navigate)

      if (response) {
        setCustomerData(response)
      }
    } catch (error) {
      console.error('Error fetching customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Lấy thông tin khách cho một ngày cụ thể
  const getCustomerInfo = (date) => {
    return (
      customerData.find((item) => item.ngay === date) || {
        so_khach_di: 0,
        so_khach_den: 0,
        so_khach_dang_o: 0,
      }
    )
  }

  return (
    <CRow className="bg-white shadow border-2 border-blue-500 rounded-md p-3">
      <div className=" mb-4">
        <CRow>
          <CCol sm={12} md={3}>
            <CRow>
              <CFormLabel htmlFor="inputPassword" className="col-sm-4 col-form-label labelcustome">
                Ngày đến
              </CFormLabel>
              <CCol sm={6}>
                <CDatePicker
                  locale="en-GB"
                  date={valueNgayBD}
                  onDateChange={handleDateChangeNgayDen}
                  minDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                />
              </CCol>
            </CRow>
          </CCol>
          <CCol sm={12} md={3}>
            <CRow>
              <CFormLabel htmlFor="inputPassword" className="col-sm-4 col-form-label labelcustome">
                Ngày đi
              </CFormLabel>
              <CCol sm={6}>
                <CDatePicker
                  locale="en-GB"
                  date={valueNgayKT}
                  onDateChange={handleDateChangeNgayDi}
                />
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CSpinner size="xl" aria-hidden="true" />
          <span role="status">Loading...</span>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-[200px] border-r text-center py-2 sticky left-0 bg-gray-50 z-10">
                    <div className="font-bold">Thông tin</div>
                  </th>
                  {days.map((day) => (
                    <th key={day.date} className="w-[100px] border-r text-center py-2">
                      <div className="font-bold">{day.day}</div>
                      <div className="text-blue-600 text-sm">{day.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50 text-xl">
                  <td className="px-2 py-3 border-r sticky text-pink-500 left-0 bg-white z-10">
                    <div className="font-medium">Khách chuẩn bị đến</div>
                  </td>
                  {days.map((day) => {
                    const info = getCustomerInfo(day.date)
                    return (
                      <td key={`den-${day.date}`} className="border-r p-2 text-center">
                        <span className="text-pink-500 font-bold ">{info.so_khach_den}</span>
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b hover:bg-gray-50  text-xl">
                  <td className="px-2 py-3 border-r sticky text-green-600 left-0 bg-white z-10">
                    <div className="font-medium">Khách đang lưu trú</div>
                  </td>
                  {days.map((day) => {
                    const info = getCustomerInfo(day.date)
                    return (
                      <td key={`o-${day.date}`} className="border-r p-2 text-center">
                        <span className="text-green-600 font-bold">{info.so_khach_dang_o}</span>
                      </td>
                    )
                  })}
                </tr>

                <tr className="border-b hover:bg-gray-50  text-xl">
                  <td className="px-2 py-3 border-r sticky text-yellow-500 left-0 bg-white z-10">
                    <div className="font-medium">Khách chuẩn bị đi</div>
                  </td>
                  {days.map((day) => {
                    const info = getCustomerInfo(day.date)
                    return (
                      <td key={`di-${day.date}`} className="border-r p-2 text-center">
                        <span className="text-yellow-500 font-bold">{info.so_khach_di}</span>
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CRow>
  )
}

DuBaoSoLuongKhach.propTypes = {
  isActive: PropTypes.bool.isRequired,
}

export default DuBaoSoLuongKhach
