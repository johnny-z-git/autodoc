export type UserRole = 'CUSTOMER' | 'STAFF'

export type RequestStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PICKUP_SCHEDULED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface User {
  id: string
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  role: UserRole
  createdAt?: string
}

export interface Service {
  id: string
  slug: string
  title: string
  description: string
  basePriceFrom: number
  durationHint: string
  imageUrl: string | null
}

export interface RepairRequest {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  address: string
  preferredSlot: string
  needLoaner: boolean
  problemDescription: string
  serviceTypes: string[]
  courierComment: string | null
  contactPhone: string
  contactEmail: string | null
  vin: string | null
  estimatedPrice: number | null
  finalPrice: number | null
  loanerCarInfo: string | null
  staffNotes: string | null
  status: RequestStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export type CreateRepairRequestInput = {
  brand: string
  model: string
  year: number
  licensePlate: string
  address: string
  preferredSlot: string
  needLoaner: boolean
  problemDescription: string
  serviceTypes: string[]
  courierComment?: string
  contactPhone: string
  contactEmail?: string
}

export type UpdateRepairRequestInput = Partial<CreateRepairRequestInput> & {
  vin?: string | null
  estimatedPrice?: number | null
  finalPrice?: number | null
  loanerCarInfo?: string | null
  staffNotes?: string | null
  status?: RequestStatus
}

export type AuthPollStatus = 'PENDING' | 'SIGNED_IN' | 'EXPIRED' | 'CANCELED'

export interface TelegramStartResponse {
  nonce: string
  deepLink: string
  expiresAt?: string
}

export interface TelegramPollResponse {
  status: AuthPollStatus
  user?: User
}

export interface ContactPayload {
  name: string
  email: string
  phone?: string
  message: string
}
