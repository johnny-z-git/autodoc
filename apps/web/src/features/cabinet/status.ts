import type { RequestStatus } from '../../api/types'

export const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: 'Новая',
  CONFIRMED: 'Подтверждена',
  PICKUP_SCHEDULED: 'Подача назначена',
  IN_PROGRESS: 'В работе',
  READY: 'Готова',
  DELIVERED: 'Доставлена',
  CANCELLED: 'Отменена',
}

export const STATUS_FLOW: RequestStatus[] = [
  'NEW',
  'CONFIRMED',
  'PICKUP_SCHEDULED',
  'IN_PROGRESS',
  'READY',
  'DELIVERED',
  'CANCELLED',
]

export function formatSlot(iso: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
