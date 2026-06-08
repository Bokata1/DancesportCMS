import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

const STATUS_LABELS = {
  PN: { text: 'Чакащ', color: 'text-zinc-600', bg: 'bg-zinc-100', dot: 'bg-zinc-400' },
  AC: { text: 'Активен', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  CL: { text: 'Приключил', color: 'text-zinc-600', bg: 'bg-zinc-100', dot: 'bg-zinc-400' },
}

function AdminRoundPage() {
  const { id: roundID } = useParams()
  const navigate = useNavigate()

  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actioning, setActioning] = useState(false)

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

    loadProgress()
  }, [roundID, navigate])

  
  useEffect(() => {
    if (!progress || progress.status !== 'AC') return

    const interval = setInterval(loadProgress, 10000)
    return () => clearInterval(interval)
  }, [progress?.status])

  const loadProgress = () => {
    api.rounds.getProgress(roundID)
      .then(data => {
        setProgress(data)
        setError(null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleSetStatus = async (newStatus) => {
    if (!confirm(`Сигурни ли сте, че искате да смените статуса на ${newStatus}?`)) return

    setActioning(true)
    setError(null)

    try {
      await api.rounds.setStatus(roundID, newStatus)
      loadProgress()
    } catch (err) {
      setError(err.message || 'Грешка при смяна на статуса')
    } finally {
      setActioning(false)
    }
  }

  const handleFinalize = async () => {
    if (!confirm('Сигурни ли сте> Това действие ще финализира резултатите и ще приключи кръга. Действието не може да бъде отменено.')) return

    setActioning(true)
    setError(null)

      try {
    await api.rounds.finalize(roundID)
    if (progress.roundType === 'FN') {
      navigate(`/rounds/${roundID}/skating`)
    } else {
      navigate(`/admin/tournaments/${progress.tournamentID}`)
    }
    } catch (err) {
      setError(err.message || 'Грешка при финализиране')
      setActioning(false)
    }
}


  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error && !progress) return <p className="text-red-600">Грешка: {error}</p>
  if (!progress) return null

  const status = STATUS_LABELS[progress.status] || STATUS_LABELS.PN
  const percentComplete = progress.totalMarksExpected > 0
    ? Math.round((progress.totalMarksReceived / progress.totalMarksExpected) * 100)
    : 0
  const allJudgesComplete = progress.judges.every(j =>
    j.danceStatuses.every(d => d.isSubmitted)
  )

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to={`/admin/tournaments/${progress.tournamentID || ''}`}
        onClick={(e) => {
          if (!progress.tournamentID) {
            e.preventDefault()
            navigate(-1)
          }
        }}
        className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6"
      >
        ← Назад
      </Link>

      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-1">{progress.tournamentName}</p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          {progress.categoryName} — {ROUND_TYPE_LABELS[progress.roundType] || progress.roundType}
        </h1>
      </div>

      {}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Статус на кръга
        </h2>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.dot}`} />
            <span className="text-lg font-medium text-zinc-900">{status.text}</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {progress.status === 'PN' && (
              <button
                onClick={() => handleSetStatus('AC')}
                disabled={actioning}
                className="px-4 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300"
              >
                Активирай кръга
              </button>
            )}

            {progress.status === 'AC' && (
              <>
                <button
                  onClick={() => handleSetStatus('PN')}
                  disabled={actioning}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 disabled:bg-zinc-100"
                >
                  Върни към изчакващ
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={actioning || !allJudgesComplete}
                  className="px-4 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
                  title={!allJudgesComplete ? 'Изчакайте всички съдии да приключат' : ''}
                >
                  Финализация на резултатите
                </button>
              </>
            )}

            {progress.status === 'CL' && (
              <Link
                to={progress.roundType === 'FN'
                  ? `/rounds/${roundID}/skating`
                  : `/rounds/${roundID}/qualifying-sheet`}
                className="px-4 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
              >
                Виж резултатите →
              </Link>

            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>

      {}
      {progress.status !== 'PN' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Прогрес на оценяването
            </h2>
            <span className="text-sm text-zinc-600">
              {progress.totalMarksReceived} / {progress.totalMarksExpected} оценки ({percentComplete}%)
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-burgundy-900 transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      )}

      {}
      <div>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
          Съдии, прогрес за танците
        </h2>

        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-zinc-700">
                  Съдия
                </th>
                {progress.dances.map(d => (
                  <th
                    key={d.danceID}
                    className="text-center px-3 py-3 text-sm font-medium text-zinc-700"
                  >
                    {d.danceName}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-sm font-medium text-zinc-700">
                  Общо
                </th>
              </tr>
            </thead>
            <tbody>
              {progress.judges.map(j => {
                const submittedCount = j.danceStatuses.filter(d => d.isSubmitted).length
                const allDone = submittedCount === progress.dances.length

                return (
                  <tr
                    key={j.userID}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-zinc-900">{j.name}</p>
                        {j.judgeLicense && (
                          <p className="text-xs text-zinc-500">{j.judgeLicense}</p>
                        )}
                      </div>
                    </td>
                    {j.danceStatuses.map(d => (
                      <td key={d.danceID} className="text-center px-3 py-3">
                        {d.isSubmitted ? (
                          <span className="inline-block w-7 h-7 rounded-full bg-green-100 text-green-700 text-lg leading-7">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-block w-7 h-7 text-zinc-300 text-lg">
                            —
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="text-center px-3 py-3">
                      <span className={`text-sm font-medium ${
                        allDone ? 'text-green-700' : 'text-zinc-500'
                      }`}>
                        {submittedCount}/{progress.dances.length}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {progress.status === 'AC' && (
          <p className="text-sm text-zinc-500 mt-3 text-center">
            Обновяване
          </p>
        )}
      </div>
    </div>
  )
}

export default AdminRoundPage