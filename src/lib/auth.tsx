import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { SEED_STORE_NAME, makeAvatar } from './seedGallery'

/**
 * Níveis de acesso.
 *
 * - `admin`: administra a plataforma inteira.
 * - `lojista`: o estúdio ou loja que vende o álbum. É quem cadastra as fotos,
 *   os elementos e os clientes.
 * - `cliente`: quem monta o álbum com as fotos liberadas pela loja.
 *
 * O app hoje entrega as telas do cliente; o papel já existe no modelo para
 * que as áreas de admin e lojista entrem sem migração de dados.
 */
export type Role = 'admin' | 'lojista' | 'cliente'

export interface User {
  name: string
  email: string
  role: Role
  /** Retrato do cliente, cadastrado pela loja junto com o acesso. */
  avatar: string | null
  /** Loja responsável pelo acesso deste cliente. */
  store: string | null
}

interface StoredUser extends User {
  password: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (email: string, password: string) => Promise<void>
  updateProfile: (patch: Partial<Pick<User, 'name' | 'avatar'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USERS_KEY = 'photoon:users'
const SESSION_KEY = 'photoon:session'

function delay(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as StoredUser[]) : []
  } catch {
    return []
  }
}

/**
 * Alguns contextos bloqueiam o localStorage (janela anônima, iframe de
 * terceiro). Aí a sessão só não sobrevive a um recarregamento — o app segue
 * funcionando em vez de quebrar.
 */
function writeKey(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // armazenamento indisponível, a sessão vale só para esta aba
  }
}

function removeKey(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // idem
  }
}

function writeUsers(users: StoredUser[]) {
  writeKey(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<User> & { name: string; email: string }
        setUser({
          name: saved.name,
          email: saved.email,
          role: saved.role ?? 'cliente',
          avatar: saved.avatar ?? null,
          store: saved.store ?? SEED_STORE_NAME,
        })
      }
    } catch {
      // sessão inválida, ignora
    }
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(email, password) {
        await delay()
        const users = readUsers()
        const found = users.find(
          (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
        )
        if (!found || found.password !== password) {
          throw new Error('E-mail ou senha incorretos.')
        }
        const session: User = {
          name: found.name,
          email: found.email,
          role: found.role ?? 'cliente',
          avatar: found.avatar ?? null,
          store: found.store ?? SEED_STORE_NAME,
        }
        writeKey(SESSION_KEY, JSON.stringify(session))
        setUser(session)
      },
      async register(name, email, password) {
        await delay()
        const users = readUsers()
        if (
          users.some(
            (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
          )
        ) {
          throw new Error('Já existe uma conta com este e-mail.')
        }
        // O retrato viria do cadastro feito pela loja; aqui ele é gerado para
        // o acesso já nascer com a cara do cliente.
        const avatar = await makeAvatar(name)
        const newUser: StoredUser = {
          name,
          email,
          password,
          role: 'cliente',
          avatar,
          store: SEED_STORE_NAME,
        }
        writeUsers([...users, newUser])
        const session: User = { name, email, role: 'cliente', avatar, store: SEED_STORE_NAME }
        writeKey(SESSION_KEY, JSON.stringify(session))
        setUser(session)
      },
      logout() {
        removeKey(SESSION_KEY)
        setUser(null)
      },
      updateProfile(patch) {
        if (!user) return
        const next: User = { ...user, ...patch }
        const users = readUsers()
        const index = users.findIndex(
          (candidate) => candidate.email.toLowerCase() === user.email.toLowerCase(),
        )
        if (index !== -1) {
          users[index] = { ...users[index], ...patch }
          writeUsers(users)
        }
        writeKey(SESSION_KEY, JSON.stringify(next))
        setUser(next)
      },
      async requestPasswordReset(_email) {
        await delay()
        // Simulado: em produção isto dispararia um e-mail com token.
      },
      async resetPassword(email, password) {
        await delay()
        const users = readUsers()
        const index = users.findIndex(
          (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
        )
        if (index === -1) {
          throw new Error('Não encontramos uma conta com este e-mail.')
        }
        users[index] = { ...users[index], password }
        writeUsers(users)
      },
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
