import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="text-center animate-fade-up" style={{ animationDelay: '0ms' }}>
          <Link to="/" className="text-2xl font-bold tracking-tight">
            <span className="text-primary">short</span>
            <span className="text-base-content">Url</span>
          </Link>
          <p className="text-base-content/40 text-sm mt-1">Welcome back</p>
        </div>

        <div
          className="card card-dash bg-base-100 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          <div className="card-body gap-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div className="flex flex-col gap-1 animate-fade-up" style={{ animationDelay: '140ms' }}>
                <label className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  className="input input-primary w-full"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1 animate-fade-up" style={{ animationDelay: '180ms' }}>
                <label className="text-xs font-medium text-base-content/50 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  className="input input-primary w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div role="alert" className="alert alert-error alert-dash text-sm py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block animate-fade-up"
                style={{ animationDelay: '220ms' }}
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Sign in'}
              </button>
            </form>

            <div className="divider text-xs text-base-content/30 my-0">or</div>

            <p className="text-center text-sm text-base-content/40">
              No account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline underline-offset-2">
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
