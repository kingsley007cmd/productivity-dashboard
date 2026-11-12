import { Clock } from 'lucide-react'

const PRIORITY_STYLE = {
  high:   'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300',
  medium: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300',
  low:    'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
}

export default function DueToday({ tasks, onComplete }) {
  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-white/60 dark:border-gray-700/60">
      <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
        Due Today{' '}
        {tasks.length > 0 && (
          <span className="ml-1 text-sm font-semibold text-blue-600 dark:text-blue-400">
            ({tasks.length})
          </span>
        )}
      </h2>

      {tasks.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-sm">Nothing due today!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-3">
              {/* Circular checkbox */}
              <button
                onClick={() => onComplete(task)}
                className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                title="Mark complete"
              />

              {/* Task name */}
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 font-medium">
                {task.title}
              </span>

              {/* Priority badge */}
              <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_STYLE[task.priority] || ''}`}>
                {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
              </span>

              {/* Time estimate */}
              {task.estimated_hours && (
                <span className="flex-shrink-0 flex items-center gap-0.5 text-xs text-gray-400">
                  <Clock size={11} />
                  {task.estimated_hours} hr{task.estimated_hours !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
