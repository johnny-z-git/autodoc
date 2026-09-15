import { useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import type { User } from '../../api/types'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import './ProfileForm.css'

interface ProfileFormProps {
  user: User
  onUpdated: (user: User) => void
}

function isValidEmail(value: string) {
  if (!value) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function ProfileForm({ user, onUpdated }: ProfileFormProps) {
  const [email, setEmail] = useState(user.email ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(false)

    if (!isValidEmail(email.trim())) {
      setError('Проверьте формат email.')
      return
    }

    setSaving(true)
    try {
      const updated = await api.me.update({
        email: email.trim() || null,
        phone: phone.trim() || null,
      })
      onUpdated(updated)
      setOk(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—'

  return (
    <form className="profile-form" onSubmit={(e) => void onSubmit(e)}>
      <div className="profile-form__readonly">
        <div>
          <span className="profile-form__label">Имя из Telegram</span>
          <strong>{fullName}</strong>
        </div>
        <div>
          <span className="profile-form__label">Username</span>
          <strong>{user.username ? `@${user.username}` : '—'}</strong>
        </div>
        <div>
          <span className="profile-form__label">Роль</span>
          <strong>{user.role === 'STAFF' ? 'Сотрудник' : 'Клиент'}</strong>
        </div>
      </div>

      <div className="profile-form__fields">
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hint="Необязательно, но удобно для уведомлений"
        />
        <Input
          label="Телефон"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          hint="Нужен для заявок на выезд"
        />
      </div>

      {error ? <p className="profile-form__error">{error}</p> : null}
      {ok ? <p className="profile-form__ok">Профиль сохранён</p> : null}

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? 'Сохраняем…' : 'Сохранить профиль'}
      </Button>
    </form>
  )
}
