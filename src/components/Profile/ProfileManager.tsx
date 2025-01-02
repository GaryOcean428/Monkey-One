import React, { useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { useAuth } from '../auth/hooks/useAuth'

export function ProfileManager() {
  const { profile, loading, error, updateProfile } = useProfile()
  const { signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
  })

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div>Error loading profile: {error.message}</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.full_name}
            onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Profile</h2>
        <p>
          <strong>Username:</strong> {profile?.username}
        </p>
        <p>
          <strong>Full Name:</strong> {profile?.full_name}
        </p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => setEditing(true)}
          className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Edit Profile
        </button>
        <button
          onClick={() => signOut()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
