import React from 'react'
import { Card } from '../ui/Card'
import { useProfile } from '../../hooks/useProfile'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Avatar } from '../ui/Avatar'

export interface ProfileManagerProps {
  className?: string
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ className = '' }) => {
  const { profile, updateProfile, isLoading } = useProfile()
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  })

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        bio: profile.bio || '',
        avatar: profile.avatar || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateProfile(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar src={formData.avatar} alt={formData.name} className="h-20 w-20" />
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Handle file upload
                  }
                }}
              />
              <p className="mt-1 text-sm text-gray-500">JPG, GIF or PNG. Max size 2MB.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ProfileManager
