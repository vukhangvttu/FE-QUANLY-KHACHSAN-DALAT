import React, { useEffect, useRef, useState } from 'react'
import { getStyle } from '@coreui/utils'
import { CChart } from '@coreui/react-chartjs'
import { useNavigate } from 'react-router-dom'
import { CToast, CToastBody, CToaster, CToastHeader } from '@coreui/react-pro'
import { getThongKeKhachLuuTruTheoQuy } from 'src/service/ThongKeService'

export const ThongKeKhachLuuTru = () => {
  const chartRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const [processedData, setProcessedData] = useState({ labels: [], datasets: [] })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [khachLuuTru] = await Promise.all([getThongKeKhachLuuTruTheoQuy(navigate)])

      if (khachLuuTru) {
        processChartData(khachLuuTru)
      } else {
        addToast(exampleToast('❌ Không thể tải thống kê. Vui lòng thử lại sau!'))
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
      addToast(exampleToast('❌ Lỗi khi tải dữ liệu. Vui lòng thử lại sau!'))
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (data) => {
    // Tạo danh sách tất cả các quốc gia duy nhất
    const allCountries = [...new Set(data.map((item) => item.ten_quoc_gia))]

    // Tạo danh sách các quý duy nhất
    const allQuarters = [...new Set(data.map((item) => item.quy))].sort()

    // Mảng màu sắc cố định cho các quý
    const colors = [
      {
        backgroundColor: 'rgba(220, 220, 220, 0.2)',
        borderColor: 'rgba(220, 220, 220, 1)',
        pointBackgroundColor: 'rgba(220, 220, 220, 1)',
      },
      {
        backgroundColor: 'rgba(151, 187, 205, 0.2)',
        borderColor: 'rgba(151, 187, 205, 1)',
        pointBackgroundColor: 'rgba(151, 187, 205, 1)',
      },
      {
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      },
      {
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
      },
    ]

    // Tạo mảng dữ liệu cho mỗi quý
    const datasets = allQuarters.map((quarter, index) => {
      const quarterData = allCountries.map((country) => {
        const record = data.find((item) => item.ten_quoc_gia === country && item.quy === quarter)
        return record ? record.so_luong_hien_tai : 0
      })

      return {
        label: quarter,
        ...colors[index % colors.length],
        pointBorderColor: '#fff',
        data: quarterData,
        fill: true,
      }
    })

    setProcessedData({
      labels: allCountries,
      datasets: datasets,
    })
  }

  useEffect(() => {
    fetchData()
    const handleColorSchemeChange = () => {
      const chartInstance = chartRef.current
      if (chartInstance) {
        const { options } = chartInstance

        if (options.plugins?.legend?.labels) {
          options.plugins.legend.labels.color = getStyle('--cui-body-color')
        }

        if (options.scales?.x) {
          if (options.scales.x.grid) {
            options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          }
          if (options.scales.x.ticks) {
            options.scales.x.ticks.color = getStyle('--cui-body-color')
          }
        }

        if (options.scales?.y) {
          if (options.scales.y.grid) {
            options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          }
          if (options.scales.y.ticks) {
            options.scales.y.ticks.color = getStyle('--cui-body-color')
          }
        }

        chartInstance.update()
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)

    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [])

  const options = {
    plugins: {
      legend: {
        labels: {
          color: getStyle('--cui-body-color'),
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: getStyle('--cui-border-color-translucent'),
        },
        ticks: {
          color: getStyle('--cui-body-color'),
        },
        type: 'category',
      },
      y: {
        grid: {
          color: getStyle('--cui-border-color-translucent'),
        },
        ticks: {
          color: getStyle('--cui-body-color'),
        },
        beginAtZero: true,
      },
    },
  }

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

      <CChart type="line" data={processedData} options={options} ref={chartRef} />
    </>
  )
}
