import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Moon, Sun, Search, ChevronDown, ArrowUpDown,
  LayoutGrid, LayoutList, FolderOpen
} from 'lucide-react'
import ProjectRow   from '../components/ProjectRow'
import ProjectCard  from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import DueToday     from '../components/DueToday'
import WeeklyActivity from '../components/WeeklyActivity'
import { toast } from '../components/ToastContainer'

const SORT_OPTIONS = [
  { label: 'Name (A–Z)',       key: 'name',        dir: 'asc'  },
  { label: 'Name (Z–A)',       key: 'name',        dir: 'desc' },
  { label: 'Most Tasks',       key: 'totalTasks',  dir: 'desc' },
  { label: 'Fewest Tasks',     key: 'totalTasks',  dir: 'asc'  },
  { label: 'Most Overdue',     key: 'overdue',     dir: 'desc' },
  { label: 'Recently Created', key: 'created_at',  dir: 'desc' },
]

const FILTER_OPTIONS = [
  { label: 'All Projects',     value: 'all'       },
  { label: 'Has Overdue',      value: 'overdue'   },
  { label: 'In Progress',      value: 'inprogress'},
  { label: 'All Completed',    value: 'done'      },
  { label: 'Empty Projects',   value: 'empty'     },
]

export default function Dashboard({ darkMode, onToggleDark, onOpenProject }) {
  const [projects,     setProjects]     = useState([])
  const [dueTasks,     setDueTasks]     = useState([])
  const [activity,     setActivity]     = useState([])
  const [loading,      setLoading]      = useState(true)

  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [sortIdx,      setSortIdx]      = useState(0)
  const [showAll,      setShowAll]      = useState(false)
  const [viewMode,     setViewMode]     = useState('list')   // 'list' | 'grid'
  const [showSort,     setShowSort]     = useState(false)
  const [showFilter,   setShowFilter]   = useState(false)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editingProj,  setEditingProj]  = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [pRes, dRes, aRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks/due-today'),
        fetch('/api/activity'),
      ])
      setProjects(await pRes.json())
      setDueTasks(await dRes.json())
      setActivity(await aRes.json())
    } catch { toast.error('Failed to load data.') }
    setLoading(false)
  }

  // ── Filtering + Sorting ───────────────────────────────────────────────────
  const processed = useMemo(() => {
    let list = [...projects]

    // Search
    if (search.trim()) {
      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    }

    // Filter
    if (filter === 'overdue')    list = list.filter(p => p.overdue > 0)
    if (filter === 'inprogress') list = list.filter(p => p.inProgress > 0)
    if (filter === 'done')       list = list.filter(p => p.totalTasks > 0 && p.completed === p.totalTasks)
    if (filter === 'empty')      list = list.filter(p => p.totalTasks === 0)

    // Sort
    const { key, dir } = SORT_OPTIONS[sortIdx]
    list.sort((a, b) => {
      const av = a[key] ?? ''
      const bv = b[key] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return dir === 'asc' ? cmp : -cmp
    })

    return list
  }, [projects, search, filter, sortIdx])

  const visible = showAll ? processed : processed.slice(0, 3)

  // ── Project CRUD ──────────────────────────────────────────────────────────
  const handleSaveProject = (saved, isEdit) => {
    if (isEdit) {
      setProjects(ps => ps.map(p => p.id === saved.id ? { ...p, ...saved } : p))
      toast.success('Project updated!')
    } else {
      setProjects(ps => [...ps, saved])
      toast.success('Project created!')
    }
  }

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete "${project.name}" and all its tasks?`)) return
    try {
      await fetch(`/api/projects/${project.id}`, { method: 'DELETE' })
      setProjects(ps => ps.filter(p => p.id !== project.id))
      toast.success(`"${project.name}" deleted.`)
    } catch { toast.error('Delete failed.') }
  }

  const handleQuickComplete = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      setDueTasks(ts => ts.filter(t => t.id !== task.id))
      if (newStatus === 'completed') {
        toast.success('✅ Task marked complete!')
        // refresh projects stats
        fetch('/api/projects').then(r => r.json()).then(setProjects)
        fetch('/api/activity').then(r => r.json()).then(setActivity)
      }
    } catch { toast.error('Update failed.') }
  }

  return (
    <div className="dashboard-bg min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-blue-500 rounded-sm w-2 h-2" />
            ))}
          </div>
          <span className="text-lg font-bold text-gray-800 dark:text-white">
            Productivity Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingProj(null); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors"
          >
            <Plus size={15} /> Add new Project
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

        {/* ── Projects toolbar ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mr-2">Projects</h2>

          <button
            onClick={() => setShowAll(v => !v)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium mr-auto"
          >
            {showAll ? 'Show Less' : `View All (${processed.length} Project${processed.length !== 1 ? 's' : ''})`}
          </button>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-8 pr-3 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/80 dark:border-gray-700 rounded-xl text-sm w-44 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowFilter(v => !v); setShowSort(false) }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/80 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-white dark:hover:bg-gray-700 transition-colors"
            >
              {FILTER_OPTIONS.find(f => f.value === filter)?.label}
              <ChevronDown size={14} />
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1">
                {FILTER_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilter(opt.value); setShowFilter(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${filter === opt.value ? 'text-blue-600 font-medium' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => { setShowSort(v => !v); setShowFilter(false) }}
              className="p-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/80 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors"
              title="Sort"
            >
              <ArrowUpDown size={16} />
            </button>
            {showSort && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1">
                {SORT_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setSortIdx(i); setShowSort(false) }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${sortIdx === i ? 'text-blue-600 font-medium' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List / Grid toggle */}
          <div className="flex bg-white/70 dark:bg-gray-800/70 border border-white/80 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-white dark:hover:bg-gray-700'}`}
              title="List view"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-white dark:hover:bg-gray-700'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        {/* ── Project List / Grid ──────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-white/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl p-10 text-center">
            <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {search || filter !== 'all' ? 'No projects match your search/filter.' : 'No projects yet. Create your first one!'}
            </p>
            {!search && filter === 'all' && (
              <button
                onClick={() => { setEditingProj(null); setModalOpen(true) }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus size={14} className="inline mr-1" /> Add new Project
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {visible.map(p => (
              <ProjectRow
                key={p.id}
                project={p}
                onClick={() => onOpenProject(p)}
                onEdit={() => { setEditingProj(p); setModalOpen(true) }}
                onDelete={() => handleDeleteProject(p)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onClick={() => onOpenProject(p)}
                onEdit={() => { setEditingProj(p); setModalOpen(true) }}
                onDelete={() => handleDeleteProject(p)}
              />
            ))}
          </div>
        )}

        {/* Show more/less */}
        {!loading && processed.length > 3 && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(v => !v)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showAll ? '▲ Show less' : `▼ Show all ${processed.length} projects`}
            </button>
          </div>
        )}

        {/* ── Bottom panels ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
          <DueToday tasks={dueTasks} onComplete={handleQuickComplete} />
          <WeeklyActivity data={activity} />
        </div>
      </main>

      {/* Project Modal */}
      {modalOpen && (
        <ProjectModal
          project={editingProj}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProject}
        />
      )}
    </div>
  )
}
