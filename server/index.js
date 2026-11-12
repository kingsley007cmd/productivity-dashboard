import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE   = join(__dirname, 'tasks.json')
const app       = express()
const PORT      = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// ─── DB Helpers ───────────────────────────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    return { tasks: [], projects: [], members: [], nextTaskId: 1, nextProjectId: 1, nextMemberId: 1 }
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  return {
    tasks:         data.tasks         || [],
    projects:      data.projects      || [],
    members:       data.members       || [],
    nextTaskId:    data.nextTaskId    || data.nextId || 1,
    nextProjectId: data.nextProjectId || 1,
    nextMemberId:  data.nextMemberId  || 1,
  }
}
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// ─── Project Routes ───────────────────────────────────────────────────────────

// GET /api/projects  → list with computed task stats
app.get('/api/projects', (req, res) => {
  const { tasks, projects } = readDB()
  const result = projects.map(p => {
    const pt = tasks.filter(t => t.project_id === p.id)
    return {
      ...p,
      totalTasks:  pt.length,
      completed:   pt.filter(t => t.status === 'completed').length,
      inProgress:  pt.filter(t => t.status === 'in-progress').length,
      overdue:     pt.filter(t => t.status === 'overdue').length,
    }
  })
  res.json(result)
})

// POST /api/projects
app.post('/api/projects', (req, res) => {
  const { name, color } = req.body
  if (!name) return res.status(400).json({ error: 'Name is required' })
  const db = readDB()
  const project = { id: db.nextProjectId++, name, color: color || '#3b82f6', created_at: new Date().toISOString().split('T')[0] }
  db.projects.push(project)
  writeDB(db)
  res.status(201).json({ ...project, totalTasks: 0, completed: 0, inProgress: 0, overdue: 0 })
})

// PATCH /api/projects/:id
app.patch('/api/projects/:id', (req, res) => {
  const db  = readDB()
  const idx = db.projects.findIndex(p => p.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Project not found' })
  db.projects[idx] = { ...db.projects[idx], ...req.body }
  writeDB(db)
  res.json(db.projects[idx])
})

// DELETE /api/projects/:id
app.delete('/api/projects/:id', (req, res) => {
  const db  = readDB()
  const idx = db.projects.findIndex(p => p.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Project not found' })
  db.projects.splice(idx, 1)
  // also remove associated tasks
  db.tasks = db.tasks.filter(t => t.project_id !== parseInt(req.params.id))
  writeDB(db)
  res.json({ success: true })
})

// ─── Member Routes ────────────────────────────────────────────────────────────

// GET /api/members?project_id=
app.get('/api/members', (req, res) => {
  const { project_id } = req.query
  const { members } = readDB()
  if (!project_id) {
    return res.json(members)
  }
  const pId = parseInt(project_id)
  const filtered = members.filter(m => 
    m.all_projects || (Array.isArray(m.project_ids) && m.project_ids.includes(pId))
  )
  res.json(filtered)
})

// POST /api/members
app.post('/api/members', (req, res) => {
  const { name, all_projects, project_ids } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' })
  }
  const db = readDB()
  const member = {
    id: db.nextMemberId++,
    name: name.trim(),
    all_projects: all_projects !== false, // default true
    project_ids: Array.isArray(project_ids) ? project_ids.map(Number) : [],
    created_at: new Date().toISOString().split('T')[0]
  }
  db.members.push(member)
  writeDB(db)
  res.status(201).json(member)
})

// PATCH /api/members/:id
app.patch('/api/members/:id', (req, res) => {
  const db = readDB()
  const idx = db.members.findIndex(m => m.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })

  const { name, all_projects, project_ids } = req.body
  if (name !== undefined) db.members[idx].name = name.trim()
  if (all_projects !== undefined) db.members[idx].all_projects = Boolean(all_projects)
  if (project_ids !== undefined) db.members[idx].project_ids = Array.isArray(project_ids) ? project_ids.map(Number) : []

  writeDB(db)
  res.json(db.members[idx])
})

// DELETE /api/members/:id
app.delete('/api/members/:id', (req, res) => {
  const db = readDB()
  const idx = db.members.findIndex(m => m.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Member not found' })
  db.members.splice(idx, 1)
  writeDB(db)
  res.json({ success: true })
})

// ─── Task Routes ──────────────────────────────────────────────────────────────

// GET /api/tasks?project_id=&start=&end=
app.get('/api/tasks', (req, res) => {
  const { project_id, start, end } = req.query
  let { tasks } = readDB()
  if (project_id) tasks = tasks.filter(t => t.project_id === parseInt(project_id))
  if (start)      tasks = tasks.filter(t => t.due_date >= start)
  if (end)        tasks = tasks.filter(t => t.due_date <= end)
  tasks.sort((a, b) => a.due_date.localeCompare(b.due_date))
  res.json(tasks)
})

// GET /api/tasks/due-today
app.get('/api/tasks/due-today', (req, res) => {
  const today = new Date().toISOString().split('T')[0]
  const { tasks } = readDB()
  const due = tasks
    .filter(t => t.due_date === today && t.status !== 'completed')
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3)
    })
  res.json(due)
})

// GET /api/activity  → heatmap data for last 6 weeks (Mon–Sat)
app.get('/api/activity', (req, res) => {
  const { tasks } = readDB()
  const completed = tasks.filter(t => t.status === 'completed' && t.due_date)

  // Build a count map: date → count
  const countMap = {}
  completed.forEach(t => {
    countMap[t.due_date] = (countMap[t.due_date] || 0) + 1
  })

  // Generate last 6 weeks (Mon–Sat)
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon...
  // Find most recent Monday
  const daysFromMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
  const thisMonday  = new Date(today)
  thisMonday.setDate(today.getDate() - daysFromMon)
  thisMonday.setHours(0, 0, 0, 0)

  const weeks = []
  for (let w = 5; w >= 0; w--) {
    const days = []
    for (let d = 0; d < 6; d++) { // Mon(0)–Sat(5)
      const date = new Date(thisMonday)
      date.setDate(thisMonday.getDate() - w * 7 + d)
      const dateStr = date.toISOString().split('T')[0]
      days.push({ date: dateStr, count: countMap[dateStr] || 0 })
    }
    weeks.push(days)
  }
  res.json(weeks)
})

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const { tasks } = readDB()
  const task = tasks.find(t => t.id === parseInt(req.params.id))
  if (!task) return res.status(404).json({ error: 'Task not found' })
  res.json(task)
})

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const { title, assignee, status, priority, due_date, project_id, estimated_hours } = req.body
  if (!title || !assignee || !status || !priority || !due_date) {
    return res.status(400).json({ error: 'title, assignee, status, priority, due_date required' })
  }
  const db  = readDB()
  const task = { id: db.nextTaskId++, project_id: project_id || null, title, assignee, status, priority, due_date, estimated_hours: estimated_hours || null }
  db.tasks.push(task)
  writeDB(db)
  res.status(201).json(task)
})

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', (req, res) => {
  const db  = readDB()
  const idx = db.tasks.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Task not found' })
  db.tasks[idx] = { ...db.tasks[idx], ...req.body }
  writeDB(db)
  res.json(db.tasks[idx])
})

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const db  = readDB()
  const idx = db.tasks.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Task not found' })
  db.tasks.splice(idx, 1)
  writeDB(db)
  res.json({ success: true })
})

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const { tasks } = readDB()
  res.json({
    total:       tasks.length,
    completed:   tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in-progress').length,
    overdue:     tasks.filter(t => t.status === 'overdue').length,
  })
})

// ─── Serve Frontend (Production) ──────────────────────────────────────────────
const clientDist = join(__dirname, '../client/dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res) => res.sendFile(join(clientDist, 'index.html')))
}

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`))
