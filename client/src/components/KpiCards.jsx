import { CheckCircle, Clock, AlertTriangle, List } from 'lucide-react'

const cards = [
  { key: 'total',      label: 'Total Tasks',    icon: List,          color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950' },
  { key: 'completed', label: 'Completed',       icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
  { key: 'inProgress',label: 'In Progress',     icon: Clock,         color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  { key: 'overdue',   label: 'Overdue',         icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950' },
]

export default function KpiCards({ kpi, loading }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="bg-white dark:bg-gray-900 rounded-2xl shadow p-5 flex items-center gap-4">
          <div className={`${bg} ${color} p-3 rounded-xl`}>
            <Icon size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ) : kpi[key]}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
