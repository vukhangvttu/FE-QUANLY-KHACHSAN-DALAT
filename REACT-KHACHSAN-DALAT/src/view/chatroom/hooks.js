import React from 'react'
import { CToast, CToastHeader, CToastBody } from '@coreui/react-pro'
import { useState, useCallback, useEffect, useRef } from 'react'
import { getAllPhong, getPhongTrongTheoKhoanThoiGian } from 'src/service/PhongService'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

export const useRooms = (navigate) => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const isMounted = useRef(true)
  const hasInitialFetch = useRef(false)

  // Kiểm tra token trước khi fetch
  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('Không tìm thấy token, chuyển hướng về trang login')
      navigate('/login', { replace: true })
      return false
    }
    return true
  }, [navigate])

  const fetchRooms = useCallback(async () => {
    // Kiểm tra token trước khi fetch
    if (!checkToken()) {
      return null
    }

    try {
      setLoading(true)
      const data = await getAllPhong(navigate)
      if (data && isMounted.current) {
        setRooms(data)
      }
      return data
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng:', error)
      return null
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [navigate, checkToken])

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Chỉ fetch một lần khi component mount
  useEffect(() => {
    if (!hasInitialFetch.current) {
      hasInitialFetch.current = true
      fetchRooms()
    }
  }, [fetchRooms])

  return { rooms, loading, fetchRooms, setRooms }
}

export const useDuBaoRooms = (ngaybd, ngaykt, navigate) => {
  const [duBaoRooms, setDuBaoRooms] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDuBaoRooms = useCallback(async () => {
    try {
      setLoading(true)
      const ngayDen = format(new Date(ngaybd), 'yyyy-MM-dd')
      const ngayDi = format(new Date(ngaykt), 'yyyy-MM-dd')
      console.log('Fetching with dates:', { ngayDen, ngayDi })
      const data = await getPhongTrongTheoKhoanThoiGian(ngayDen, ngayDi, navigate)
      if (data) {
        setDuBaoRooms(data)
      }
      return data
    } catch (error) {
      console.error('Error fetching dự báo rooms:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [ngaybd, ngaykt, navigate])

  return { duBaoRooms, loading, fetchDuBaoRooms, setDuBaoRooms }
}

export const usePopover = () => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return { isOpen, setIsOpen, ref }
}

export const useToast = () => {
  const [toast, addToast] = useState(0)
  const toaster = useRef()

  const showToast = (message) => (
    <>
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
    </>
  )

  return { toast, addToast, toaster, showToast }
}
