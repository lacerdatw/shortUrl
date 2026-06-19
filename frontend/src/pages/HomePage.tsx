import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AuthDropdown } from '../components/AuthDropdown'
import { UrlForm } from '../components/UrlForm'
import { UrlTable } from '../components/UrlTable'

export const HomePage = () => {
  const { userId } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <main className="min-h-screen bg-base-100">
      <AuthDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />

      {/* Hero */}
      <section className="px-4 pt-20 pb-16">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8 text-center">

          <div className="flex flex-col items-center gap-3 animate-fade-up" style={{ animationDelay: '0ms' }}>
            <span className="badge badge-dash badge-primary badge-sm tracking-widest uppercase">
              URL Shortener
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-base-content leading-tight tracking-tight">
              Long links,{' '}
              <span className="text-primary">short memories</span>
            </h1>
            <p className="text-base-content/40 max-w-sm">
              Paste your URL below and we'll make it something worth sharing.
            </p>
          </div>

          <div
            className="w-full max-w-xl border border-dashed border-base-300 rounded-box p-4 bg-base-200/40 animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            <UrlForm
              onDropdownOpen={() => setDropdownOpen(true)}
              onCreated={() => setRefreshKey(k => k + 1)}
            />
          </div>

        </div>
      </section>

      {/* Dashed divider */}
      {userId && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="border-t border-dashed border-base-300" />
        </div>
      )}

      {/* URL list — only when logged in */}
      {userId && (
        <section className="max-w-4xl mx-auto px-4 py-10 pb-20 animate-fade-in">
          <p className="text-xs font-semibold text-base-content/30 uppercase tracking-widest mb-4">
            Your links
          </p>
          <UrlTable refreshKey={refreshKey} />
        </section>
      )}
    </main>
  )
}
