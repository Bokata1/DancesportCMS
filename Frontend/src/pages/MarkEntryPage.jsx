import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'

const ROUND_TYPE_LABELS = {
  QL: 'Квалификация',
  QF: 'Четвъртфинал',
  SF: 'Полуфинал',
  FN: 'Финал',
}

function MarkEntryPage() {
  const { id: roundID } = useParams()
  const navigate = useNavigate()

  const [judgeSession, setJudgeSession] = useState(null)
  const [round, setRound] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentDanceIndex, setCurrentDanceIndex] = useState(0)
  const [marks, setMarks] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submittedDances, setSubmittedDances] = useState(new Set())

  useEffect(() => {
    const stored = sessionStorage.getItem('judgeSession')
    if (!stored) {
      navigate('/judge/login')
      return
    }
    setJudgeSession(JSON.parse(stored))

    api.rounds.getForJudging(roundID)
      .then(data => setRound(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [roundID, navigate])

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>
  if (!round || !judgeSession) return null

  const currentDance = round.dances[currentDanceIndex]
  const isFinal = round.roundType === 'FN'
  const totalCouples = round.couples.length
  const placesNeeded = isFinal ? totalCouples : (round.couplesToAdvance || 0)

  const handlePlaceClick = (registrationID, place) => {
  setMarks(prev => {
    const updated = { ...prev }

    if (isFinal) {
      Object.keys(updated).forEach(rid => {
        if (updated[rid] === place && rid !== String(registrationID)) {
          delete updated[rid]
        }
      })
    }

    if (updated[registrationID] === place) {
      delete updated[registrationID]
    } else {
      if (!isFinal && Object.keys(updated).length >= placesNeeded) {
        return prev  
      }
      updated[registrationID] = place
    }

    return updated
  })
}

  const placedCount = Object.keys(marks).length
  const isComplete = isFinal
    ? placedCount === totalCouples
    : placedCount === placesNeeded

  const handleSubmit = async () => {
    if (!isComplete) return

    setSubmitting(true)
    setError(null)

    const marksArray = isFinal
      ? Object.entries(marks).map(([rid, place]) => ({
          registrationID: Number(rid),
          markValue: place,
        }))
      : Object.keys(marks).map(rid => ({
          registrationID: Number(rid),
          markValue: 1,
        }))

    try {
      await api.rounds.submitMarks({
        roundID: Number(roundID),
        danceID: currentDance.danceID,
        judgeUserID: judgeSession.userID,
        pin: judgeSession.pin,
        marks: marksArray,
      })

      setSubmittedDances(prev => new Set([...prev, currentDance.danceID]))
      setMarks({})
    } catch (err) {
      setError(err.message || 'Грешка при изпращане на оценки')
    } finally {
      setSubmitting(false)
    }
  }

  const goToNextDance = () => {
    if (currentDanceIndex < round.dances.length - 1) {
      setCurrentDanceIndex(currentDanceIndex + 1)
      setMarks({})
      setError(null)
    }
  }

  const goToPrevDance = () => {
    if (currentDanceIndex > 0) {
      setCurrentDanceIndex(currentDanceIndex - 1)
      setMarks({})
      setError(null)
    }
  }

  const isDanceSubmitted = submittedDances.has(currentDance.danceID)
  const allDancesSubmitted = submittedDances.size === round.dances.length

  if (allDancesSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2">
          Успех!
        </h1>
        <p className="text-zinc-600 mb-8">
          Успешно оценихте  всички танци в този кръг.
        </p>
        <Link
          to="/judge/rounds"
          className="inline-block px-6 py-3 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
        >
          Към следващите кръгове
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/judge/rounds"
        className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6"
      >
        ← Назад
      </Link>

      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-1">{round.tournamentName}</p>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {round.categoryName} — {ROUND_TYPE_LABELS[round.roundType]}
        </h1>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Танц {currentDanceIndex + 1} от {round.dances.length}
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              {currentDance.danceName}
            </h2>
          </div>

          <div className="flex gap-1">
            {round.dances.map((d, i) => (
              <div
                key={d.danceID}
                className={`w-3 h-3 rounded-full ${
                  submittedDances.has(d.danceID)
                    ? 'bg-green-500'
                    : i === currentDanceIndex
                    ? 'bg-burgundy-900'
                    : 'bg-zinc-300'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-sm text-zinc-600">
          {isFinal
            ? `Поставете място (1-${totalCouples}) за всяка двойка.Повтарянето на места не е позволено.`
            : `Изберете ${placesNeeded} двойки който продължават.`}
        </p>
      </div>

      {isDanceSubmitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-6">
          <p className="text-green-800 font-medium mb-3">
            ✓ Оценките за {currentDance.danceName} бяха успешно изпратени!
          </p>
          {currentDanceIndex < round.dances.length - 1 ? (
            <button
              onClick={goToNextDance}
              className="px-5 py-2 bg-burgundy-900 text-white rounded-lg font-medium hover:bg-burgundy-800"
            >
              Към следващия танц →
            </button>
          ) : (
            <p className="text-sm text-green-700">Край - Последен Танц</p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-6">
  {(() => {
    const hasHeats = round.couples.some(c => c.heatNumber != null)

    if (!hasHeats) {
      return (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          {round.couples.map(c => (
            <CoupleRow
              key={c.registrationID}
              couple={c}
              isFinal={isFinal}
              totalPlaces={totalCouples}
              currentMark={marks[c.registrationID]}
              marks={marks}
              onPlaceClick={handlePlaceClick}
            />
          ))}
        </div>
      )
    }

    const heatGroups = round.couples.reduce((acc, c) => {
      const h = c.heatNumber ?? 0
      if (!acc[h]) acc[h] = []
      acc[h].push(c)
      return acc
    }, {})

    const heatNumbers = Object.keys(heatGroups).map(Number).sort((a, b) => a - b)

    return (
      <div className="space-y-5">
        {heatNumbers.map(heatNum => (
          <div key={heatNum}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-burgundy-900 uppercase tracking-wider">
                Серия {heatNum}
              </span>
              <span className="text-xs text-zinc-400">
                ({heatGroups[heatNum].length} двойки)
              </span>
            </div>
            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              {heatGroups[heatNum].map(c => (
                <CoupleRow
                  key={c.registrationID}
                  couple={c}
                  isFinal={isFinal}
                  totalPlaces={totalCouples}
                  currentMark={marks[c.registrationID]}
                  marks={marks}
                  onPlaceClick={handlePlaceClick}
                />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>


          {error && (
            <div className="text-sm text-red-600 mb-4">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isComplete || submitting}
            className="w-full h-14 bg-burgundy-900 text-white rounded-lg text-lg font-medium hover:bg-burgundy-800 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting
              ? 'Изпращане на оценки...'
              : isComplete
              ? `Изпратете оценките за ${currentDance.danceName}`
              : `Поставете ${placesNeeded - placedCount} още`}
          </button>
        </>
      )}

      <div className="flex justify-between mt-6 text-sm">
        {currentDanceIndex > 0 ? (
          <button
            onClick={goToPrevDance}
            className="text-zinc-600 hover:text-burgundy-900"
          >
            ← Предишен танц
          </button>
        ) : <div />}

        {currentDanceIndex < round.dances.length - 1 && isDanceSubmitted && (
          <button
            onClick={goToNextDance}
            className="text-burgundy-900 font-medium"
          >
            Следващ танц →
          </button>
        )}
      </div>
    </div>
  )
}

function CoupleRow({ couple, isFinal, totalPlaces, currentMark, marks, onPlaceClick }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-zinc-100 last:border-0">
      <div className="text-2xl font-bold text-zinc-900 w-16">
        {couple.startNumber}
      </div>

      <div className="flex flex-wrap gap-2 flex-1 justify-end">
        {isFinal ? (
          [...Array(totalPlaces)].map((_, i) => {
            const place = i + 1
            const isSelected = currentMark === place
            const isUsedByOther = Object.entries(marks).some(
              ([rid, p]) => p === place && Number(rid) !== couple.registrationID
            )

            return (
              <button
                key={place}
                onClick={() => onPlaceClick(couple.registrationID, place)}
                disabled={isUsedByOther}
                className={`w-12 h-12 rounded-lg border-2 font-semibold text-lg transition-all ${
                  isSelected
                    ? 'bg-burgundy-900 border-burgundy-900 text-white'
                    : isUsedByOther
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-white border-zinc-300 text-zinc-700 hover:border-burgundy-900 hover:text-burgundy-900'
                }`}
              >
                {place}
              </button>
            )
          })
        ) : (
          <button
            onClick={() => onPlaceClick(couple.registrationID, 1)}
            className={`px-6 h-12 rounded-lg border-2 font-medium transition-all ${
              currentMark
                ? 'bg-burgundy-900 border-burgundy-900 text-white'
                : 'bg-white border-zinc-300 text-zinc-700 hover:border-burgundy-900'
            }`}
          >
            {currentMark ? '✓ Продължава' : 'Маркиране'}
          </button>
        )}
      </div>
    </div>
  )
}

export default MarkEntryPage