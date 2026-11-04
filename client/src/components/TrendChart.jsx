import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { eachDayOfInterval, format, parseISO } from 'date-fns'

export default function TrendChart({ tasks, dateRange }) {
  const data = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return []

    const days = eachDayOfInterval({
      start: parseISO(dateRange.start),
      end: parseISO(dateRange.end)
    })

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTasks = tasks.filter(t => t.due_date === dayStr)
      return {
        date: format(day, 'MMM d'),
        completed: dayTasks.filter(t => t.status === 'completed').length,
        pending:   dayTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length,
        overdue:   dayTasks.filter(t => t.status === 'overdue').length,
      }
    })
  }, [tasks, dateRange])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400">No data</div>
  }

  // Show only every Nth label to avoid crowding
  const tickInterval = Math.max(1, Math.floor(data.length / 10))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          interval={tickInterval}
          stroke="currentColor"
          className="opacity-50"
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="opacity-50" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tw-bg-opacity, #fff)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '12px'
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="pending"   stroke="#eab308" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="overdue"   stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
