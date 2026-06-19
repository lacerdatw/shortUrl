import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg === 'Email already in use' ? 'This email is already registered.' : 'Something went wrong.')
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
          <p className="text-base-content/40 text-sm mt-1">Create your account</p>
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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
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
                {loading ? <span className="loading loading-spinner loading-sm" /> : 'Create account'}
              </button>
            </form>

            <div className="divider text-xs text-base-content/30 my-0">or</div>

            <p className="text-center text-sm text-base-content/40">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
