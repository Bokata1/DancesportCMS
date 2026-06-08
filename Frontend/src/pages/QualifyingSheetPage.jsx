import {useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

const ROUND_TYPE_LABELS = {
    QL: 'Квалификация',
    QF: 'Четвъртфинал',
    SF: 'Полуфинал'
}

function QualifyingSheetPage() {
    const { id: roundID } = useParams()
    const [sheet, setSheet] = useState(null)
    const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.rounds.getQualifyingSheet(roundID)
      .then(data => setSheet(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [roundID])

  if (loading) return <p className="text-zinc-500">Зареждане...</p>
  if (error) return <p className="text-red-600">Грешка: {error}</p>
  if (!sheet) return null

  const advancedCount = sheet.couples.filter(c => c.advanced).length
  const totalCouples = sheet.couples.length

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to="/tournaments"
        className="inline-flex items-center text-sm text-zinc-600 hover:text-burgundy-900 mb-6"
      >
        ← Назад към страницата с турнири
      </Link>

      <div className="mb-8">
        <p className="text-sm text-zinc-500 mb-1">{sheet.tournamentName}</p>
        <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
          {sheet.categoryName} — {ROUND_TYPE_LABELS[sheet.roundType] || sheet.roundType}
        </h1>
        <p className="text-zinc-600">
          {advancedCount} от {totalCouples} двойки които продължават напред
          {sheet.couplesToAdvance && ` (от ${sheet.couplesToAdvance} необходими)`}
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th rowSpan="2" className="text-left px-4 py-3 text-sm font-semibold text-zinc-700 border-r border-zinc-200">
                №
              </th>
              {sheet.dances.map(d => (
                <th
                  key={d.danceID}
                  className="text-center px-4 py-2 text-sm font-semibold text-zinc-700 border-r border-zinc-200"
                >
                  {d.danceName}
                </th>
              ))}
              <th rowSpan="2" className="text-center px-4 py-3 text-sm font-semibold text-zinc-700 border-r border-zinc-200">
                Общ брой хиксове
              </th>
              <th rowSpan="2" className="text-center px-4 py-3 text-sm font-semibold text-zinc-700">
                Статус
              </th>
            </tr>
            <tr className="border-b border-zinc-200">
              {sheet.dances.map(d => (
                <th
                  key={`sub-${d.danceID}`}
                  className="text-center px-4 py-1 text-xs font-normal text-zinc-500 border-r border-zinc-200"
                >
                  Хиксове
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.couples.map(couple => (
              <tr
                key={couple.registrationID}
                className={`border-b border-zinc-100 last:border-0 ${
                  couple.advanced ? 'bg-green-50/30' : ''
                }`}
              >
                <td className="px-4 py-3 font-semibold text-zinc-900 border-r border-zinc-100">
                  {couple.startNumber}
                </td>
                {couple.danceCrosses.map(dc => (
                  <td
                    key={dc.danceID}
                    className="text-center px-4 py-3 text-zinc-700 border-r border-zinc-100"
                  >
                    {dc.crossCount}
                  </td>
                ))}
                <td className="text-center px-4 py-3 font-semibold text-zinc-900 border-r border-zinc-100">
                  {couple.totalCrosses}
                </td>
                <td className="text-center px-4 py-3">
                  {couple.advanced ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                      ✓ Продължава
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-100 text-zinc-600 rounded text-sm">
                      Отпаднал
                  </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default QualifyingSheetPage
