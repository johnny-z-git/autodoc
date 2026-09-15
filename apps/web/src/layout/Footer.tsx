import { NavLink } from 'react-router-dom'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <div className="site-footer__brand">
          <p className="site-footer__logo">AutoDoc</p>
          <p className="site-footer__tag">
            Приезжаем к вам<span className="divider">/</span>забираем авто
            <span className="divider">/</span>оставляем временную
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Подвал">
          <NavLink to="/services">Услуги</NavLink>
          <NavLink to="/about">О нас</NavLink>
          <NavLink to="/contacts">Контакты</NavLink>
          <NavLink to="/cabinet">Кабинет</NavLink>
        </nav>

        <div className="site-footer__contacts">
          <a href="tel:+79991234567">+7 999 123-45-67</a>
          <a href="mailto:hello@autodoc.local">hello@autodoc.local</a>
          <span>Москва и область</span>
        </div>
      </div>
      <div className="site-footer__copy container">
        © {year} AutoDoc. Выездной автосервис.
      </div>
    </footer>
  )
}
