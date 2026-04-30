'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Settings, LogOut, Save, Camera, Loader2, FileText, Download, Loader } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth-store'
import { useAppStore } from '@/store/app-store'
import { useSoundStore } from '@/store/sound-store'
import { useSoundEffect } from '@/hooks/use-sound'
import { toast } from 'sonner'

export function AdminProfilePage() {
  const { user, logout } = useAuthStore()
  const { navigateTo } = useAppStore()
  const { isMuted, toggleMute: toggleSoundMute } = useSoundStore()
  const playClick = useSoundEffect('click')
  
  const [editName, setEditName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [downloadingLetterhead, setDownloadingLetterhead] = useState(false)

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Update local store
        useAuthStore.setState((state) => ({
          user: state.user ? { ...state.user, name: data.user.name } : null
        }))
        toast.success('Profile updated successfully')
        playClick()
      } else {
        toast.error('Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    playClick()
    logout()
    navigateTo('landing')
  }

  const handleDownloadLetterhead = async () => {
    playClick()
    setDownloadingLetterhead(true)
    
    try {
      const response = await fetch('/api/letterhead')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.message || 'Failed to generate letterhead')
      }
      
      // Check content type
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/pdf')) {
        throw new Error('Invalid response format')
      }
      
      const blob = await response.blob()
      
      // Verify blob has content
      if (blob.size === 0) {
        throw new Error('Empty PDF generated')
      }
      
      console.log('PDF blob size:', blob.size)
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Skoolar-Letterhead-${new Date().toISOString().split('T')[0]}.pdf`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      
      toast.success('Letterhead downloaded successfully!', {
        description: 'The PDF has been saved to your device.',
      })
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download letterhead', {
        description: error?.message || 'Please try again later.',
      })
    } finally {
      setDownloadingLetterhead(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button variant="ghost" size="icon" onClick={() => { playClick(); navigateTo('admin') }} className="rounded-full">
            ←
          </Button>
          <h1 className="text-2xl font-bold">Admin Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'Admin'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-amber-500"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-amber-300">
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  )}
                  {/* Camera upload button */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        setUploadingAvatar(true)
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          
                          const res = await fetch('/api/admin/upload/announcement', {
                            method: 'POST',
                            body: formData,
                          })
                          
                          if (res.ok) {
                            const data = await res.json()
                            const avatarUrl = data.url || data.fileUrl
                            
                            // Update user with new avatar
                            const updateRes = await fetch('/api/user/profile', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ avatar: avatarUrl }),
                            })
                            
                            if (updateRes.ok) {
                              useAuthStore.setState((state) => ({
                                user: state.user ? { ...state.user, avatar: avatarUrl } : null
                              }))
                              toast.success('Avatar updated!')
                              playClick()
                            } else {
                              toast.error('Failed to save avatar')
                            }
                          } else {
                            toast.error('Failed to upload image')
                          }
                        } catch {
                          toast.error('Failed to upload image')
                        } finally {
                          setUploadingAvatar(false)
                        }
                      }}
                    />
                    {uploadingAvatar ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.name || 'Admin'}</h3>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              {/* Save Button */}
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 bg-gradient-to-r from-[#008751]/5 to-transparent hover:from-[#008751]/10 border-[#008751]/20"
                onClick={handleDownloadLetterhead}
                disabled={downloadingLetterhead}
              >
                {downloadingLetterhead ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 text-[#008751]" />
                )}
                Download Letterhead
                {!downloadingLetterhead && <Download className="w-3 h-3 ml-auto opacity-50" />}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => { playClick(); navigateTo('admin-settings') }}
              >
                <Settings className="w-4 h-4" />
                Admin Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}