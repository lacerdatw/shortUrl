import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

interface UrlFormProps {
  onDropdownOpen: () => void
  onCreated: () => void
}

interface CreateUrlResponse {
  code: string
  shortUrl: string
  originalUrl: string
}

export const UrlForm = ({ onDropdownOpen, onCreated }: UrlFormProps) => {
  const { userId } = useAuth()
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<CreateUrlResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)

    if (!userId) {
      onDropdownOpen()
      return
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post<CreateUrlResponse>('/urls', { originalUrl: url })
      setResult(data)
      setUrl('')
      onCreated()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          className="input input-primary flex-1 min-w-0"
          placeholder="https://your-very-long-url.com/goes/here"
          value={url}
          onChange={e => setUrl(e.target.value)}
          required
        />
        <button
          type="submit"
          className={`btn btn-primary shrink-0 ${loading ? 'btn-disabled' : ''}`}
        >
          {loading
            ? <span className="loading loading-spinner loading-sm" />
            : 'Shorten'}
        </button>
      </form>

      {error && (
        <div className="alert alert-error alert-soft text-sm py-2">
          {error}
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 p-3 rounded-box bg-base-200 border border-base-300/60 animate-in fade-in duration-300">
          <span className="text-primary font-mono text-sm flex-1 truncate">{result.shortUrl}</span>
          <button className="btn btn-primary btn-sm shrink-0" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
