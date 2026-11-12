import { Folder, Pencil, Trash2 } from 'lucide-react'

export default function ProjectRow({ project, onClick, onEdit, onDelete }) {
  const { name, totalTasks, completed, inProgress, overdue, color } = project

  return (
    <div
      onClick={onClick}
      className="group flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-gray-900 cursor-pointer transition-all border border-white/60 dark:border-gray-700/60"
    >
      {/* Left: icon + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color + '25' }}
        >
          <Folder size={18} style={{ color }} />
        </div>
        <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{name}</span>
      </div>

      {/* Right: stats + actions */}
      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
          Total Tasks: <strong className="text-gray-700 dark:text-gray-200">{totalTasks}</strong>
        </span>

        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700">
          Completed: {completed}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
          In Progress: {inProgress}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-700">
          Overdue: {overdue}
        </span>

        {/* Action buttons - visible on hover */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
            title="Edit project"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
            title="Delete project"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
