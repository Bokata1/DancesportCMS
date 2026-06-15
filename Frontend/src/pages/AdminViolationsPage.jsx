import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

function AdminViolationsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const session = sessionStorage.getItem('userSession')
    if (!session) {
      navigate('/login')
      return
    }
    const parsed = JSON.parse(session)
    if (!parsed.isAdmin) {
      navigate('/')
      return
    }

    api.rulesViolations.getTournamentView(id)
      .then(result => setData(result))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <p className="text-zinc-500 text-center py-12">Зареждане...</p>
  if (error) return <p className="text-red-600 text-center py-12">Грешка: {error}</p>
  if (!data) return null

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link to={`/admin/tournaments/${id}`} className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към турнира
      </Link>

      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-1">{data.tournamentName}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Маркирани 
        </h1>
        <p className="text-zinc-600">
          Общо {data.totalViolations} {data.totalViolations === 1 ? 'нарушение' : 'нарушения'} в турнира
        </p>
      </div>

      {!data.categories || data.categories.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">Няма потвърдени нарушения на правилника за този турнир.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.categories.map(group => (
            <div key={group.roundID} className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200">
                <h3 className="font-semibold text-zinc-900">
                  {group.categoryName}
                </h3>
                <p className="text-xs text-zinc-500">
                  {ROUND_TYPE_LABELS[group.roundType] || group.roundType}
                </p>
              </div>
              <div className="divide-y divide-zinc-100">
                {group.couples.map(couple => (
                  <div key={couple.registrationID} className="px-5 py-3 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-700 shrink-0">
                      {couple.startNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-zinc-900 mb-1">
                        {couple.coupleName}
                      </div>
                      <div className="text-xs text-zinc-500 mb-2">{couple.clubName}</div>
                      <div className="flex flex-wrap gap-2">
                        {couple.hasCostumeFlag && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                            ⚠ Костюми
                          </span>
                        )}
                        {couple.choreographyFlags && couple.choreographyFlags.map(flag => (
                          <span key={flag.danceID} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium">
                            ⚠ {flag.danceName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminViolationsPage