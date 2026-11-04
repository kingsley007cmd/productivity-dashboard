# 📊 Productivity Analytics Dashboard

A full-stack productivity tracking dashboard built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express + SQLite** (backend).

## Features
- 📊 KPI Cards (Total, Completed, In Progress, Overdue)
- 📈 Task completion trend chart (Recharts)
- 📋 Sortable & filterable task table
- 📅 Date range filter
- 🌙 Dark mode (persisted in localStorage)
- 🗄️ SQLite database with 80 seeded sample tasks

## Project Structure

```
productivity-dashboard/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── KpiCards.jsx
│   │   │   ├── TaskTable.jsx
│   │   │   ├── TrendChart.jsx
│   │   │   └── DateRangePicker.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/          # Node.js + Express + SQLite backend
│   ├── index.js
│   └── package.json
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Run the backend

```bash
cd server
npm run dev   # starts on http://localhost:3001
```

### 3. Run the frontend

```bash
cd client
npm run dev   # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /api/tasks        | List tasks (date filter) |
| GET    | /api/tasks/:id    | Get single task          |
| POST   | /api/tasks        | Create task              |
| PATCH  | /api/tasks/:id    | Update task              |
| DELETE | /api/tasks/:id    | Delete task              |
| GET    | /api/stats        | Summary statistics       |
