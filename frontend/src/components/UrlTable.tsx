import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

interface UrlRecord {
  code: string
  originalUrl: string
  shortUrl: string
  clicks: number
  createdAt: string
}

interface UrlTableProps {
  refreshKey: number
}

export const UrlTable = ({ refreshKey }: UrlTableProps) => {
  const [urls, setUrls] = useState<UrlRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchUrls = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<UrlRecord[]>('/urls')
      setUrls(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUrls() }, [fetchUrls, refreshKey])

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(shortUrl)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    )
  }

  if (urls.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-base-content/40">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m0 0L10.172 13.828m3.656-3.656L10.172 13.828" />
        </svg>
        <p className="text-sm">No links yet — shorten your first URL above</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-box border border-base-300/50">
      <table className="table table-sm">
        <thead>
          <tr className="bg-base-200/60 text-base-content/60 text-xs uppercase tracking-wide">
            <th>Short link</th>
            <th className="hidden md:table-cell">Original URL</th>
            <th className="text-center">Clicks</th>
            <th className="hidden sm:table-cell">Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {urls.map(u => (
            <tr key={u.code} className="hover:bg-base-200/40 transition-colors duration-150">
              <td>
                <span className="font-mono text-primary text-sm">{u.shortUrl}</span>
              </td>
              <td className="hidden md:table-cell max-w-xs">
                <span className="truncate block text-base-content/60 text-xs">{u.originalUrl}</span>
              </td>
              <td className="text-center">
                <span className="badge badge-soft badge-primary badge-sm">{u.clicks}</span>
              </td>
              <td className="hidden sm:table-cell text-base-content/40 text-xs">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => handleCopy(u.shortUrl)}
                >
                  {copied === u.shortUrl ? '✓' : 'Copy'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
