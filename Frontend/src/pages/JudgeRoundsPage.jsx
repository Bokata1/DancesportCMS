import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

function JudgeRoundsPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('judgeSession')
    if (!stored) {
      navigate('/judge/login')
      return
    }
    const parsed = JSON.parse(stored)
    setSession(parsed)

    api.judge.getActiveRounds(parsed.userID)
      .then(data => setRounds(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('judgeSession')
    navigate('/judge/login')
  }

  if (loading || !session) return <p className="text-zinc-500">Зареждане...</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm text-zinc-500 mb-1">Добре дошли,</p>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {session.fName} {session.lName}
          </h1>
          {session.judgeLicense && (
            <p className="text-sm text-zinc-500 mt-1">Лиценз: {session.judgeLicense}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-zinc-600 hover:text-burgundy-900"
        >
          Изход
        </button>
      </div>

      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
        Активни кръгове
      </h2>

      {rounds.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500 mb-2">Не сте избран за съдийстване.</p>
          <p className="text-sm text-zinc-400">
            Очаквайте кръговете за съдийство :.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map(r => (
            <Link to={session.isRulesJudge ? `/judge/rules/${r.roundID}` : `/judge/rounds/${r.roundID}`}>
              <p className="text-sm text-zinc-500 mb-1">{r.tournamentName}</p>
              <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                {r.categoryName} — {ROUND_TYPE_LABELS[r.roundType] || r.roundType}
              </h3>
              <div className="flex items-center justify-end text-sm text-burgundy-900 font-medium">
                Оценяване →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default JudgeRoundsPage