// region imports
import { createRootRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LockedAccessPage } from '@/components/common/LockedAccessPage'
import { ToastContainer } from '@/components/common/Toast'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { toast } from '@/lib/toast'
import { NotFoundPage } from '@/pages/NotFound'
import { logout, verifyToken } from '@/store/slices/authSlice'
// endregion

// region route definition
// Root route — wraps every page with auth guards and the global toast container.
// notFoundComponent renders for any path that has no matching file-based route.
export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})
// endregion

// region helpers
// Routes that do not require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/terms', '/privacy']
// endregion

// region component
function RootLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  // treat /survey/* and known public paths as unauthenticated-accessible
  const isPublicSurvey = location.pathname.startsWith('/survey/')
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname) || isPublicSurvey

  // region session expiry listener
  useEffect(() => {
    const handleSessionExpired = () => {
      // clear auth state and redirect to login with a warning
      dispatch(logout())
      toast.warning('Your session has expired', {
        description: 'Please sign in again to continue.',
      })
      navigate({ to: '/login', replace: true })
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired)
  }, [dispatch, navigate])
  // endregion

  // region token verification on mount
  useEffect(() => {
    // always attempt verification on mount — browser sends the httpOnly
    // cookie automatically if one exists, no localStorage check needed
    dispatch(verifyToken())
  }, [dispatch])
  // endregion

  // region redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      navigate({ to: '/login', replace: true })
    }
  }, [isAuthenticated, isLoading, isPublicRoute, navigate])
  // endregion

  // show locked page while token verification is in-flight for protected routes
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
// endregion
