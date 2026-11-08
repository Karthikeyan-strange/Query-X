import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'

type Props = {
  value: string
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
}

export default function PasswordField({ value, error, onChange, onBlur }: Props) {
  const [visible, setVisible] = useState(false)
  const errorId = 'password-error'

  return (
    <div className={`form-field${error ? ' has-error' : ''}`}>
      <label className="field-label" htmlFor="password">Password</label>
      <div className="input-wrap">
        <span className="input-icon" aria-hidden="true"><LockKeyhole size={17} strokeWidth={1.8} /></span>
        <input
          id="password"
          name="password"
          type={visible ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          required
        />
        <button
          className="visibility-button"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
        </button>
      </div>
      {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
    </div>
  )
}
