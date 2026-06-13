import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LockedAccessPage } from '@/components/common/LockedAccessPage'
import { ToastContainer } from '@/components/common/Toast'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { toast } from '@/lib/toast'
import { NotFoundPage } from '@/pages/NotFound'
import { logout, verifyToken } from '@/store/slices/authSlice'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)
  const publicRoutes = ['/', '/login', '/signup', '/terms', '/privacy']
  const isPublicSurvey = location.pathname.startsWith('/survey/')
  const isPublicRoute = publicRoutes.includes(location.pathname) || isPublicSurvey

  useEffect(() => {
    const handleSessionExpired = () => {
      dispatch(logout())
      toast.warning('Your session has expired', {
        description: 'Please sign in again to continue.',
      })
      navigate({ to: '/login', replace: true })
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [dispatch, navigate])

  // Verify token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      dispatch(verifyToken())
    }
  }, [dispatch])

  // Keep invalid tokens on the auth path, but let ordinary protected clicks show the locked page.
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!isLoading && !isAuthenticated && token && !isPublicRoute) {
      navigate({ to: '/login', replace: true })
    }
  }, [isAuthenticated, isLoading, isPublicRoute, navigate])

  if (!isLoading && !isAuthenticated && !isPublicRoute) {
    return (
      <>
        <LockedAccessPage />
        <ToastContainer />
      </>
    )
  }

  return (
    <>
      <Outlet />
      <ToastContainer />
    </>
  )
}
