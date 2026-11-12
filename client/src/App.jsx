import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import ToastContainer from './components/ToastContainer'

export default function App() {
  const [page, setPage]       = useState('dashboard')   // 'dashboard' | 'project'
  const [activeProject, setActiveProject] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')

  const toggleDark = () => {
    setDarkMode(d => {
      const next = !d
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('darkMode', next)
      return next
    })
  }

  // Sync on mount
  useState(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  })

  const openProject = (project) => {
    setActiveProject(project)
    setPage('project')
  }

  const goBack = () => {
    setActiveProject(null)
    setPage('dashboard')
  }

  return (
    <>
      {page === 'dashboard' ? (
        <Dashboard
          darkMode={darkMode}
          onToggleDark={toggleDark}
          onOpenProject={openProject}
        />
      ) : (
        <ProjectDetail
          project={activeProject}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          onBack={goBack}
        />
      )}
      <ToastContainer />
    </>
  )
}
