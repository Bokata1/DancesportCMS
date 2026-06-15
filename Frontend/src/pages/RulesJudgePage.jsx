import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

function RulesJudgePage() {
  const { roundID } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState({})

  const session = JSON.parse(
    sessionStorage.getItem('judgeSession') ||
    sessionStorage.getItem('userSession') ||
    'null'
  )

  useEffect(() => {
    if (!session || !session.isRulesJudge) {
      navigate('/judge')
      return
    }
    load()
  }, [roundID])

  const load = () => {
    setLoading(true)
    api.rulesViolations.getRoundView(roundID)
      .then(result => setData(result))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const toggleFlag = async (registrationID, flagType, danceID = null) => {
    if (!data) return

    const key = `${registrationID}-${flagType}-${danceID ?? 'none'}`
    setSaving(prev => ({ ...prev, [key]: true }))

    try {
      await api.rulesViolations.toggle({
        tournamentID: data.tournamentID,
        roundID: Number(roundID),
        categoryID: data.categoryID,
        registrationID,
        flagType,
        danceID,
        flaggedBy: session.userID,
      })
      const updated = await api.rulesViolations.getRoundView(roundID)
      setData(updated)
    } catch (err) {
      alert('Грешка: ' + err.message)
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  if (loading) return <p className="text-zinc-500 text-center py-12">Зареждане...</p>
  if (error) return <p className="text-red-600 text-center py-12">Грешка: {error}</p>
  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to="/tournaments" className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6">
        ← Назад към турнирите
      </Link>

      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-1">{data.tournamentName}</p>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">
          {data.categoryName}
        </h1>
        <p className="text-zinc-600">Маркиране на нарушения</p>
      </div>

      <div className="bg-burgundy-50 border border-burgundy-200 rounded-lg p-4 mb-6 text-sm text-zinc-700">
        <p className="mb-2 font-medium">Инструкции:</p>
        <ul className="space-y-1 ml-4">
          <li>• <strong>Костюм</strong> — едно нарушение за двойката в целия кръг</li>
          <li>• <strong>Хореография</strong> — отделно нарушение за всеки танц</li>
          <li>• Кликнете върху иконата за маркиране, кликнете отново за премахване</li>
        </ul>
      </div>

      {!data.couples || data.couples.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-8 text-center">
          <p className="text-zinc-500">Няма двойки в този кръг.</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider min-w-[100px]">
                    Костюми
                  </th>
                  {data.dances && data.dances.map(d => (
                    <th key={d.danceID} className="px-3 py-3 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wider min-w-[80px]">
                      {d.danceName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.couples.map(couple => {
                  const costumeKey = `${couple.registrationID}-Costume-none`
                  return (
                    <tr key={couple.registrationID} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <span className="text-lg font-semibold text-zinc-900">
                          {couple.startNumber}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => toggleFlag(couple.registrationID, 'Costume')}
                          disabled={saving[costumeKey]}
                          className={`w-12 h-12 rounded-lg font-bold text-xl transition-all ${
                            couple.hasCostumeFlag
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                              : 'bg-zinc-100 text-zinc-300 hover:bg-zinc-200'
                          } disabled:opacity-50`}
                        >
                          {couple.hasCostumeFlag ? '⚠' : '○'}
                        </button>
                      </td>
                      {data.dances && data.dances.map(dance => {
                        const danceKey = `${couple.registrationID}-Choreography-${dance.danceID}`
                        const isFlagged = couple.choreographyDanceIDs && couple.choreographyDanceIDs.includes(dance.danceID)
                        return (
                          <td key={dance.danceID} className="px-3 py-3 text-center">
                            <button
                              onClick={() => toggleFlag(couple.registrationID, 'Choreography', dance.danceID)}
                              disabled={saving[danceKey]}
                              className={`w-12 h-12 rounded-lg font-bold text-xl transition-all ${
                                isFlagged
                                  ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                                  : 'bg-zinc-100 text-zinc-300 hover:bg-zinc-200'
                              } disabled:opacity-50`}
                            >
                              {isFlagged ? '⚠' : '○'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-zinc-500 text-center">
        *Нарушенията се запазват автоматично.
      </div>
    </div>
  )
}

export default RulesJudgePage