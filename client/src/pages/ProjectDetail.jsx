import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Moon, Sun, Plus, Pencil } from 'lucide-react'
import KpiCards    from '../components/KpiCards'
import TaskTable   from '../components/TaskTable'
import TrendChart  from '../components/TrendChart'
import TaskModal   from '../components/TaskModal'
import ConfirmDialog from '../components/ConfirmDialog'
import DateRangePicker from '../components/DateRangePicker'
import { toast }   from '../components/ToastContainer'
import { subDays, format } from 'date-fns'

export default function ProjectDetail({ project, darkMode, onToggleDark, onBack }) {
  const [tasks,      setTasks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [dateRange,  setDateRange]  = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end:   format(new Date(), 'yyyy-MM-dd'),
  })
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editingTask,  setEditingTask]  = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/tasks?project_id=${project.id}&start=${dateRange.start}&end=${dateRange.end}`
      )
      setTasks(await res.json())
    } catch { toast.error('Failed to load tasks.') }
    setLoading(false)
  }, [project.id, dateRange])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setTasks(ts => ts.map(t => t.id === saved.id ? saved : t))
      toast.success('Task updated!')
    } else {
      setTasks(ts => [...ts, saved])
      toast.success('Task added!')
    }
  }

  const handleQuickComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
      toast.success(newStatus === 'completed' ? '✅ Task complete!' : 'Marked as pending.')
    } catch { toast.error('Update failed.') }
  }

  const handleConfirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await fetch(`/api/tasks/${deletingTask.id}`, { method: 'DELETE' })
      setTasks(ts => ts.filter(t => t.id !== deletingTask.id))
      toast.success(`"${deletingTask.title}" deleted.`)
      setDeletingTask(null)
    } catch { toast.error('Delete failed.') }
    setDeleteLoading(false)
  }

  const kpi = {
    total:      tasks.length,
    completed:  tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue:    tasks.filter(t => t.status === 'overdue').length,
  }

  return (
    <div className="dashboard-bg min-h-screen">
      {/* Header */}
      <header className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingTask(null); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
          >
            <Plus size={15} /> Add Task
          </button>
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700 backdrop-blur-sm transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="px-6 pb-8 space-y-5">
        {/* Date range */}
        <div className="flex justify-end">
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
        </div>

        {/* KPIs */}
        <KpiCards kpi={kpi} loading={loading} />

        {/* Chart */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Task Completion Trend</h2>
          <TrendChart tasks={tasks} dateRange={dateRange} />
        </div>

        {/* Table */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">All Tasks</h2>
            <span className="text-xs text-gray-400">☑ to complete · hover to edit/delete</span>
          </div>
          <TaskTable
            tasks={tasks}
            loading={loading}
            onRefresh={fetchTasks}
            onEdit={t => { setEditingTask(t); setModalOpen(true) }}
            onDelete={setDeletingTask}
            onQuickComplete={handleQuickComplete}
          />
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          projectId={project.id}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
      {deletingTask && (
        <ConfirmDialog
          task={deletingTask}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTask(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
