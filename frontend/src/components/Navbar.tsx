import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { userId, logout } = useAuth()

  return (
    <div className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-300/50 sticky top-0 z-40">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary tracking-tight">
          short<span className="text-base-content">Url</span>
        </Link>
      </div>

      <div className="navbar-end gap-2">
        {userId ? (
          <>
            <span className="text-sm text-base-content/50 hidden sm:block truncate max-w-40">
              {userId}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </>
        )}
      </div>
    </div>
  )
}
