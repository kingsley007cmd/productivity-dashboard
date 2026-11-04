import { useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export default function AssigneeChart({ tasks }) {
  const data = useMemo(() => {
    const counts = {}
    tasks.forEach(t => {
      counts[t.assignee] = (counts[t.assignee] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [tasks])

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} tasks`, name]}
          contentStyle={{
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            fontSize: '12px'
          }}
        />
        <Legend
          formatter={(value, entry) => (
            <span className="text-xs">{value} ({entry.payload.value})</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
