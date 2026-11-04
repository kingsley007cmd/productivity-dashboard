import express from 'express'
import cors from 'cors'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_FILE = join(__dirname, 'tasks.json')
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// ─── JSON "Database" Helpers ──────────────────────────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) return { tasks: [], nextId: 1 }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2))
}

// ─── Seed Sample Data ─────────────────────────────────────────────────────────
function seedIfEmpty() {
  const db = readDB()
  if (db.tasks.length > 0) return

  console.log('Seeding sample data...')
  const people = ['Alice', 'Bob', 'Carol', 'David', 'Eve']
  const statuses = ['pending', 'in-progress', 'completed', 'overdue']
  const priorities = ['low', 'medium', 'high']
  const taskNames = [
    'Design landing page', 'Fix login bug', 'Write unit tests', 'Set up CI/CD',
    'Refactor auth module', 'Update documentation', 'Code review PRs', 'Deploy to staging',
    'Database migration', 'Performance audit', 'Add dark mode', 'Mobile responsiveness',
    'API rate limiting', 'User onboarding flow', 'Email notification system',
    'Analytics integration', 'Security audit', 'Load testing', 'Accessibility review',
    'Release v2.0', 'Customer feedback analysis', 'Backlog grooming', 'Sprint planning',
    'OKR review meeting', 'Team retrospective', 'Hire frontend dev', 'Set up monitoring',
    'SSL certificate renewal', 'Backup automation', 'Cost optimization'
  ]

  const today = new Date()
  const tasks = []

  for (let i = 0; i < 80; i++) {
    const daysOffset = Math.floor(Math.random() * 60) - 30
    const dueDate = new Date(today)
    dueDate.setDate(today.getDate() + daysOffset)
    const dueDateStr = dueDate.toISOString().split('T')[0]

    tasks.push({
      id: i + 1,
      title: taskNames[i % taskNames.length] + (i >= taskNames.length ? ` (${Math.floor(i / taskNames.length) + 1})` : ''),
      assignee: people[Math.floor(Math.random() * people.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      due_date: dueDateStr
    })
  }

  writeDB({ tasks, nextId: 81 })
  console.log('Seeded 80 sample tasks.')
}

seedIfEmpty()

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/tasks?start=YYYY-MM-DD&end=YYYY-MM-DD
app.get('/api/tasks', (req, res) => {
  const { start, end } = req.query
  let { tasks } = readDB()

  if (start) tasks = tasks.filter(t => t.due_date >= start)
  if (end)   tasks = tasks.filter(t => t.due_date <= end)

  tasks.sort((a, b) => a.due_date.localeCompare(b.due_date))
  res.json(tasks)
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
  const { title, assignee, status, priority, due_date } = req.body
  if (!title || !assignee || !status || !priority || !due_date) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const db = readDB()
  const newTask = { id: db.nextId++, title, assignee, status, priority, due_date }
  db.tasks.push(newTask)
  writeDB(db)
  res.status(201).json(newTask)
})

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', (req, res) => {
  const db = readDB()
  const idx = db.tasks.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Task not found' })

  db.tasks[idx] = { ...db.tasks[idx], ...req.body }
  writeDB(db)
  res.json(db.tasks[idx])
})

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const db = readDB()
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

// ─── Serve Frontend in Production ───────────────────────────────────────────
const clientDist = join(__dirname, '../client/dist')
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'))
  })
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
