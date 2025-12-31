import { useNavigate } from 'react-router-dom'

let navigateRef = null

export const useAuthRedirect = () => {
  const navigate = useNavigate()
  navigateRef = navigate
  return navigate
}

export const redirectToLogin = () => {
  if (navigateRef) {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    navigateRef('/login', { replace: true })
  }
}
