import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Service } from '../api/types'
import { ServiceCard } from '../features/services/ServiceCard'
import './Services.css'

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.services.list()
        if (!cancelled) setServices(data)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Не удалось загрузить услуги')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="services-page section">
      <div className="container">
        <p className="eyebrow">Каталог / API</p>
        <h1 className="services-page__title">Услуги AutoDoc</h1>
        <p className="lead services-page__lead">
          Данные приходят с сервера <code>GET /api/services</code>. Цены — ориентир «от».
        </p>

        {loading ? <p className="services-page__state">Загружаем…</p> : null}
        {error ? (
          <p className="services-page__error">
            {error}
            <span className="divider">/</span>
            убедитесь, что API на порту 3001 запущен
          </p>
        ) : null}

        {!loading && !error ? (
          <div className="services-page__grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
            {services.length === 0 ? (
              <p className="services-page__state">Пока нет услуг в каталоге.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
