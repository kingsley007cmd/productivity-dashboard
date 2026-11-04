import { Moon, Sun, LayoutDashboard } from 'lucide-react'

export default function Header({ darkMode, onToggleDark }) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <LayoutDashboard size={24} />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Productivity Dashboard
          </span>
        </div>
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  )
}
