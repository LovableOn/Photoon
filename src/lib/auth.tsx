import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface User {
  name: string
  email: string
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
      if (raw) setUser(JSON.parse(raw) as User)
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
        const session: User = { name: found.name, email: found.email }
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
        const newUser: StoredUser = { name, email, password }
        writeUsers([...users, newUser])
        const session: User = { name, email }
        writeKey(SESSION_KEY, JSON.stringify(session))
        setUser(session)
      },
      logout() {
        removeKey(SESSION_KEY)
        setUser(null)
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
