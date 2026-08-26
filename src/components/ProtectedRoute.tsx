import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from './ui'
import { useAuth, type Role } from '../lib/auth'

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  /** Papéis que podem abrir a rota. Sem isso, basta estar autenticado. */
  roles?: Role[]
}) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Quem não tem o papel volta para o início em vez de ver uma tela de erro:
  // o link simplesmente não existe para esse nível de acesso.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
