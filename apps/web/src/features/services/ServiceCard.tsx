import type { Service } from '../../api/types'
import './ServiceCard.css'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const price = new Intl.NumberFormat('ru-RU').format(service.basePriceFrom)

  return (
    <article className="service-card lift-card">
      {service.imageUrl ? (
        <div className="service-card__media">
          <img src={service.imageUrl} alt="" loading="lazy" />
        </div>
      ) : (
        <div className="service-card__media service-card__media--empty" />
      )}
      <div className="service-card__body">
        <h2>{service.title}</h2>
        <p>{service.description}</p>
        <div className="service-card__meta">
          <span>от {price} сом</span>
          <span className="divider">/</span>
          <span>{service.durationHint}</span>
        </div>
      </div>
    </article>
  )
}
