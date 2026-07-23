import React, { useState } from 'react'
import { CTabPanel, CTabContent, CTabs, CTabList, CTab } from '@coreui/react-pro'
import { usePermissions } from '../../hooks/usePermissions'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import ThongKeDoanhThu from './ThongKeDoanhThu'
import KhachTruTru from './KhachTruTru'
import ThongKeTiLeFullPhong from './ThongKeTiLeFullPhong'
import ThongKeDoanhSoKPINhanVien from './ThongKeDoanhSoKPINhanVien'


// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
)

const ThongKe = () => {
  const [activeTab, setActiveTab] = useState(1)
  const { checkPermission } = usePermissions()

  return (
    <div>
      <CTabs activeItemKey={activeTab} onActiveTabChange={(key) => setActiveTab(key)}>
        <CTabList variant="underline-border">
          {checkPermission('THONGKEDOANHTHU') && (
            <CTab aria-controls="profile-tab-pane" itemKey={1} onClick={() => setActiveTab(1)}>
              Thống kê doanh thu
            </CTab>
          )}
          <CTab aria-controls="profile-tab-pane" itemKey={2} onClick={() => setActiveTab(2)}>
            Thông tin lưu trú
          </CTab>
          {checkPermission('THONGKETILEFULLPHONG') && (
            <CTab aria-controls="profile-tab-pane" itemKey={3} onClick={() => setActiveTab(3)}>
              Thống kê tỉ lệ FULL phòng
            </CTab>
          )}
          
          {checkPermission('THONGKEDOANHSOKPINHANVIEN') && (
            <CTab aria-controls="profile-tab-pane" itemKey={4} onClick={() => setActiveTab(4)}>
              Thống kê doanh số nhân viên
            </CTab>
          )}
        </CTabList>
        <CTabContent>
          {checkPermission('THONGKEDOANHTHU') && (
            <CTabPanel aria-labelledby="profile-tab-pane" itemKey={1}>
              <ThongKeDoanhThu />
            </CTabPanel>
          )}
          <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={2}>
            <KhachTruTru isActive={activeTab === 2} />
          </CTabPanel>
          {checkPermission('THONGKETILEFULLPHONG') && (
            <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={3}>
              <ThongKeTiLeFullPhong isActive={activeTab === 3} />
            </CTabPanel>
          )}
          {checkPermission('THONGKEDOANHSOKPINHANVIEN') && (
            <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={4}>
              <ThongKeDoanhSoKPINhanVien isActive={activeTab === 4} />
            </CTabPanel>
          )}
        </CTabContent>
      </CTabs>
    </div>
  )
}

export default ThongKe
