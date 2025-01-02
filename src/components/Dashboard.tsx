import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h1>
      {/* Add your dashboard content here */}
    </div>
  )
}
