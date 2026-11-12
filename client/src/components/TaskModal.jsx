import { useState, useEffect } from 'react'
import { X, UserPlus, Users } from 'lucide-react'
import ManageMembersModal from './ManageMembersModal'

const EMPTY_FORM = {
  title: '', assignee: '', status: 'pending',
  priority: 'medium', due_date: '', estimated_hours: ''
}

export default function TaskModal({ task, projectId, projects = [], onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Quick inline add member
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  // Full manage members modal
  const [manageMembersOpen, setManageMembersOpen] = useState(false)

  const isEdit = Boolean(task?.id)

  const fetchMembers = async () => {
    try {
      const url = projectId ? `/api/members?project_id=${projectId}` : '/api/members'
      const res = await fetch(url)
      const data = await res.json()
      setMembers(data)
    } catch (err) {
      console.error('Failed to load members:', err)
    } finally {
      setLoadingMembers(false)
    }
  }

  useEffect(() => {
    fetchMembers()
    if (task) {
      setForm({ ...EMPTY_FORM, ...task, estimated_hours: task.estimated_hours ?? '' })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [task, projectId])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleQuickAddMember = async (e) => {
    e.preventDefault()
    if (!newMemberName.trim()) return
    setAddingMember(true)
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMemberName.trim(),
          all_projects: !projectId, // all if no project, or specific
          project_ids: projectId ? [Number(projectId)] : []
        })
      })
      if (!res.ok) throw new Error('Failed to add member')
      const created = await res.json()
      await fetchMembers()
      setForm(f => ({ ...f, assignee: created.name }))
      setNewMemberName('')
      setShowQuickAdd(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingMember(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.assignee.trim() || !form.due_date) {
      setError('Title, Assignee and Due Date are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        project_id: projectId ?? form.project_id ?? null,
        estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
      }
      const url = isEdit ? `/api/tasks/${task.id}` : '/api/tasks'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to save task')
      const saved = await res.json()
      onSave(saved, isEdit)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-base font-semibold">{isEdit ? 'Edit Task' : 'Add New Task'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Refactor auth module"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Assignee Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">
                  Assignee <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(v => !v)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <UserPlus size={12} /> {showQuickAdd ? 'Hide' : '+ Add Name'}
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <button
                    type="button"
                    onClick={() => setManageMembersOpen(true)}
                    className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-0.5"
                  >
                    <Users size={12} /> Manage
                  </button>
                </div>
              </div>

              {/* Quick Add Name Row */}
              {showQuickAdd && (
                <div className="mb-2 p-2.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex gap-1.5">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    placeholder="New member name..."
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={addingMember || !newMemberName.trim()}
                    onClick={handleQuickAddMember}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    {addingMember ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}

              {/* Member Selection Dropdown */}
              {members.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    name="assignee"
                    value={form.assignee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose a team member --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} {m.all_projects ? '' : '(Project Member)'}
                      </option>
                    ))}
                  </select>

                  {/* Quick Select Avatars / Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {members.map(m => {
                      const isSelected = form.assignee === m.name
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, assignee: m.name }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-white/30 text-current flex items-center justify-center text-[10px] font-bold">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                          {m.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <input
                    name="assignee"
                    value={form.assignee}
                    onChange={handleChange}
                    placeholder="Type name (e.g. Alice)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-gray-400">
                    💡 Tip: Click <strong>"+ Add Name"</strong> above to save names so you never have to type them again!
                  </p>
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold capitalize border-2 transition-all ${
                      form.priority === p
                        ? p === 'high'
                          ? 'bg-red-500 border-red-500 text-white'
                          : p === 'medium'
                          ? 'bg-yellow-400 border-yellow-400 text-white'
                          : 'bg-gray-400 border-gray-400 text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Status + Due Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Estimated hours */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Estimated Hours <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <input
                type="number"
                name="estimated_hours"
                value={form.estimated_hours}
                onChange={handleChange}
                placeholder="e.g. 2"
                min="0.5"
                max="99"
                step="0.5"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 px-3 py-2 rounded-xl">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Nested Manage Members Modal */}
      {manageMembersOpen && (
        <ManageMembersModal
          currentProjectId={projectId}
          projects={projects}
          onClose={() => setManageMembersOpen(false)}
          onMembersChange={fetchMembers}
        />
      )}
    </>
  )
}
