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
      <AuthDropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-base-100 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto flex flex-col items-center gap-6 text-center">
          <div className="badge badge-soft badge-primary badge-sm tracking-widest uppercase">
            URL Shortener
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-base-content leading-tight">
            Long links,<br />
            <span className="text-primary">short memories</span>
          </h1>
          <p className="text-base-content/50 text-lg max-w-md">
            Paste your URL below. We'll make it something worth sharing.
          </p>

          <div className="w-full max-w-xl">
            <UrlForm
              onDropdownOpen={() => setDropdownOpen(true)}
              onCreated={() => setRefreshKey(k => k + 1)}
            />
          </div>
        </div>
      </section>

      {/* URL list — only when logged in */}
      {userId && (
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-base-content/50 uppercase tracking-widest">
              Your links
            </h2>
          </div>
          <UrlTable refreshKey={refreshKey} />
        </section>
      )}
    </main>
  )
}
