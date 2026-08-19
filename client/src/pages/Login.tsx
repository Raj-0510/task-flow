import { useState } from 'react'
import '../styles/auth.css'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { error?: string, message?: string } } })?.response?.data;
      setError(errorData?.error ?? errorData?.message ?? 'Login failed')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>

        <div className="demo-credentials-banner">
          <div className="demo-credentials-header">
            <strong>Testing / Trial Credentials</strong>
          </div>
          <p className="demo-credentials-text">
            To test the application safely without using your personal info, feel free to use this demo account:
          </p>
          <div className="demo-credentials-fields">
            <div><span>Email:</span> <code>demo@taskflow.com</code></div>
            <div><span>Password:</span> <code>demo123</code></div>
          </div>
          <button
            type="button"
            className="demo-autofill-btn"
            onClick={() => {
              setEmail('demo@taskflow.com')
              setPassword('demo123')
            }}
          >
            Auto-fill Demo Credentials
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-footer">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}