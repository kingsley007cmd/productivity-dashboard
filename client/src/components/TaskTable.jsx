import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, RefreshCw, Pencil, Trash2, Download } from 'lucide-react'
import { toast } from './ToastContainer'

const STATUS_STYLES = {
  'completed':  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'in-progress':'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'overdue':    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'pending':    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function TaskTable({ tasks, loading, onRefresh, onEdit, onDelete, onQuickComplete }) {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort]                 = useState({ col: 'due_date', dir: 'asc' })

  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.assignee.toLowerCase().includes(search.toLowerCase())
        const matchStatus = statusFilter === 'all' || t.status === statusFilter
        return matchSearch && matchStatus
      })
      .sort((a, b) => {
        const av = a[sort.col] ?? ''
        const bv = b[sort.col] ?? ''
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sort.dir === 'asc' ? cmp : -cmp
      })
  }, [tasks, search, statusFilter, sort])

  const handleSort = (col) => {
    setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const SortIcon = ({ col }) => {
    if (sort.col !== col) return null
    return sort.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Assignee', 'Status', 'Priority', 'Due Date']
    const rows = filtered.map(t =>
      [t.id, `"${t.title}"`, t.assignee, t.status, t.priority, t.due_date].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'tasks.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filtered.length} tasks to CSV!`)
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search tasks or assignee..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="overdue">Overdue</option>
          <option value="pending">Pending</option>
        </select>
        <button
          onClick={onRefresh}
          className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm flex items-center gap-1 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
        <button
          onClick={exportCSV}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              {[
                { label: 'Title',    col: 'title' },
                { label: 'Assignee', col: 'assignee' },
                { label: 'Status',   col: 'status' },
                { label: 'Priority', col: 'priority' },
                { label: 'Due Date', col: 'due_date' },
              ].map(({ label, col }) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3 text-left cursor-pointer hover:text-gray-900 dark:hover:text-white select-none"
                >
                  <span className="flex items-center gap-1">{label} <SortIcon col={col} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  No tasks found.
                </td>
              </tr>
            ) : filtered.map(task => (
              <tr
                key={task.id}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                {/* Quick complete checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onQuickComplete(task)}
                    title={task.status === 'completed' ? 'Mark as pending' : 'Mark as complete'}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </td>

                <td className={`px-4 py-3 font-medium max-w-xs truncate ${
                  task.status === 'completed' ? 'line-through text-gray-400' : ''
                }`}>{task.title}</td>

                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{task.assignee}</td>

                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[task.status] || ''}`}>
                    {task.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className={`font-semibold text-xs uppercase tracking-wide ${
                    task.priority === 'high'   ? 'text-red-500' :
                    task.priority === 'medium' ? 'text-yellow-500' : 'text-gray-400'
                  }`}>
                    {task.priority === 'high' ? '▲▲▲' : task.priority === 'medium' ? '▲▲' : '▲'} {task.priority}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{task.due_date}</td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(task)}
                      title="Edit task"
                      className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(task)}
                      title="Delete task"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-xs text-gray-400 text-right">
        Showing {filtered.length} of {tasks.length} tasks
      </p>
    </div>
  )
}
