import type {
  ContactPayload,
  CreateRepairRequestInput,
  RepairRequest,
  Service,
  TelegramPollResponse,
  TelegramStartResponse,
  UpdateRepairRequestInput,
  User,
} from './types'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!res.ok) {
    let message = `Ошибка ${res.status}`
    try {
      const body = (await res.json()) as { error?: string; message?: string }
      message = body.error ?? body.message ?? message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return (await res.json()) as T
}

export const api = {
  auth: {
    startTelegram: () =>
      request<TelegramStartResponse>('/api/auth/telegram/start', { method: 'POST', body: '{}' }),
    pollTelegram: (nonce: string) =>
      request<TelegramPollResponse>(`/api/auth/telegram/poll?nonce=${encodeURIComponent(nonce)}`),
    logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: '{}' }),
  },
  me: {
    get: async () => {
      const data = await request<{ user: User }>('/api/me')
      return data.user
    },
    update: async (payload: { email?: string | null; phone?: string | null }) => {
      const data = await request<{ user: User }>('/api/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      return data.user
    },
  },
  services: {
    list: async () => {
      const data = await request<{ services: Service[] }>('/api/services')
      return data.services
    },
  },
  requests: {
    list: async () => {
      const data = await request<{ requests: RepairRequest[] }>('/api/requests')
      return data.requests
    },
    get: async (id: string) => {
      const data = await request<{ request: RepairRequest }>(`/api/requests/${id}`)
      return data.request
    },
    create: async (payload: CreateRepairRequestInput) => {
      const data = await request<{ request: RepairRequest }>('/api/requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      return data.request
    },
    update: async (id: string, payload: UpdateRepairRequestInput) => {
      const data = await request<{ request: RepairRequest }>(`/api/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      return data.request
    },
    remove: (id: string) =>
      request<{ ok: boolean; deleted?: boolean; request?: RepairRequest }>(
        `/api/requests/${id}`,
        { method: 'DELETE' },
      ),
  },
  contact: {
    send: (data: ContactPayload) =>
      request<{ ok: boolean }>('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
  },
}

export { API_BASE }
