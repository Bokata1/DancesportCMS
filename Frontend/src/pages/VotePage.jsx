import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'

function generateFingerprint() {
  const stored = localStorage.getItem('voterFingerprint')
  if (stored) return stored

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    Math.random().toString(36).substring(2, 10),
  ].join('|')

  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i)
    hash |= 0
  }

  const fp = 'fp_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36)
  localStorage.setItem('voterFingerprint', fp)
  return fp
}

function VotePage() {
  const { tournamentID, categoryID } = useParams()
  const navigate = useNavigate()

  const [couples, setCouples] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedID, setSelectedID] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.voting.getCouples(tournamentID, categoryID)
      .then(data => setCouples(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [tournamentID, categoryID])

  const handleVote = async () => {
    if (!selectedID) return
    setSubmitting(true)
    setError(null)

    try {
      await api.voting.cast({
        tournamentID: Number(tournamentID),
        categoryID: Number(categoryID),
        registrationID: selectedID,
        voterFingerprint: generateFingerprint(),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Грешка при гласуване')
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-zinc-500 text-center py-12">Зареждане...</p>

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Благодаря Ви че гласувахте!
        </h1>
        <p className="text-zinc-600 mb-6">
          Резултатите ще бъдат обявени скоро.
        </p>
        <button
          onClick={() => navigate(`/vote-results/${tournamentID}/${categoryID}`)}
          className="px-5 py-2.5 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
        >
          Виж текущите резултати →
        </button>
      </div>
    )
  }

  const selectedCouple = couples.find(c => c.registrationID === selectedID)

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Гласувайте за вашата любима двойка!
        </h1>
        <p className="text-sm text-zinc-500">
          Изберете 1 двойка от списъка
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2 mb-6">
        {couples.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">
            Няма двойки в тази категория.
          </p>
        ) : (
          couples.map(c => {
            const isSelected = selectedID === c.registrationID
            return (
              <button
                key={c.registrationID}
                onClick={() => setSelectedID(c.registrationID)}
                disabled={submitting}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-burgundy-900 bg-burgundy-50'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                    isSelected
                      ? 'bg-burgundy-900 text-white'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}>
                    {c.startNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 truncate">
                      {c.coupleName}
                    </div>
                    <div className="text-xs text-zinc-500 truncate">
                      {c.clubName}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-burgundy-900 text-xl">✓</div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      <button
        onClick={handleVote}
        disabled={!selectedID || submitting}
        className="w-full h-12 bg-burgundy-900 text-white rounded-lg font-semibold hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
      >
        {submitting
          ? 'Изпращане...'
          : selectedCouple
            ? `Гласувай за №${selectedCouple.startNumber}`
            : 'Изберете двойка'}
      </button>

      <p className="text-xs text-zinc-400 text-center mt-4">
        може да гласувате само за 1 двойка в тази категория.
      </p>
    </div>
  )
}

export default VotePage