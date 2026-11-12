const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S']

function getColor(count) {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
  if (count === 1) return 'bg-teal-200 dark:bg-teal-800'
  if (count === 2) return 'bg-teal-300 dark:bg-teal-700'
  if (count === 3) return 'bg-teal-400 dark:bg-teal-600'
  return 'bg-teal-500 dark:bg-teal-500'
}

export default function WeeklyActivity({ data }) {
  // data: array of 6 weeks, each week is array of 6 days { date, count }
  const weeks = Array.isArray(data) && data.length === 6 ? data : Array(6).fill(Array(6).fill({ date: '', count: 0 }))

  const totalCompleted = weeks.flat().reduce((sum, d) => sum + (d.count || 0), 0)

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60 dark:border-gray-700/60">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800 dark:text-white">Weekly Activity</h2>
          <p className="text-xs text-gray-400 mt-0.5">{totalCompleted} tasks completed in 6 weeks</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-5" />
              {weeks.map((_, wi) => (
                <th
                  key={wi}
                  className="text-center text-xs text-gray-400 font-medium pb-2"
                  colSpan={1}
                >
                  Wk {wi + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAY_LABELS.map((day, di) => (
              <tr key={di}>
                <td className="text-xs text-gray-400 font-medium pr-2 py-0.5 w-5">{day}</td>
                {weeks.map((week, wi) => {
                  const cell = week[di] || { count: 0 }
                  return (
                    <td key={wi} className="p-0.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${getColor(cell.count)} transition-colors`}
                        title={cell.date ? `${cell.date}: ${cell.count} task${cell.count !== 1 ? 's' : ''} completed` : ''}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-400">Less</span>
        {['bg-gray-100 dark:bg-gray-800', 'bg-teal-200', 'bg-teal-300', 'bg-teal-400', 'bg-teal-500'].map((c, i) => (
          <div key={i} className={`w-4 h-4 rounded-md ${c}`} />
        ))}
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  )
}
