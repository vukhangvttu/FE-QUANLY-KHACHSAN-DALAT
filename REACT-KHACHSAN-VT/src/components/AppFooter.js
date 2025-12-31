import React from 'react'
import { CFooter } from '@coreui/react-pro'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://vttu.edu.vn/" target="_blank" rel="noopener noreferrer">
          VTTU
        </a>
        <span className="ms-1">&copy; 2025</span>
      </div>
      {/* <div className="ms-auto">
        <span className="me-1">Powered by</span>
        Nguyễn Minh Toàn
      </div> */}
    </CFooter>
  )
}

export default React.memo(AppFooter)
