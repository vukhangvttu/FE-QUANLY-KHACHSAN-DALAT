import React from 'react'
import {
  CContainer,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CNavItem,
  CNavLink,
  CHeader,
  CHeaderBrand,
  CHeaderToggler,
  CHeaderNav,
  CHeaderText,
  CButton,
} from '@coreui/react-pro'
import {
  faHotel,
  faBed,
  faMoneyBill,
  faUsers,
  faChartLine,
  faCog,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

const AdminLayout = ({ children }) => {
  const navigate = useNavigate()
  const [sidebarShow, setSidebarShow] = React.useState(true)

  const handleLogout = () => {
    // Xử lý đăng xuất
    navigate('/login')
  }

  return (
    <div className="wrapper d-flex">
      <CSidebar className="border-end" colorScheme="light" size="lg" visible={sidebarShow}>
        <CSidebarBrand className="d-none d-md-flex">
          <h4 className="mb-0">Quản lý khách sạn</h4>
        </CSidebarBrand>
        <CSidebarNav>
          <CNavItem>
            <CNavLink href="/admin/dashboard">
              <FontAwesomeIcon icon={faChartLine} className="me-2" />
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/admin/rooms">
              <FontAwesomeIcon icon={faBed} className="me-2" />
              Quản lý phòng
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/admin/room-types">
              <FontAwesomeIcon icon={faHotel} className="me-2" />
              Loại phòng
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/admin/room-prices">
              <FontAwesomeIcon icon={faMoneyBill} className="me-2" />
              Giá phòng
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/admin/staff">
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Nhân viên
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="/admin/settings">
              <FontAwesomeIcon icon={faCog} className="me-2" />
              Cài đặt
            </CNavLink>
          </CNavItem>
        </CSidebarNav>
      </CSidebar>

      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <CHeader className="border-bottom px-4">
          <CHeaderToggler className="ps-1" onClick={() => setSidebarShow(!sidebarShow)}>
            <span className="navbar-toggler-icon"></span>
          </CHeaderToggler>
          <CHeaderBrand className="mx-auto d-md-none">
            <h4 className="mb-0">Quản lý khách sạn</h4>
          </CHeaderBrand>
          <CHeaderNav className="d-none d-md-flex me-auto">
            <CHeaderText className="px-3">Chào mừng đến với hệ thống quản lý</CHeaderText>
          </CHeaderNav>
          <CHeaderNav>
            <CButton color="link" className="px-3" onClick={handleLogout}>
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
              Đăng xuất
            </CButton>
          </CHeaderNav>
        </CHeader>

        <div className="body flex-grow-1 px-3">
          <CContainer fluid>{children}</CContainer>
        </div>
      </div>
    </div>
  )
}

AdminLayout.propTypes = {
  children: PropTypes.object.isRequired,
}

export default AdminLayout
