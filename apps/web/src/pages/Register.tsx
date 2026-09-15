import { Link } from 'react-router-dom'
import { TelegramLogin } from '../features/auth/TelegramLogin'
import './Register.css'

export function RegisterPage() {
  return (
    <section className="auth-page section">
      <div className="container auth-page__grid">
        <TelegramLogin mode="register" />
        <aside className="auth-page__aside">
          <p className="eyebrow">Новый клиент</p>
          <p>
            Уже есть аккаунт?
            <span className="divider">/</span>
            <Link to="/login">войдите</Link>
          </p>
        </aside>
      </div>
    </section>
  )
}
