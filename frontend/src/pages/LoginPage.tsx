import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, Mail, Package, Radar, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import Brand from '../components/auth/Brand'
import FormField from '../components/auth/FormField'
import PasswordField from '../components/auth/PasswordField'
import { ThemeToggle } from '../hooks/useTheme'
import { api, setAuthToken, setStoredUser } from '../api/client'
import introVideo from '../../Assests/Video Project 1.mp4'

type Screen = 'login' | 'recovery' | 'recovery-confirmation'
type LoginRole = 'team' | 'customer'
type Touched = { email: boolean; password: boolean }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const [screen, setScreen] = useState<Screen>('login')
  const [role, setRole] = useState<LoginRole>('team')
  const [introState, setIntroState] = useState<'playing' | 'fading' | 'done'>('playing')
  const [email, setEmail] = useState('')
  const [orderId, setOrderId] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [touched, setTouched] = useState<Touched>({ email: false, password: false })
  const videoRef = useRef<HTMLVideoElement>(null)
  const fadeTimerRef = useRef<number | undefined>(undefined)
  const demoTimerRef = useRef<number | undefined>(undefined)
  const introTransitionedRef = useRef(false)

  const normalizedEmail = email.trim()
  const emailError = role === 'team' && (submitted || touched.email)
    ? !normalizedEmail ? 'Enter your work email address.'
      : !emailPattern.test(normalizedEmail) ? 'Enter an email address in the correct format.'
        : ''
    : ''
  const passwordError = role === 'team' && (submitted || touched.password) && !password ? 'Enter your password.' : ''

  function finishIntro() {
    if (introTransitionedRef.current) return
    introTransitionedRef.current = true
    setIntroState('fading')
    fadeTimerRef.current = window.setTimeout(() => setIntroState('done'), 1300)
  }

  function skipIntro() {
    if (introTransitionedRef.current) return
    introTransitionedRef.current = true
    if (fadeTimerRef.current !== undefined) window.clearTimeout(fadeTimerRef.current)
    setIntroState('done')
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause()
      skipIntro()
    } else {
      video.play().catch(skipIntro)
    }

    return () => {
      if (fadeTimerRef.current !== undefined) window.clearTimeout(fadeTimerRef.current)
      if (demoTimerRef.current !== undefined) window.clearTimeout(demoTimerRef.current)
    }
  }, [])

  function resetFormState() {
    setSubmitted(false)
    setTouched({ email: false, password: false })
  }

  function openRecovery() {
    resetFormState()
    setScreen('recovery')
  }

  function backToLogin() {
    resetFormState()
    setScreen('login')
  }

  const [apiError, setApiError] = useState('')

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setApiError('')

    if (role === 'team' && (!normalizedEmail || !emailPattern.test(normalizedEmail) || !password)) return
    if (role === 'customer' && (!normalizedEmail || !emailPattern.test(normalizedEmail) || !orderId.trim())) return

    setLoading(true)

    const loginPromise = role === 'team'
      ? api.auth.teamLogin({ email: normalizedEmail, password })
      : api.auth.customerLogin({ email: normalizedEmail, orderId: orderId.trim() })

    loginPromise
      .then((data) => {
        setAuthToken(data.token)
        setStoredUser(data)
        if (role === 'team') {
          window.location.assign('/agent')
        } else {
          window.location.assign('/customer')
        }
      })
      .catch((err) => {
        setLoading(false)
        setApiError(err.message || 'Login failed. Please check your credentials.')
      })
  }

  function handleRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) return
    setScreen('recovery-confirmation')
  }

  const isRevealed = introState !== 'playing'

  return (
    <>
      {introState !== 'done' && (
        <div className={`intro-screen${introState === 'fading' ? ' is-fading' : ''}`} aria-hidden="true">
          <video
            ref={videoRef}
            className="intro-video"
            autoPlay
            muted
            playsInline
            preload="auto"
            controls={false}
            onEnded={finishIntro}
            onError={skipIntro}
          >
            <source src={introVideo} type="video/mp4" />
          </video>
          <div className="intro-overlay" />
        </div>
      )}

      <main className={`login-shell${isRevealed ? ' is-revealed' : ''}`} aria-hidden={!isRevealed} inert={!isRevealed}>
        <section className="story-panel" aria-labelledby="platform-heading">
          <div className="story-orbit orbit-one" />
          <div className="story-orbit orbit-two" />
          <div className="story-content">
            <Brand />

            <div className="story-copy">
              <p className="eyebrow story-eyebrow"><span className="eyebrow-line" /> DELIVERY EXCEPTIONS, UNDERSTOOD</p>
              <h1 id="platform-heading">Make every<br />delivery delay<br /><em>make sense.</em></h1>
              <p className="story-description">A clearer view of what happened, where it happened, and what to tell the customer.</p>

              <div className="capability-list">
                <div className="capability-item">
                  <span className="capability-icon"><Sparkles size={17} strokeWidth={1.7} /></span>
                  <span><strong>AI-assisted investigations</strong><small>Connect shipment timelines to credible evidence.</small></span>
                </div>
                <div className="capability-item">
                  <span className="capability-icon"><Radar size={17} strokeWidth={1.7} /></span>
                  <span><strong>Regional disruption monitoring</strong><small>Surface weather, road and local event signals.</small></span>
                </div>
                <div className="capability-item">
                  <span className="capability-icon"><ShieldCheck size={17} strokeWidth={1.7} /></span>
                  <span><strong>Evidence-based explanations</strong><small>Keep customer updates grounded in what is known.</small></span>
                </div>
              </div>
            </div>

            <div className="story-bottom">
              <span className="restricted-note"><ShieldCheck size={14} /> AUTHORIZED PERSONNEL ONLY</span>
              <span className="story-coordinates">OPERATIONS INTELLIGENCE <i /></span>
            </div>
          </div>
        </section>

        <section className="form-panel" aria-label="Account access">
          <div className="form-topline">
            <Brand compact />
            <div className="login-top-actions"><span className="access-note"><span className="status-dot" /> SECURE WORKSPACE</span><ThemeToggle /></div>
          </div>

          <div className="form-wrap" key={screen}>
            {screen === 'login' && (
              <>
                <div className="form-heading">
                  <p className="eyebrow form-eyebrow">WELCOME BACK</p>
                  <h2>{role === 'team' ? <>Sign in to<br /><span>your workspace.</span></> : <>Access your<br /><span>deliveries.</span></>}</h2>
                  <p className="form-subtitle">{role === 'team' ? 'Use your organization credentials to open the logistics workspace.' : 'Open the customer portal preview. Sign-in and order checks are disabled for UI testing.'}</p>
                </div>

                <div className="login-role-picker" role="group" aria-label="Choose account type">
                  <button type="button" className={role === 'team' ? 'role-selected' : ''} aria-pressed={role === 'team'} onClick={() => { setRole('team'); resetFormState() }}><ShieldCheck size={15} /><span>Logistics team</span></button>
                  <button type="button" className={role === 'customer' ? 'role-selected' : ''} aria-pressed={role === 'customer'} onClick={() => { setRole('customer'); resetFormState() }}><UserRound size={15} /><span>Customer</span></button>
                </div>

                <form onSubmit={handleLogin} noValidate>
                  {role === 'customer' && <FormField
                    label="Order ID (optional)"
                    icon={<Package size={17} strokeWidth={1.8} />}
                    name="order-id"
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. TN-78420319"
                    value={orderId}
                    onChange={(event) => setOrderId(event.target.value.toUpperCase())}
                    required={false}
                  />}
                  <FormField
                    label={role === 'team' ? 'Work email' : 'Email (optional)'}
                    icon={<Mail size={17} strokeWidth={1.8} />}
                    name="email"
                    type="email"
                    autoComplete={role === 'team' ? 'username' : 'email'}
                    placeholder={role === 'team' ? 'name@company.com' : 'you@example.com'}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    error={emailError}
                    required={role === 'team'}
                  />

                  {role === 'team' && <>
                    <div className="password-label-row">
                      <span />
                      <button className="text-link" type="button" onClick={openRecovery}>Forgot password?</button>
                    </div>
                    <PasswordField
                      value={password}
                      error={passwordError}
                      onChange={setPassword}
                      onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                    />
                  </>}

                  {role === 'team' && <label className="remember-row">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    <span className="custom-check" aria-hidden="true" />
                    <span>Remember me</span>
                  </label>}

                  {apiError && (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      {apiError}
                    </div>
                  )}

                  <button className="submit-button" type="submit" disabled={loading}>
                    <span>{loading ? (role === 'team' ? 'Opening workspace...' : 'Checking order...') : role === 'team' ? 'Sign in to logistics' : 'Continue as customer'}</span>
                    {loading ? <span className="button-spinner" aria-hidden="true" /> : <ArrowRight size={18} strokeWidth={1.8} />}
                  </button>
                </form>

                <div className="roles-note">
                  <span>{role === 'team' ? 'LOGISTICS TEAM ACCESS' : 'CUSTOMER PORTAL PREVIEW'}</span>
                  <p>{role === 'team' ? <>Administrator <i /> Support Agent <i /> Investigator</> : 'Uses sample customer data. Order matching and OTP are disabled.'}</p>
                </div>
              </>
            )}

            {screen === 'recovery' && (
              <div className="state-panel">
                <button className="back-link" type="button" onClick={backToLogin}><ArrowLeft size={15} /> Back to sign in</button>
                <div className="state-icon"><Mail size={21} strokeWidth={1.7} /></div>
                <p className="eyebrow form-eyebrow">ACCOUNT RECOVERY</p>
                <h2>Reset your<br /><span>password.</span></h2>
                <p className="form-subtitle state-description">Enter your work email and we’ll prepare the next recovery step.</p>
                <form onSubmit={handleRecovery} noValidate>
                  <FormField
                    label="Work email"
                    icon={<Mail size={17} strokeWidth={1.8} />}
                    name="recovery-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                    error={emailError}
                    required
                  />
                  <button className="submit-button recovery-button" type="submit"><span>Continue</span><ArrowRight size={18} /></button>
                </form>
              </div>
            )}

            {screen === 'recovery-confirmation' && (
              <div className="state-panel confirmation-panel">
                <div className="state-icon success-icon"><Check size={22} strokeWidth={2} /></div>
                <p className="eyebrow form-eyebrow">REQUEST READY</p>
                <h2>Check your<br /><span>recovery details.</span></h2>
                <p className="form-subtitle state-description">Your email passed validation. Password reset delivery will be available when an authentication service is connected.</p>
                <button className="submit-button recovery-button" type="button" onClick={backToLogin}><span>Return to sign in</span><ArrowRight size={18} /></button>
              </div>
            )}

            <div className="security-note"><span className="security-icon"><ShieldCheck size={15} /></span><span>Access is restricted to authorized personnel.</span></div>
          </div>

          <footer className="form-footer">
            <span>Regional AI Logistics Intelligence Platform</span>
            <span className="footer-version">SECURE ACCESS</span>
          </footer>
        </section>
      </main>
    </>
  )
}
