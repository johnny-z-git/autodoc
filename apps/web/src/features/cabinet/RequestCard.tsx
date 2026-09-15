import type { RepairRequest, User } from '../../api/types'
import { Button } from '../../ui/Button'
import { formatSlot, STATUS_LABELS } from './status'
import './RequestCard.css'

interface RequestCardProps {
  request: RepairRequest
  user: User
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export function RequestCard({
  request,
  user,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: RequestCardProps) {
  const canDelete = request.status !== 'CANCELLED' && request.status !== 'DELIVERED'
  const canEdit =
    request.status === 'NEW' || user.role === 'STAFF'

  return (
    <article
      className={`request-card${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect()
      }}
      role="button"
      tabIndex={0}
    >
      <div className="request-card__top">
        <h3>
          {request.brand} {request.model}
          <span className="divider">/</span>
          {request.year}
        </h3>
        <span className={`request-card__status status-${request.status.toLowerCase()}`}>
          {STATUS_LABELS[request.status]}
        </span>
      </div>
      <p className="request-card__meta">
        {request.licensePlate}
        <span className="divider">/</span>
        {formatSlot(request.preferredSlot)}
      </p>
      <p className="request-card__addr">{request.address}</p>
      {request.needLoaner ? (
        <p className="request-card__badge">Нужна временная</p>
      ) : null}
      <div className="request-card__actions">
        {canEdit ? (
          <Button
            type="button"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            Изменить
          </Button>
        ) : null}
        {canDelete ? (
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            {request.status === 'NEW' ? 'Удалить' : 'Отменить'}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
