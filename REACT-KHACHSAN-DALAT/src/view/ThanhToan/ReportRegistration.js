import React from 'react'
import PropTypes from 'prop-types'

import './ReportRegistration.css'

const ReportRegistration = ({ data }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 border-4 border-red-700 rounded-none">
      <div className="border-2 border-red-700 p-4 rounded-none">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-600 w-12 h-12 flex items-center justify-center text-white font-bold rounded-full">
              <span className="text-xs">HK</span>
            </div>
            <div>
              <h1 className="text-yellow-600 font-bold text-xl">GOLDEN ERA CO., LTD.</h1>
              <p className="text-xs">Address: No. 03-05 Thuy Van Street, Ward 2, Vung Tau City.</p>
              <p className="text-xs">Phone number: (0254) 3412 555</p>
            </div>
          </div>
          <div className="border border-yellow-600 p-2 w-48 h-10">
            <p className="text-yellow-600 font-semibold">BK-ID:</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">ĐĂNG KÝ KHÁCH SẠN</h2>
          <p className="font-semibold">REGISTRATION FORM</p>
        </div>

        {/* Guest Information */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <p>Tên khách/Guest Name:</p>
            <div className="border-b border-dashed border-gray-400 flex-1 mx-2"></div>
            <p>Điện thoại/Tel:</p>
            <div className="border-b border-dashed border-gray-400 flex-1"></div>
          </div>
          <div className="flex gap-2 mb-2">
            <p>Tên đơn vị/Company:</p>
            <div className="border-b border-dashed border-gray-400 flex-1 mx-2"></div>
            <p>Email:</p>
            <div className="border-b border-dashed border-gray-400 flex-1"></div>
          </div>
          <div className="flex gap-2 mb-2">
            <p>Ngày đến/Arrival date:</p>
            <div className="border-b border-dashed border-gray-400 flex-1 mx-2"></div>
            <p>Ngày đi/Departure date:</p>
            <div className="border-b border-dashed border-gray-400 flex-1"></div>
          </div>
        </div>

        {/* Room Information Table */}
        <div className="mb-4">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-800 p-2 font-semibold text-sm">
                  <p>Hạng phòng</p>
                  <p className="font-normal text-xs">No of Room</p>
                </th>
                <th className="border border-gray-800 p-2 font-semibold text-sm">
                  <p>SL</p>
                  <p className="font-normal text-xs">Qty</p>
                </th>
                <th className="border border-gray-800 p-2 font-semibold text-sm">
                  <p>Số đêm</p>
                  <p className="font-normal text-xs">Night</p>
                </th>
                <th className="border border-gray-800 p-2 font-semibold text-sm">
                  <p>Giá/đêm</p>
                  <p className="font-normal text-xs">Rate Per Night</p>
                </th>
                <th className="border border-gray-800 p-2 font-semibold text-sm">
                  <p>Tổng</p>
                  <p className="font-normal text-xs">Total</p>
                </th>
                <th className="border border-gray-800 p-2 font-semibold text-sm">
                  <p>Tên phòng</p>
                  <p className="font-normal text-xs">Note</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((row) => (
                <tr key={row}>
                  <td className="border border-gray-800 p-2 h-8"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                  <td className="border border-gray-800 p-2"></td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="border border-gray-800 p-2 font-semibold">
                  Tổng cộng/ Total all items
                </td>
                <td className="border border-gray-800 p-2"></td>
                <td className="border border-gray-800 p-2"></td>
                <td className="border border-gray-800 p-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border-b border-dashed border-gray-400 w-full mb-4"></div>

        {/* Bottom Section */}
        <div className="flex">
          {/* Left side */}
          <div className="w-1/2">
            <div className="flex gap-2 mb-2">
              <p>Đặt cọc (Deposit):</p>
              <div className="border-b border-dashed border-gray-400 flex-1"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <p>Thanh toán (Payment):</p>
              <div className="border-b border-dashed border-gray-400 flex-1"></div>
            </div>

            <div className="mt-4">
              <p className="font-semibold">Reception</p>
              <p className="text-sm">Folios: ........................</p>
              <p className="text-sm">Check in: .....................</p>
              <p className="text-sm">Check out: ...................</p>
            </div>
          </div>

          {/* Right side - Rules */}
          <div className="w-1/2">
            <div className="border border-dashed border-gray-600 p-2">
              <div className="text-center mb-2">
                <h3 className="text-red-600 font-bold">QUY ĐỊNH KHÁCH SẠN</h3>
                <p className="text-red-600 text-sm">Hotel regulations</p>
              </div>

              <p className="text-center font-semibold mb-2">
                Trong Phòng, WC, Hành lang, Sảnh của Khách sạn, Quý khách vui lòng:
              </p>

              <div className="flex justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-red-600 font-semibold text-sm">Không mang</p>
                  <p className="text-red-600 font-semibold text-sm">Sầu riêng</p>
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12 mt-2">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-8 h-8 bg-yellow-400 rounded-sm transform rotate-45"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-1 bg-red-600 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-1">No Durian</p>
                </div>

                <div className="text-center">
                  <p className="text-red-600 font-semibold text-sm">Không</p>
                  <p className="text-red-600 font-semibold text-sm">Hút thuốc</p>
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12 mt-2">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-8 h-1 bg-gray-600 transform rotate-45"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-1 bg-red-600 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-1">No Smoking</p>
                </div>

                <div className="text-center">
                  <p className="text-red-600 font-semibold text-sm">Không mang</p>
                  <p className="text-red-600 font-semibold text-sm">Hải sản</p>
                  <div className="flex justify-center">
                    <div className="relative w-12 h-12 mt-2">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-8 h-5 bg-red-200 rounded-sm"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-1 bg-red-600 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-1">No Seafood</p>
                </div>
              </div>

              <div className="text-center">
                <p>Nếu vi phạm Quý khách vui lòng:</p>
                <p className="font-semibold">Thanh toán phí xử lý mùi:</p>
                <p className="text-red-600 font-bold text-xl">1.000.000 đ/ trường hợp</p>
                <p className="text-xs italic">(Handling fee for case is 1.000.000 vnd)</p>
                <p className="mt-2">Xin cảm ơn Quý khách/Thank you!</p>
              </div>
            </div>

            <div className="mt-4 text-right">
              <p className="font-semibold">Khách hàng/Guest</p>
              <p>Guests Signature & Full name</p>
              <p className="italic text-sm">(Tôi đã đọc và hiểu rõ)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

ReportRegistration.propTypes = {
  data: PropTypes.shape({
    bookingId: PropTypes.string,
    guestName: PropTypes.string,
    phone: PropTypes.string,
    company: PropTypes.string,
    email: PropTypes.string,
    arrivalDate: PropTypes.string,
    departureDate: PropTypes.string,
    rooms: PropTypes.arrayOf(
      PropTypes.shape({
        roomType: PropTypes.string,
        quantity: PropTypes.number,
        nights: PropTypes.number,
        ratePerNight: PropTypes.number,
        total: PropTypes.number,
        note: PropTypes.string,
      }),
    ),
    totalAmount: PropTypes.number,
    deposit: PropTypes.string,
    payment: PropTypes.string,
  }),
}

ReportRegistration.defaultProps = {
  data: {
    bookingId: '',
    guestName: '',
    phone: '',
    company: '',
    email: '',
    arrivalDate: '',
    departureDate: '',
    rooms: [],
    totalAmount: 0,
    deposit: '',
    payment: '',
  },
}

export default ReportRegistration
