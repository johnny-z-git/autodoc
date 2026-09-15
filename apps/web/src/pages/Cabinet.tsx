import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { api } from '../api/client'
import type { RepairRequest } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { ProfileForm } from '../features/cabinet/ProfileForm'
import { RequestForm } from '../features/cabinet/RequestForm'
import { RequestList } from '../features/cabinet/RequestList'
import { Button } from '../ui/Button'
import './Cabinet.css'

export function CabinetPage() {
  const { user, loading, setUser } = useAuth()
  const [requests, setRequests] = useState<RepairRequest[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<RepairRequest | null>(null)

  const loadRequests = useCallback(async () => {
    setListError(null)
    setListLoading(true)
    try {
      const data = await api.requests.list()
      setRequests(data)
      setSelectedId((prev) => prev ?? data[0]?.id ?? null)
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Не удалось загрузить заявки')
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) void loadRequests()
  }, [user, loadRequests])

  if (loading) {
    return (
      <section className="cabinet-page section">
        <div className="container">
          <p className="cabinet-page__state">Проверяем сессию…</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const onDelete = async (request: RepairRequest) => {
    const label =
      request.status === 'NEW'
        ? 'Удалить заявку безвозвратно?'
        : 'Отменить заявку (статус CANCELLED)?'
    if (!window.confirm(label)) return

    try {
      await api.requests.remove(request.id)
      if (editing?.id === request.id) setEditing(null)
      await loadRequests()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Ошибка удаления')
    }
  }

  return (
    <section className="cabinet-page section">
      <div className="container">
        <div className="cabinet-page__head">
          <div>
            <p className="eyebrow">Личный кабинет</p>
            <h1 className="cabinet-page__title">Профиль и заявки</h1>
          </div>
          <Link to="/cabinet/requests/new">
            <Button variant="primary">Новая заявка</Button>
          </Link>
        </div>

        <div className="cabinet-page__block">
          <h2>Профиль</h2>
          <ProfileForm user={user} onUpdated={setUser} />
        </div>

        <div className="cabinet-page__block">
          <div className="cabinet-page__block-head">
            <h2>Заявки на выезд</h2>
            <Button variant="ghost" onClick={() => void loadRequests()}>
              Обновить
            </Button>
          </div>

          {listLoading ? <p className="cabinet-page__state">Загружаем заявки…</p> : null}
          {listError ? <p className="cabinet-page__error">{listError}</p> : null}

          {!listLoading && !listError ? (
            editing ? (
              <div className="cabinet-page__edit">
                <h3>Редактирование заявки</h3>
                <RequestForm
                  user={user}
                  initial={editing}
                  onSaved={async () => {
                    setEditing(null)
                    await loadRequests()
                  }}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : (
              <RequestList
                requests={requests}
                user={user}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onEdit={setEditing}
                onDelete={(r) => void onDelete(r)}
              />
            )
          ) : null}
        </div>
      </div>
    </section>
  )
}
