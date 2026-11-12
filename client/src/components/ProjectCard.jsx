import { Folder, Pencil, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

export default function ProjectCard({ project, onClick, onEdit, onDelete }) {
  const { name, totalTasks, completed, inProgress, overdue, color, created_at } = project
  const pct = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0

  return (
    <div
      onClick={onClick}
      className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-900 cursor-pointer transition-all border border-white/60 dark:border-gray-700/60 flex flex-col gap-4"
    >
      {/* Action buttons */}
      <div
        className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '25' }}
        >
          <Folder size={20} style={{ color }} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-800 dark:text-gray-100 truncate pr-10">{name}</p>
          <p className="text-xs text-gray-400">{totalTasks} task{totalTasks !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span className="font-medium" style={{ color }}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-green-50 dark:bg-green-900/30 rounded-xl py-2">
          <p className="text-lg font-bold text-green-600">{completed}</p>
          <p className="text-xs text-green-500">Done</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl py-2">
          <p className="text-lg font-bold text-blue-600">{inProgress}</p>
          <p className="text-xs text-blue-500">Active</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 rounded-xl py-2">
          <p className="text-lg font-bold text-red-500">{overdue}</p>
          <p className="text-xs text-red-400">Late</p>
        </div>
      </div>
    </div>
  )
}
