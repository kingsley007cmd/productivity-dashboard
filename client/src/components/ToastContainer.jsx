import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={18} className="text-green-500" />,
  error:   <XCircle    size={18} className="text-red-500"   />,
  info:    <Info       size={18} className="text-blue-500"  />,
}

let _addToast = () => {}
export const toast = {
  success: (msg) => _addToast({ type: 'success', msg }),
  error:   (msg) => _addToast({ type: 'error',   msg }),
  info:    (msg) => _addToast({ type: 'info',     msg }),
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _addToast = ({ type, msg }) => {
      const id = Date.now()
      setToasts(t => [...t, { id, type, msg }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }
  }, [])

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map(({ id, type, msg }) => (
        <div
          key={id}
          className="flex items-center gap-3 bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm min-w-64 animate-slide-in"
        >
          {ICONS[type]}
          <span className="flex-1 text-gray-800 dark:text-gray-100">{msg}</span>
          <button onClick={() => setToasts(t => t.filter(x => x.id !== id))}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      ))}
    </div>
  )
}
