import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ task, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-100 dark:bg-red-950 text-red-500 p-2 rounded-xl">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-lg font-semibold">Delete Task</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">"{task?.title}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
