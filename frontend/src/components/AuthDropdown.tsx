import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthDropdown = ({ isOpen, onClose }: AuthDropdownProps) => {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen, onClose])

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <div
      ref={ref}
      className={`
        fixed top-16 right-4 z-50 w-72
        transition-all duration-300 ease-out
        ${isOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-3 pointer-events-none'}
      `}
    >
      <div className="card bg-base-100/90 backdrop-blur-lg shadow-xl border border-base-300/40">
        <div className="card-body gap-4 p-5">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
              </svg>
            </div>
            <p className="font-semibold text-base-content text-sm">Create your short link</p>
            <p className="text-base-content/50 text-xs">Sign in or create a free account to continue</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              className="btn btn-primary btn-block btn-sm"
              onClick={() => go('/register')}
            >
              Create account
            </button>
            <button
              className="btn btn-ghost btn-block btn-sm"
              onClick={() => go('/login')}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
