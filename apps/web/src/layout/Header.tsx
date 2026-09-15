import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../ui/Button'
import './Header.css'

const links = [
  { to: '/', label: 'Главная', end: true },
  { to: '/services', label: 'Услуги' },
  { to: '/about', label: 'О нас' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/cabinet', label: 'Кабинет' },
]

function displayName(user: { firstName: string | null; username: string | null }) {
  if (user.firstName) return user.firstName
  if (user.username) return `@${user.username}`
  return 'Профиль'
}

export function Header() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <NavLink to="/" className="site-header__brand" end>
          AutoDoc
        </NavLink>

        <nav className="site-header__nav" aria-label="Основное меню">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }: { isActive: boolean }) =>
                `site-header__link${isActive ? ' is-active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          {loading ? (
            <span className="site-header__muted">…</span>
          ) : user ? (
            <>
              <NavLink to="/cabinet" className="site-header__user">
                {displayName(user)}
              </NavLink>
              <Button variant="ghost" onClick={() => void onLogout()}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="site-header__link">
                Войти
              </NavLink>
              <Button variant="primary" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
