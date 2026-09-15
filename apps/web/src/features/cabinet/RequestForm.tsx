import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../../api/client'
import type {
  CreateRepairRequestInput,
  RepairRequest,
  RequestStatus,
  Service,
  UpdateRepairRequestInput,
  User,
} from '../../api/types'
import { Button } from '../../ui/Button'
import { Input, TextArea } from '../../ui/Input'
import { STATUS_FLOW, STATUS_LABELS } from './status'
import './RequestForm.css'

interface RequestFormProps {
  user: User
  initial?: RepairRequest | null
  onSaved: (request: RepairRequest) => void
  onCancel?: () => void
}

type FormState = {
  brand: string
  model: string
  year: string
  licensePlate: string
  address: string
  preferredSlot: string
  needLoaner: boolean
  problemDescription: string
  serviceTypes: string[]
  courierComment: string
  contactPhone: string
  contactEmail: string
  vin: string
  estimatedPrice: string
  finalPrice: string
  loanerCarInfo: string
  staffNotes: string
  status: RequestStatus
}

function toLocalInputValue(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function buildInitial(user: User, initial?: RepairRequest | null): FormState {
  return {
    brand: initial?.brand ?? '',
    model: initial?.model ?? '',
    year: initial?.year?.toString() ?? '',
    licensePlate: initial?.licensePlate ?? '',
    address: initial?.address ?? '',
    preferredSlot: toLocalInputValue(initial?.preferredSlot),
    needLoaner: initial?.needLoaner ?? false,
    problemDescription: initial?.problemDescription ?? '',
    serviceTypes: initial?.serviceTypes ?? [],
    courierComment: initial?.courierComment ?? '',
    contactPhone: initial?.contactPhone ?? user.phone ?? '',
    contactEmail: initial?.contactEmail ?? user.email ?? '',
    vin: initial?.vin ?? '',
    estimatedPrice: initial?.estimatedPrice?.toString() ?? '',
    finalPrice: initial?.finalPrice?.toString() ?? '',
    loanerCarInfo: initial?.loanerCarInfo ?? '',
    staffNotes: initial?.staffNotes ?? '',
    status: initial?.status ?? 'NEW',
  }
}

export function RequestForm({ user, initial, onSaved, onCancel }: RequestFormProps) {
  const isStaff = user.role === 'STAFF'
  const isEdit = Boolean(initial)
  const clientCanEdit = !initial || initial.status === 'NEW'
  const [form, setForm] = useState<FormState>(() => buildInitial(user, initial))
  const [services, setServices] = useState<Service[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setForm(buildInitial(user, initial))
  }, [user, initial])

  useEffect(() => {
    let cancelled = false
    api.services
      .list()
      .then((data) => {
        if (!cancelled) setServices(data)
      })
      .catch(() => {
        /* каталог опционален для формы */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleService = (slug: string) => {
    setForm((prev) => {
      const has = prev.serviceTypes.includes(slug)
      return {
        ...prev,
        serviceTypes: has
          ? prev.serviceTypes.filter((s) => s !== slug)
          : [...prev.serviceTypes, slug],
      }
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.brand.trim()) next.brand = 'Укажите марку'
    if (!form.model.trim()) next.model = 'Укажите модель'
    const year = Number(form.year)
    if (!form.year || Number.isNaN(year) || year < 1980 || year > new Date().getFullYear() + 1) {
      next.year = 'Год выглядет неверно'
    }
    if (!form.licensePlate.trim()) next.licensePlate = 'Укажите госномер'
    if (!form.address.trim()) next.address = 'Укажите адрес подачи'
    if (!form.preferredSlot) next.preferredSlot = 'Выберите дату и время'
    if (!form.problemDescription.trim() || form.problemDescription.trim().length < 5) {
      next.problemDescription = 'Опишите проблему (минимум 5 символов)'
    }
    if (!form.contactPhone.trim()) next.contactPhone = 'Телефон обязателен'
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      next.contactEmail = 'Проверьте email'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return

    const base: CreateRepairRequestInput = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      licensePlate: form.licensePlate.trim().toUpperCase(),
      address: form.address.trim(),
      preferredSlot: new Date(form.preferredSlot).toISOString(),
      needLoaner: form.needLoaner,
      problemDescription: form.problemDescription.trim(),
      serviceTypes: form.serviceTypes.length ? form.serviceTypes : ['other'],
      courierComment: form.courierComment.trim() || undefined,
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim() || undefined,
    }

    setSaving(true)
    try {
      let saved: RepairRequest
      if (isEdit && initial) {
        const patch: UpdateRepairRequestInput = clientCanEdit || isStaff ? { ...base } : {}
        if (isStaff) {
          patch.vin = form.vin.trim() || null
          patch.estimatedPrice = form.estimatedPrice ? Number(form.estimatedPrice) : null
          patch.finalPrice = form.finalPrice ? Number(form.finalPrice) : null
          patch.loanerCarInfo = form.loanerCarInfo.trim() || null
          patch.staffNotes = form.staffNotes.trim() || null
          patch.status = form.status
        }
        saved = await api.requests.update(initial.id, patch)
      } else {
        saved = await api.requests.create(base)
      }
      onSaved(saved)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const fieldsDisabled = isEdit && !clientCanEdit && !isStaff

  return (
    <form className="request-form" onSubmit={(e) => void onSubmit(e)}>
      <fieldset className="request-form__fieldset" disabled={fieldsDisabled && !isStaff}>
        <legend>Авто и подача</legend>
        <div className="request-form__row">
          <Input
            label="Марка"
            name="brand"
            value={form.brand}
            onChange={(e) => setField('brand', e.target.value)}
            error={errors.brand}
            disabled={fieldsDisabled}
          />
          <Input
            label="Модель"
            name="model"
            value={form.model}
            onChange={(e) => setField('model', e.target.value)}
            error={errors.model}
            disabled={fieldsDisabled}
          />
          <Input
            label="Год"
            name="year"
            type="number"
            value={form.year}
            onChange={(e) => setField('year', e.target.value)}
            error={errors.year}
            disabled={fieldsDisabled}
          />
        </div>
        <div className="request-form__row">
          <Input
            label="Госномер"
            name="licensePlate"
            value={form.licensePlate}
            onChange={(e) => setField('licensePlate', e.target.value)}
            error={errors.licensePlate}
            disabled={fieldsDisabled}
          />
          <Input
            label="Желаемые дата и время"
            name="preferredSlot"
            type="datetime-local"
            value={form.preferredSlot}
            onChange={(e) => setField('preferredSlot', e.target.value)}
            error={errors.preferredSlot}
            disabled={fieldsDisabled}
          />
        </div>
        <Input
          label="Адрес подачи"
          name="address"
          value={form.address}
          onChange={(e) => setField('address', e.target.value)}
          error={errors.address}
          disabled={fieldsDisabled}
        />
        <label className="request-form__check">
          <input
            type="checkbox"
            checked={form.needLoaner}
            onChange={(e) => setField('needLoaner', e.target.checked)}
            disabled={fieldsDisabled}
          />
          Нужна временная машина
        </label>
      </fieldset>

      <fieldset className="request-form__fieldset" disabled={fieldsDisabled && !isStaff}>
        <legend>Проблема и услуги</legend>
        <TextArea
          label="Описание проблемы / симптомы"
          name="problemDescription"
          value={form.problemDescription}
          onChange={(e) => setField('problemDescription', e.target.value)}
          error={errors.problemDescription}
          disabled={fieldsDisabled}
          rows={4}
        />
        <div className="request-form__services">
          <span className="request-form__label">Тип работ</span>
          <div className="request-form__chips">
            {services.map((s) => (
              <label key={s.id} className="request-form__chip">
                <input
                  type="checkbox"
                  checked={form.serviceTypes.includes(s.slug)}
                  onChange={() => toggleService(s.slug)}
                  disabled={fieldsDisabled}
                />
                {s.title}
              </label>
            ))}
            <label className="request-form__chip">
              <input
                type="checkbox"
                checked={form.serviceTypes.includes('other')}
                onChange={() => toggleService('other')}
                disabled={fieldsDisabled}
              />
              Другое
            </label>
          </div>
        </div>
        <TextArea
          label="Комментарий для курьера"
          name="courierComment"
          value={form.courierComment}
          onChange={(e) => setField('courierComment', e.target.value)}
          hint="Домофон, парковка, этаж"
          disabled={fieldsDisabled}
          rows={2}
        />
      </fieldset>

      <fieldset className="request-form__fieldset" disabled={fieldsDisabled && !isStaff}>
        <legend>Контакты</legend>
        <div className="request-form__row">
          <Input
            label="Телефон"
            name="contactPhone"
            value={form.contactPhone}
            onChange={(e) => setField('contactPhone', e.target.value)}
            error={errors.contactPhone}
            disabled={fieldsDisabled}
          />
          <Input
            label="Email"
            name="contactEmail"
            type="email"
            value={form.contactEmail}
            onChange={(e) => setField('contactEmail', e.target.value)}
            error={errors.contactEmail}
            disabled={fieldsDisabled}
          />
        </div>
      </fieldset>

      {isStaff ? (
        <fieldset className="request-form__fieldset request-form__fieldset--staff">
          <legend>Блок сотрудника</legend>
          <div className="request-form__row">
            <Input
              label="VIN"
              name="vin"
              value={form.vin}
              onChange={(e) => setField('vin', e.target.value)}
            />
            <label className="field">
              <span className="field__label">Статус</span>
              <select
                className="field__control"
                value={form.status}
                onChange={(e) => setField('status', e.target.value as RequestStatus)}
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="request-form__row">
            <Input
              label="Ориентировочная цена, сом"
              name="estimatedPrice"
              type="number"
              value={form.estimatedPrice}
              onChange={(e) => setField('estimatedPrice', e.target.value)}
            />
            <Input
              label="Итоговая цена, сом"
              name="finalPrice"
              type="number"
              value={form.finalPrice}
              onChange={(e) => setField('finalPrice', e.target.value)}
            />
          </div>
          <Input
            label="Данные временного авто"
            name="loanerCarInfo"
            value={form.loanerCarInfo}
            onChange={(e) => setField('loanerCarInfo', e.target.value)}
            hint="Марка / номер"
          />
          <TextArea
            label="Внутренние заметки"
            name="staffNotes"
            value={form.staffNotes}
            onChange={(e) => setField('staffNotes', e.target.value)}
            rows={3}
          />
        </fieldset>
      ) : null}

      {submitError ? <p className="request-form__error">{submitError}</p> : null}

      <div className="request-form__actions">
        <Button type="submit" variant="primary" disabled={saving || (fieldsDisabled && !isStaff)}>
          {saving ? 'Сохраняем…' : isEdit ? 'Обновить заявку' : 'Создать заявку'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
        ) : null}
      </div>
    </form>
  )
}
