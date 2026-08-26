import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { StoreProvider } from './lib/store'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Spinner } from './components/ui'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { Albums } from './pages/Albums'
import { NewAlbum } from './pages/NewAlbum'
import { AlbumDetail } from './pages/AlbumDetail'
import { Editor } from './pages/Editor'
import { Photos } from './pages/Photos'
import { Elements } from './pages/Elements'
import { Account } from './pages/Account'
import { Help } from './pages/Help'
import { NotFound } from './pages/NotFound'

/** A raiz manda o visitante para o app ou para o login, conforme a sessão. */
function RootRedirect() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-canvas text-primary">
        <Spinner className="size-7" />
      </div>
    )
  }

  return <Navigate to={user ? '/app' : '/login'} replace />
}

/**
 * Em hospedagens de página única, sem reescrita de rotas no servidor, o
 * roteamento por hash é o que sobrevive a um recarregamento em `/app/fotos`.
 * Definido em tempo de build por `VITE_ROUTER=hash`.
 */
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

function App() {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/albuns"
              element={
                <ProtectedRoute>
                  <Albums />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/albuns/novo"
              element={
                <ProtectedRoute>
                  <NewAlbum />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/albuns/:projectId"
              element={
                <ProtectedRoute>
                  <AlbumDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/albuns/:projectId/editor"
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/fotos"
              element={
                <ProtectedRoute>
                  <Photos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/elementos"
              element={
                <ProtectedRoute>
                  <Elements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/conta"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/ajuda"
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
