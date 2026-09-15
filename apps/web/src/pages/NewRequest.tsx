import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RequestForm } from '../features/cabinet/RequestForm'
import './NewRequest.css'

export function NewRequestPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <section className="new-request-page section">
        <div className="container">
          <p>Проверяем сессию…</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <section className="new-request-page section">
      <div className="container">
        <p className="eyebrow">Новая заявка</p>
        <h1 className="new-request-page__title">Вызов AutoDoc</h1>
        <p className="lead new-request-page__lead">
          Укажите авто, адрес и слот. Если нужна временная машина — отметьте в форме.
        </p>
        <RequestForm
          user={user}
          onSaved={(req) => navigate('/cabinet', { state: { createdId: req.id } })}
          onCancel={() => navigate('/cabinet')}
        />
      </div>
    </section>
  )
}
