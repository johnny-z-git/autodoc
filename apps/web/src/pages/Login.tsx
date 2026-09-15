import { Link } from 'react-router-dom'
import { TelegramLogin } from '../features/auth/TelegramLogin'
import './Login.css'

export function LoginPage() {
  return (
    <section className="auth-page section">
      <div className="container auth-page__grid">
        <TelegramLogin mode="login" />
        <aside className="auth-page__aside">
          <p className="eyebrow">Уже с нами</p>
          <p>
            Нет аккаунта?
            <span className="divider">/</span>
            <Link to="/register">зарегистрируйтесь</Link>
          </p>
        </aside>
      </div>
    </section>
  )
}
