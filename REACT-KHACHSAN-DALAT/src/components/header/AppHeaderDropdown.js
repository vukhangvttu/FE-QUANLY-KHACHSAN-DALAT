import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/avata.png'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import config from 'src/service/Config'
import DoiMatKhau from 'src/view/modal/DoiMatKhau'

const AppHeaderDropdown = () => {
  const { t } = useTranslation()

  let navigate = useNavigate()
  const onchageLogout = () => {
    const data = {
      token: localStorage.getItem('token'),
    }
    axios
      .post(`${config.apiBaseUrl}/auth/logout`, data)
      .then((response) => {
        console.log(response.data)
        if (response.data.code === 1000) localStorage.removeItem('token')
        navigate('/login', { replace: true })
      })
      .catch((error) => {
        console.log('Error: ', error)
      })
  }

  const [visible, setVisible] = React.useState(false)

  return (
    <>
      <CDropdown variant="nav-item" alignment="end">
        <CDropdownToggle className="py-0" caret={false}>
          <CAvatar src={avatar8} size="md" />
        </CDropdownToggle>
        <CDropdownMenu className="pt-0">
          <CDropdownItem onClick={() => setVisible(true)} style={{ cursor: 'pointer' }}>
            <CIcon icon={cilLockLocked} className="me-2" />
            {t('Change password')}
          </CDropdownItem>
          <CDropdownItem onClick={onchageLogout} style={{ cursor: 'pointer' }}>
            <CIcon icon={cilAccountLogout} className="me-2" />
            {t('logout')}
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <DoiMatKhau visible={visible} onClose={() => setVisible(false)} />
    </>
  )
}

export default AppHeaderDropdown
