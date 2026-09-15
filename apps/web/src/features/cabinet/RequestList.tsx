import type { RepairRequest, User } from '../../api/types'
import { RequestCard } from './RequestCard'
import { formatSlot, STATUS_LABELS } from './status'
import './RequestList.css'

interface RequestListProps {
  requests: RepairRequest[]
  user: User
  selectedId: string | null
  onSelect: (id: string) => void
  onEdit: (request: RepairRequest) => void
  onDelete: (request: RepairRequest) => void
}

export function RequestList({
  requests,
  user,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: RequestListProps) {
  const selected = requests.find((r) => r.id === selectedId) ?? null

  if (!requests.length) {
    return (
      <p className="request-list__empty">
        Заявок пока нет. Создайте первую — курьер приедет по адресу.
      </p>
    )
  }

  return (
    <div className="request-list">
      <div className="request-list__grid">
        {requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            user={user}
            selected={request.id === selectedId}
            onSelect={() => onSelect(request.id)}
            onEdit={() => onEdit(request)}
            onDelete={() => onDelete(request)}
          />
        ))}
      </div>

      {selected ? (
        <aside className="request-list__detail">
          <p className="eyebrow">Детали заявки</p>
          <h3>
            {selected.brand} {selected.model}
            <span className="divider">/</span>
            {selected.licensePlate}
          </h3>
          <dl className="request-list__dl">
            <div>
              <dt>Статус</dt>
              <dd>{STATUS_LABELS[selected.status]}</dd>
            </div>
            <div>
              <dt>Слот</dt>
              <dd>{formatSlot(selected.preferredSlot)}</dd>
            </div>
            <div>
              <dt>Адрес</dt>
              <dd>{selected.address}</dd>
            </div>
            <div>
              <dt>Проблема</dt>
              <dd>{selected.problemDescription}</dd>
            </div>
            <div>
              <dt>Услуги</dt>
              <dd>{selected.serviceTypes.join(' / ') || '—'}</dd>
            </div>
            <div>
              <dt>Временная</dt>
              <dd>{selected.needLoaner ? 'Да' : 'Нет'}</dd>
            </div>
            {selected.vin ? (
              <div>
                <dt>VIN</dt>
                <dd>{selected.vin}</dd>
              </div>
            ) : null}
            {selected.estimatedPrice != null ? (
              <div>
                <dt>Оценка</dt>
                <dd>{selected.estimatedPrice} сом</dd>
              </div>
            ) : null}
            {selected.finalPrice != null ? (
              <div>
                <dt>Итог</dt>
                <dd>{selected.finalPrice} сом</dd>
              </div>
            ) : null}
            {selected.loanerCarInfo ? (
              <div>
                <dt>Подменная</dt>
                <dd>{selected.loanerCarInfo}</dd>
              </div>
            ) : null}
          </dl>
        </aside>
      ) : null}
    </div>
  )
}
