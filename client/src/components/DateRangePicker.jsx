import { CalendarDays } from 'lucide-react'

export default function DateRangePicker({ dateRange, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
      <CalendarDays size={16} className="text-gray-400" />
      <input
        type="date"
        value={dateRange.start}
        onChange={e => onChange(r => ({ ...r, start: e.target.value }))}
        className="bg-transparent text-sm focus:outline-none"
      />
      <span className="text-gray-400">→</span>
      <input
        type="date"
        value={dateRange.end}
        onChange={e => onChange(r => ({ ...r, end: e.target.value }))}
        className="bg-transparent text-sm focus:outline-none"
      />
    </div>
  )
}
