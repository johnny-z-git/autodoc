import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../ui/Button'
import './TelegramLogin.css'

type Phase = 'idle' | 'waiting' | 'success' | 'error' | 'timeout'

interface TelegramLoginProps {
  mode: 'login' | 'register'
  onSignedIn?: () => void
}

const POLL_MS = 1500
const TIMEOUT_MS = 60_000

export function TelegramLogin({ mode, onSignedIn }: TelegramLoginProps) {
  const { refresh } = useAuth()
  const [phase, setPhase] = useState<Phase>('idle')
  const [deepLink, setDeepLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const stopPolling = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const start = async () => {
    setError(null)
    setPhase('waiting')
    stopPolling()

    try {
      const { nonce, deepLink: link } = await api.auth.startTelegram()
      setDeepLink(link)
      window.open(link, '_blank', 'noopener,noreferrer')
      startedAtRef.current = Date.now()

      timerRef.current = window.setInterval(() => {
        void (async () => {
          if (Date.now() - startedAtRef.current > TIMEOUT_MS) {
            stopPolling()
            setPhase('timeout')
            return
          }

          try {
            const result = await api.auth.pollTelegram(nonce)
            if (result.status === 'SIGNED_IN') {
              stopPolling()
              setPhase('success')
              await refresh()
              if (onSignedIn) {
                onSignedIn()
              } else {
                window.location.href = '/'
              }
            } else if (result.status === 'EXPIRED' || result.status === 'CANCELED') {
              stopPolling()
              setPhase('error')
              setError('Сессия авторизации истекла. Попробуйте ещё раз.')
            }
          } catch (e) {
            stopPolling()
            setPhase('error')
            setError(e instanceof Error ? e.message : 'Ошибка опроса')
          }
        })()
      }, POLL_MS)
    } catch (e) {
      setPhase('error')
      setError(e instanceof Error ? e.message : 'Не удалось начать вход')
    }
  }

  const title =
    mode === 'register' ? 'Регистрация через Telegram' : 'Вход через Telegram'
  const lead =
    mode === 'register'
      ? 'Создадим аккаунт AutoDoc по вашему Telegram. Никаких паролей — только подтверждение в боте.'
      : 'Войдите тем же Telegram, которым регистрировались. Бот подтвердит личность за несколько секунд.'

  return (
    <div className="tg-login">
      <p className="eyebrow">{mode === 'register' ? 'Регистрация' : 'Вход'}</p>
      <h1 className="tg-login__title">{title}</h1>
      <p className="tg-login__lead">{lead}</p>

      <ol className="tg-login__steps">
        <li>Нажмите кнопку ниже</li>
        <li>Откроется Telegram-бот — нажмите Start</li>
        <li>Вернитесь сюда: страница дождётся подтверждения</li>
      </ol>

      <div className="tg-login__actions">
        <Button
          variant="primary"
          onClick={() => void start()}
          disabled={phase === 'waiting' || phase === 'success'}
        >
          {phase === 'waiting' ? 'Ждём подтверждение…' : 'Продолжить с Telegram'}
        </Button>
        {deepLink ? (
          <a className="tg-login__deeplink" href={deepLink} target="_blank" rel="noreferrer">
            Открыть бота снова
          </a>
        ) : null}
      </div>

      {phase === 'waiting' ? (
        <p className="tg-login__status" role="status">
          Опрашиваем сервер каждые 1.5 с<span className="divider">/</span>таймаут 60 с
        </p>
      ) : null}
      {phase === 'timeout' ? (
        <p className="tg-login__error">
          Время ожидания истекло. Убедитесь, что бот запущен, и попробуйте снова.
        </p>
      ) : null}
      {error ? <p className="tg-login__error">{error}</p> : null}
      {phase === 'success' ? (
        <p className="tg-login__ok" role="status">
          Готово. Перенаправляем…
        </p>
      ) : null}
    </div>
  )
}
