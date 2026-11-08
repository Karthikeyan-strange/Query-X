import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  icon: ReactNode
  error?: string
}

export default function FormField({ label, icon, error, id, ...inputProps }: Props) {
  const fieldId = id ?? inputProps.name
  const errorId = `${fieldId}-error`

  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label className="field-label" htmlFor={fieldId}>{label}</label>
      <div className="input-wrap">
        <span className="input-icon" aria-hidden="true">{icon}</span>
        <input
          {...inputProps}
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
    </div>
  )
}
