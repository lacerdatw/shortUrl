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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            short<span className="text-base-content">Url</span>
          </Link>
          <p className="text-base-content/50 text-sm mt-2">Welcome back</p>
        </div>

        <div className="card bg-base-100 border border-base-300/50 shadow-sm">
          <div className="card-body gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <fieldset className="fieldset gap-1">
                <label className="label text-xs text-base-content/60">Email</label>
                <input
                  type="email"
                  className="input input-primary w-full"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </fieldset>

              <fieldset className="fieldset gap-1">
                <label className="label text-xs text-base-content/60">Password</label>
                <input
                  type="password"
                  className="input input-primary w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </fieldset>

              {error && (
                <div className="alert alert-error alert-soft text-sm py-2">{error}</div>
              )}

              <button
                type="submit"
                className={`btn btn-primary btn-block mt-1 ${loading ? 'btn-disabled' : ''}`}
              >
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Sign in'}
              </button>
            </form>

            <p className="text-center text-sm text-base-content/50">
              No account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
