import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useParallax } from '../hooks/useParallax'
import { useScrollTheme } from '../hooks/useScrollTheme'
import { Button } from '../ui/Button'
import './Home.css'

const steps = [
  {
    title: 'Заявка',
    text: 'Укажите адрес, авто и когда удобно. Нужна временная — отметьте в форме.',
  },
  {
    title: 'Подача',
    text: 'Курьер приезжает, оставляет подменную машину и забирает вашу в сервис.',
  },
  {
    title: 'Ремонт',
    text: 'Чиним у себя. Статус заявки виден в кабинете на каждом этапе.',
  },
  {
    title: 'Возврат',
    text: 'Привозим авто обратно и забираем временную. Без поездок в бокс.',
  },
]

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null)
  useParallax(heroRef)
  useScrollTheme(true)

  return (
    <div className="home">
      <section className="hero" ref={heroRef} data-theme="dark">
        <div className="hero__media" data-parallax="0.45" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=80"
            alt=""
          />
        </div>
        <div className="hero__glow" data-parallax="0.28" aria-hidden="true" />
        <div className="hero__content container">
          <p className="eyebrow hero__eyebrow" data-parallax="0.08">
            Выездной автосервис
          </p>
          <h1 className="hero__title">
            <span className="hero__caps" data-parallax="0.12">
              AUTODOC
            </span>
          </h1>
          <div className="hero__side" data-parallax="0.06">
            <p className="hero__lead">
              Приезжаем к вам, оставляем временную машину и забираем вашу в ремонт.
              Возвращаем уже готовую.
            </p>
            <div className="hero__cta">
              <Link to="/cabinet/requests/new">
                <Button variant="primary">Оставить заявку</Button>
              </Link>
              <Link to="/services">
                <Button variant="ghost">Смотреть услуги</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-pitch section" data-theme="light">
        <div className="container home-pitch__grid">
          <h2 className="home-pitch__title sticky-heading">
            Сервис едет к вам
            <span className="divider">/</span>
            не вы к сервису
          </h2>
          <div className="home-pitch__copy">
            <p>
              AutoDoc — для тех, кто не хочет оставлять день на эвакуатор и очередь.
              Мы забираем авто по адресу, чиним и привозим обратно.
            </p>
            <p>
              Временная машина — по желанию. Статусы заявки и контакты мастера —
              в личном кабинете.
            </p>
          </div>
        </div>
      </section>

      <section className="home-steps section" data-theme="dark">
        <div className="container">
          <p className="eyebrow">Как это работает</p>
          <h2 className="home-steps__title">Четыре шага без лишней суеты</h2>
          <div className="home-steps__grid">
            {steps.map((step, i) => (
              <article key={step.title} className="lift-card">
                <span className="lift-card__index">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta section" data-theme="light">
        <div className="container home-cta__inner">
          <h2>Готовы сдать авто без визита в бокс?</h2>
          <p className="lead">
            Заполните заявку — согласуем слот и подачу временной машины.
          </p>
          <Link to="/cabinet/requests/new">
            <Button variant="primary">Создать заявку</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
