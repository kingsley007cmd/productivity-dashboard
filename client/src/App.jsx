import { useState, useEffect } from 'react'
import Header from './components/Header'
import KpiCards from './components/KpiCards'
import TaskTable from './components/TaskTable'
import TrendChart from './components/TrendChart'
import AssigneeChart from './components/AssigneeChart'
import DateRangePicker from './components/DateRangePicker'
import TaskModal from './components/TaskModal'
import ConfirmDialog from './components/ConfirmDialog'
import ToastContainer, { toast } from './components/ToastContainer'
import { subDays, format } from 'date-fns'
import { Plus } from 'lucide-react'

export default function App() {
  const [darkMode, setDarkMode]   = useState(() => localStorage.getItem('darkMode') === 'true')
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end:   format(new Date(), 'yyyy-MM-dd')
  })

  const [modalOpen, setModalOpen]       = useState(false)
  const [editingTask, setEditingTask]   = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => { fetchTasks() }, [dateRange])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/tasks?start=${dateRange.start}&end=${dateRange.end}`)
      const data = await res.json()
      setTasks(data)
    } catch {
      toast.error('Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  // ── Add / Edit ─────────────────────────────────────────────────────────────
  const handleOpenAdd  = () => { setEditingTask(null); setModalOpen(true) }
  const handleOpenEdit = (task) => { setEditingTask(task); setModalOpen(true) }

  const handleSave = (saved, isEdit) => {
    if (isEdit) {
      setTasks(ts => ts.map(t => t.id === saved.id ? saved : t))
      toast.success('Task updated!')
    } else {
      setTasks(ts => [...ts, saved])
      toast.success('Task added!')
    }
  }

  // ── Quick Complete Toggle ──────────────────────────────────────────────────
  const handleQuickComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const res  = await fetch(`/api/tasks/${task.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus })
      })
      const updated = await res.json()
      setTasks(ts => ts.map(t => t.id === updated.id ? updated : t))
      toast.success(newStatus === 'completed' ? '✅ Task marked complete!' : 'Task marked as pending.')
    } catch {
      toast.error('Failed to update task.')
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleOpenDelete = (task) => setDeletingTask(task)

  const handleConfirmDelete = async () => {
    setDeleteLoading(true)
    try {
      await fetch(`/api/tasks/${deletingTask.id}`, { method: 'DELETE' })
      setTasks(ts => ts.filter(t => t.id !== deletingTask.id))
      toast.success(`"${deletingTask.title}" deleted.`)
      setDeletingTask(null)
    } catch {
      toast.error('Failed to delete task.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const kpi = {
    total:      tasks.length,
    completed:  tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue:    tasks.filter(t => t.status === 'overdue').length,
  }

  return (
    <div className="min-h-screen">
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition-colors"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* KPI Cards */}
        <KpiCards kpi={kpi} loading={loading} />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Task Completion Trend</h2>
            <TrendChart tasks={tasks} dateRange={dateRange} />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-1">Workload by Assignee</h2>
            <p className="text-xs text-gray-400 mb-2">Who has the most tasks?</p>
            <AssigneeChart tasks={tasks} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">All Tasks</h2>
            <span className="text-xs text-gray-400">☑ to complete · hover row to edit/delete</span>
          </div>
          <TaskTable
            tasks={tasks}
            loading={loading}
            onRefresh={fetchTasks}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onQuickComplete={handleQuickComplete}
          />
        </div>
      </main>

      {/* Modals */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
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

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
