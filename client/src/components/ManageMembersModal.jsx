import { useState, useEffect } from 'react'
import { X, UserPlus, Trash2, Users, Check, Globe, Folder } from 'lucide-react'

export default function ManageMembersModal({ currentProjectId, projects = [], onClose, onMembersChange }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [scope, setScope] = useState(currentProjectId ? 'this' : 'all') // 'all' | 'this' | 'custom'
  const [selectedProjects, setSelectedProjects] = useState(currentProjectId ? [Number(currentProjectId)] : [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members')
      const data = await res.json()
      setMembers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Member name is required')
      return
    }
    setError('')
    setSaving(true)

    let all_projects = false
    let project_ids = []

    if (scope === 'all') {
      all_projects = true
    } else if (scope === 'this') {
      all_projects = false
      project_ids = currentProjectId ? [Number(currentProjectId)] : []
    } else {
      all_projects = false
      project_ids = selectedProjects
    }

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), all_projects, project_ids })
      })
      if (!res.ok) throw new Error('Failed to create member')
      setName('')
      await fetchMembers()
      if (onMembersChange) onMembersChange()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (id, memberName) => {
    if (!window.confirm(`Remove "${memberName}" from members?`)) return
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE' })
      setMembers(m => m.filter(x => x.id !== id))
      if (onMembersChange) onMembersChange()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleProject = (pId) => {
    setSelectedProjects(prev =>
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    )
  }

  const currentProjectName = projects.find(p => p.id === Number(currentProjectId))?.name

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Users size={20} />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Manage Team Members</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Add New Member</h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter member name (e.g. Sarah Connor)"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <UserPlus size={15} /> Add
              </button>
            </div>

            {/* Scope Selection */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Assign to:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
                    scope === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 font-medium'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Globe size={13} /> All Projects
                </button>

                {currentProjectId && (
                  <button
                    type="button"
                    onClick={() => setScope('this')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
                      scope === 'this'
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Folder size={13} /> Only "{currentProjectName || 'This Project'}"
                  </button>
                )}

                {projects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setScope('custom')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all ${
                      scope === 'custom'
                        ? 'bg-blue-600 text-white border-blue-600 font-medium'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Custom Projects...
                  </button>
                )}
              </div>

              {scope === 'custom' && (
                <div className="pt-2 grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                  {projects.map(p => {
                    const checked = selectedProjects.includes(p.id)
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                          checked
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 font-medium'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProject(p.id)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="truncate">{p.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
          </form>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Existing Members ({members.length})
              </h3>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No members saved yet. Add your team names above to pick them easily in tasks!
              </p>
            ) : (
              <div className="space-y-2">
                {members.map(member => {
                  const assignedProjectNames = member.all_projects
                    ? ['All Projects']
                    : (member.project_ids || [])
                        .map(id => projects.find(p => p.id === id)?.name)
                        .filter(Boolean)

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-sm hover:shadow transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {member.name}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {member.all_projects ? (
                              <span className="text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                All Projects
                              </span>
                            ) : assignedProjectNames.length > 0 ? (
                              assignedProjectNames.map((pName, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded truncate max-w-[120px]"
                                >
                                  {pName}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400">No projects assigned</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors ml-2"
                        title="Delete member"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
