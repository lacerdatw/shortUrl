import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { userId, logout } = useAuth()

  return (
    <div className="navbar bg-base-100/75 backdrop-blur-lg border-b border-dashed border-base-300 sticky top-0 z-40">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-lg font-bold tracking-tight px-2">
          <span className="text-primary">short</span>
          <span className="text-base-content">Url</span>
        </Link>
      </div>

      <div className="navbar-end gap-2">
        {userId ? (
          <>
            <span className="text-xs text-base-content/40 hidden sm:block truncate max-w-36">
              {userId}
            </span>
            <button className="btn btn-ghost btn-sm text-base-content/60" onClick={logout}>
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
