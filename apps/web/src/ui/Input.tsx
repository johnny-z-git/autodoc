import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import './Input.css'

interface FieldProps {
  label: string
  error?: string
  hint?: string
}

type InputProps = FieldProps & InputHTMLAttributes<HTMLInputElement>
type TextAreaProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>

export function Input({ label, error, hint, id, className = '', ...rest }: InputProps) {
  const fieldId = id ?? rest.name
  return (
    <label className={`field ${className}`.trim()} htmlFor={fieldId}>
      <span className="field__label">{label}</span>
      <input id={fieldId} className={`field__control ${error ? 'is-invalid' : ''}`} {...rest} />
      {hint && !error ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}

export function TextArea({ label, error, hint, id, className = '', ...rest }: TextAreaProps) {
  const fieldId = id ?? rest.name
  return (
    <label className={`field ${className}`.trim()} htmlFor={fieldId}>
      <span className="field__label">{label}</span>
      <textarea
        id={fieldId}
        className={`field__control field__control--area ${error ? 'is-invalid' : ''}`}
        {...rest}
      />
      {hint && !error ? <span className="field__hint">{hint}</span> : null}
      {error ? <span className="field__error">{error}</span> : null}
    </label>
  )
}
