import React from 'react'
import { Navigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import RoomTypes from './pages/RoomTypes'
import RoomPrices from './pages/RoomPrices'

const routes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/admin/dashboard" />,
      },
      {
        path: 'dashboard',
        element: <div>Dashboard</div>,
      },
      {
        path: 'room-types',
        element: <RoomTypes />,
      },
      {
        path: 'room-prices',
        element: <RoomPrices />,
      },
      {
        path: 'rooms',
        element: <div>Quản lý phòng</div>,
      },
      {
        path: 'staff',
        element: <div>Quản lý nhân viên</div>,
      },
      {
        path: 'settings',
        element: <div>Cài đặt</div>,
      },
    ],
  },
]

export default routes
