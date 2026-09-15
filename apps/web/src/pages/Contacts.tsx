import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Button } from '../ui/Button'
import { Input, TextArea } from '../ui/Input'
import './Contacts.css'

export function ContactsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Заполните имя, email и сообщение.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Проверьте формат email.')
      return
    }

    setStatus('sending')
    try {
      await api.contact.send({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim(),
      })
      setStatus('ok')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Не удалось отправить')
    }
  }

  return (
    <section className="contacts-page section">
      <div className="container contacts-page__grid">
        <div>
          <p className="eyebrow">Контакты</p>
          <h1 className="contacts-page__title">Свяжитесь с AutoDoc</h1>
          <ul className="contacts-page__info">
            <li>
              <span>Телефон</span>
              <a href="tel:+79991234567">+996 555-555-555</a>
            </li>
            <li>
              <span>Email</span>
              <a href="mailto:hello@autodoc.local">hello@autodoc.local</a>
            </li>
            <li>
              <span>Telegram</span>
              <span>@autodoc_support</span>
            </li>
            <li>
              <span>Зона</span>
              <span>Бишкек</span>
            </li>
          </ul>
        </div>

        <form className="contacts-page__form" onSubmit={(e) => void onSubmit(e)}>
          <h2>Форма обратной связи</h2>
          <Input label="Имя" name="name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Телефон"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            hint="Необязательно"
          />
          <TextArea
            label="Сообщение"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
          {error ? <p className="contacts-page__error">{error}</p> : null}
          {status === 'ok' ? (
            <p className="contacts-page__ok">Сообщение отправлено. Ответим в рабочие часы.</p>
          ) : null}
          <Button type="submit" variant="primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'Отправляем…' : 'Отправить'}
          </Button>
        </form>
      </div>
    </section>
  )
}
