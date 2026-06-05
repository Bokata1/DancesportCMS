import { useEffect, useState } from 'react'
import { api } from '../api'

function getInitials(fName, lName) {
  return `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase()
}

function JudgeRow({ judge }) {
  const initials = getInitials(judge.fName, judge.lName)

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-burgundy-900 text-white flex items-center justify-center font-medium text-sm shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900 truncate">
            {judge.fName} {judge.lName}
          </span>
          {judge.isRulesJudge && (
            <span className="text-xs px-2 py-0.5 bg-burgundy-50 text-burgundy-900 rounded shrink-0">
              Съдия по правилата
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-500 truncate">{judge.email}</div>
      </div>

      <div className="text-sm text-zinc-600 font-mono shrink-0">
        {judge.judgeLicense || '—'}
      </div>
    </div>
  )
}

function JudgesPage() {
  const [judges, setJudges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.judges.getAll()
      .then(data => setJudges(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>

  const filtered = judges.filter(j => {
    const q = search.toLowerCase()
    return (
      j.fName.toLowerCase().includes(q) ||
      j.lName.toLowerCase().includes(q) ||
      j.email.toLowerCase().includes(q) ||
      (j.judgeLicense || '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Съдии</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {judges.length} {judges.length === 1 ? 'съдия' : 'съдии'}
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Търсене..."
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900 focus:border-transparent"
        />
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filtered.map(j => (
              <JudgeRow key={j.userID} judge={j} />
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-8">Няма намерени съдии.</p>
        )}
      </div>
    </div>
  )
}

export default JudgesPage