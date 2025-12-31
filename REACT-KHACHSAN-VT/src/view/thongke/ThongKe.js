import React, { useState } from 'react'
import { CTabPanel, CTabContent, CTabs, CTabList, CTab } from '@coreui/react-pro'

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

  return (
    <div>
      <CTabs activeItemKey={activeTab} onActiveTabChange={(key) => setActiveTab(key)}>
        <CTabList variant="underline-border">
          <CTab aria-controls="profile-tab-pane" itemKey={1} onClick={() => setActiveTab(1)}>
            Thống kê doanh thu
          </CTab>
          <CTab aria-controls="profile-tab-pane" itemKey={2} onClick={() => setActiveTab(2)}>
            Thông tin lưu trú
          </CTab>
        </CTabList>
        <CTabContent>
          <CTabPanel aria-labelledby="profile-tab-pane" itemKey={1}>
            <ThongKeDoanhThu />
          </CTabPanel>
          <CTabPanel className="p-3" aria-labelledby="home-tab-pane" itemKey={2}>
            <KhachTruTru isActive={activeTab === 2} />
          </CTabPanel>
        </CTabContent>
      </CTabs>
    </div>
  )
}

export default ThongKe
