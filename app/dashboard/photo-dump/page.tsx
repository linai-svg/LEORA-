'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { useUserStorage } from '@/hooks/use-user-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Flame, Heart, Trash2, Clock, Users, UserPlus, Check, X, Copy, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { LeoraMascotEnhanced } from '@/components/mascot/leora-mascot-enhanced'
import { 
  getPhotoStreak, 
  updateStreakOnPhotoAdd, 
  isStreakAtRisk,
  getStreakStatus 
} from '@/lib/photo-streak-service'
import {
  getLeoraStreakIncrease,
  getLeoraStreakBroke,
  getLeoraStreakReminder,
} from '@/lib/photo-streak-leora'
import { getLeoraPhotoDumpMessage } from '@/lib/leora-section-messages'
import {
  initializeUser,
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend
} from '@/lib/friends-service'
import {
  getLeoraFriendAdded,
  getLeoraPhotoShared,
  getLeoraReactionReceived,
  getLeoraFriendRequestSent,
  getLeoraFriendRequestAccepted
} from '@/lib/friends-leora-feedback'
import {
  addReaction,
  getPhotoReactions,
  getUserReaction,
  groupReactionsByEmoji
} from '@/lib/photo-reactions-service'
import type { Friend, FriendRequest, ReactionEmoji, SocialPhoto } from '@/lib/friends-types'
import { useToast } from '@/hooks/use-toast'

const REACTION_EMOJIS: ReactionEmoji[] = ['❤️', '😂', '✨', '👍', '😮']

export default function PhotoDumpPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [photos, setPhotos] = useUserStorage<SocialPhoto[]>('social_photos', [])
  const [caption, setCaption] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [leoraMessage, setLeoraMessage] = useState<string | null>(null)
  const [streak, setStreak] = useState(getPhotoStreak())
  const [sharingMode, setSharingMode] = useState<'private' | 'friends'>('private')
  const [activeTab, setActiveTab] = useState<'my-photos' | 'friends-feed' | 'friends'>('my-photos')
  
  // Friends state
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [friendCode, setFriendCode] = useState('')
  const [myFriendCode, setMyFriendCode] = useState('')
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<SocialPhoto | null>(null)
  const [isPhotoDetailOpen, setIsPhotoDetailOpen] = useState(false)

  // Initialize user and load friends
  useEffect(() => {
    if (user) {
      const userEntry = initializeUser(user.id, user.email?.split('@')[0] || user.id)
      setMyFriendCode(userEntry.friendCode)
      setFriends(getFriends(user.id))
      setPendingRequests(getPendingRequests(user.id))
    }
  }, [user])

  // Check streak status periodically
  useEffect(() => {
    const checkStreak = () => {
      const currentStreak = getPhotoStreak()
      setStreak(currentStreak)
      
      const { atRisk, hoursRemaining } = isStreakAtRisk()
      
      if (atRisk && currentStreak.currentStreak > 0) {
        const reminder = getLeoraStreakReminder(hoursRemaining)
        setLeoraMessage(reminder)
        setTimeout(() => setLeoraMessage(null), 10000)
      }
    }
    
    checkStreak()
    const interval = setInterval(checkStreak, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePost = () => {
    if (!imageUrl || !user) return

    const newPhoto: SocialPhoto = {
      id: `photo_${Date.now()}`,
      imageUrl,
      caption,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      userId: user.id,
      username: user.email?.split('@')[0] || user.id,
      sharingMode,
      reactions: [],
      likes: []
    }

    setPhotos([newPhoto, ...photos])
    
    // Update streak
    const streakResult = updateStreakOnPhotoAdd()
    const updatedStreak = getPhotoStreak()
    setStreak(updatedStreak)
    
    // Generate Leora feedback
    let feedback = ''
    if (streakResult.streakBroke) {
      feedback = getLeoraStreakBroke(updatedStreak.currentStreak - 1)
    } else if (sharingMode === 'friends') {
      feedback = getLeoraPhotoShared()
    } else {
      feedback = getLeoraStreakIncrease(streakResult.newStreak, streakResult.isFirstPhoto)
    }
    
    setLeoraMessage(feedback)
    setTimeout(() => setLeoraMessage(null), 8000)
    
    toast({
      title: "Photo posted!",
      description: sharingMode === 'friends' ? 'Shared with friends' : 'Saved privately'
    })
    
    setImageUrl('')
    setCaption('')
    setSharingMode('private')
  }

  const handleAddFriend = () => {
    if (!user || !friendCode) {
      console.log('[v0] Add Friend - Missing user or friend code')
      return
    }
    
    console.log('[v0] Add Friend - Starting request, code:', friendCode)
    
    const result = sendFriendRequest(
      user.id,
      user.email?.split('@')[0] || user.id,
      friendCode.toUpperCase()
    )
    
    console.log('[v0] Add Friend - Result:', result)
    
    if (result.success) {
      toast({ title: "Success", description: result.message })
      setFriendCode('')
      setIsAddFriendOpen(false)
      
      const feedback = getLeoraFriendRequestSent()
      setLeoraMessage(feedback)
      setTimeout(() => setLeoraMessage(null), 6000)
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handleAcceptRequest = (requestId: string) => {
    if (!user) return
    
    const result = acceptFriendRequest(requestId, user.id)
    
    if (result.success) {
      toast({ title: "Success", description: result.message })
      setFriends(getFriends(user.id))
      setPendingRequests(getPendingRequests(user.id))
      
      const feedback = getLeoraFriendRequestAccepted()
      setLeoraMessage(feedback)
      setTimeout(() => setLeoraMessage(null), 6000)
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" })
    }
  }

  const handleDeclineRequest = (requestId: string) => {
    if (!user) return
    
    const result = declineFriendRequest(requestId, user.id)
    
    if (result.success) {
      setPendingRequests(getPendingRequests(user.id))
      toast({ title: "Request declined" })
    }
  }

  const handleRemoveFriend = (friendUserId: string) => {
    if (!user) return
    
    const result = removeFriend(user.id, friendUserId)
    
    if (result.success) {
      setFriends(getFriends(user.id))
      toast({ title: "Friend removed" })
    }
  }

  const handleReaction = (photoId: string, emoji: ReactionEmoji) => {
    if (!user) return
    
    const result = addReaction(
      photoId,
      user.id,
      user.email?.split('@')[0] || user.id,
      emoji
    )
    
    if (result.success && result.reaction) {
      // Update photos with new reaction
      const updatedPhotos = photos.map(p => {
        if (p.id === photoId) {
          return {
            ...p,
            reactions: getPhotoReactions(photoId)
          }
        }
        return p
      })
      setPhotos(updatedPhotos)
      
      // Show Leora feedback if someone reacted to user's photo
      const photo = photos.find(p => p.id === photoId)
      if (photo && photo.userId !== user.id) {
        const feedback = getLeoraReactionReceived(emoji)
        setLeoraMessage(feedback)
        setTimeout(() => setLeoraMessage(null), 5000)
      }
    }
  }

  const handleDelete = (photoId: string) => {
    setPhotos(photos.filter(photo => photo.id !== photoId))
    setIsPhotoDetailOpen(false)
  }

  const copyFriendCode = () => {
    navigator.clipboard.writeText(myFriendCode)
    toast({ title: "Copied!", description: "Friend code copied to clipboard" })
  }

  const openPhotoDetail = (photo: SocialPhoto) => {
    setSelectedPhoto({
      ...photo,
      reactions: getPhotoReactions(photo.id)
    })
    setIsPhotoDetailOpen(true)
  }

  // Filter photos
  const activePhotos = photos.filter(photo => 
    new Date(photo.expiresAt) > new Date()
  )
  
  const myPhotos = activePhotos.filter(p => p.userId === user?.id)
  
  const friendsPhotos = activePhotos.filter(p => 
    p.userId !== user?.id && 
    p.sharingMode === 'friends' &&
    friends.some(f => f.friendCode.includes(p.userId))
  )
  
  const hasPostedToday = streak.lastPhotoDate && new Date(streak.lastPhotoDate).toDateString() === new Date().toDateString()

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Leora Photo Dump Message */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐆</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1F1F1F]">
              {getLeoraPhotoDumpMessage(hasPostedToday || false)}
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-bold mb-2">Photo Dump</h1>
        <p className="text-muted-foreground">Share moments with friends • 24h streaks</p>
      </div>

      {/* Streak Card */}
      <Card className="shadow-soft border-[#E8C5B5]/30 bg-gradient-to-br from-orange-50 to-red-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1F1F1F]">{streak.currentStreak}</p>
                  <p className="text-sm text-[#8F8F8F]">Day Streak</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#1F1F1F]">{getStreakStatus().message}</p>
                {streak.lastPhotoDate && (
                  <p className="text-xs text-[#8F8F8F] flex items-center gap-1 justify-end mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(streak.lastPhotoDate), { addSuffix: true })}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#E8C5B5]/20">
              <div className="text-center">
                <p className="text-lg font-bold text-[#1F1F1F]">{streak.currentStreak}</p>
                <p className="text-xs text-[#8F8F8F]">Current</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#1F1F1F]">{streak.longestStreak}</p>
                <p className="text-xs text-[#8F8F8F]">Best</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#1F1F1F]">{streak.totalPhotos}</p>
                <p className="text-xs text-[#8F8F8F]">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-photos">My Photos</TabsTrigger>
          <TabsTrigger value="friends-feed">
            Friends Feed
            {friendsPhotos.length > 0 && (
              <Badge className="ml-2 bg-[#E8C5B5] text-[#1F1F1F]">{friendsPhotos.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="friends">
            Friends
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-red-500">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* My Photos Tab */}
        <TabsContent value="my-photos" className="space-y-6">
          {/* Upload Card */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Share a Moment</CardTitle>
              <CardDescription>Upload a photo that expires in 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageUrl ? (
                <div className="relative">
                  <img 
                    src={imageUrl || "/placeholder.svg"} 
                    alt="Preview" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl('')}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = 'image/*'
                    input.capture = 'environment'
                    input.onchange = (e: any) => handleImageUpload(e)
                    input.click()
                  }}
                  disabled={isUploading}
                  size="lg"
                  className="w-full h-64 flex flex-col gap-3"
                  variant="outline"
                >
                  <Camera className="w-12 h-12" />
                  <span>Take Photo with Camera</span>
                  <span className="text-xs text-muted-foreground">Camera only - No gallery</span>
                </Button>
              )}

              <Textarea
                placeholder="Add a caption (optional)..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="min-h-[80px]"
              />

              {/* Sharing Mode */}
              <div className="space-y-2">
                <Label>Who can see this?</Label>
                <div className="flex gap-2">
                  <Button
                    variant={sharingMode === 'private' ? 'default' : 'outline'}
                    className={sharingMode === 'private' ? 'bg-[#1F1F1F]' : 'bg-transparent'}
                    onClick={() => setSharingMode('private')}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Private
                  </Button>
                  <Button
                    variant={sharingMode === 'friends' ? 'default' : 'outline'}
                    className={sharingMode === 'friends' ? 'bg-[#E8C5B5] text-[#1F1F1F] hover:bg-[#d9b5a5]' : 'bg-transparent'}
                    onClick={() => setSharingMode('friends')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Friends ({friends.length})
                  </Button>
                </div>
              </div>

              <Button
                onClick={handlePost}
                disabled={!imageUrl || isUploading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Post Photo
              </Button>
            </CardContent>
          </Card>

          {/* My Photos Grid */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">My Photos ({myPhotos.length})</h2>
            {myPhotos.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Camera className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No photos yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myPhotos.map((photo) => (
                  <Card 
                    key={photo.id} 
                    className="shadow-soft overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => openPhotoDetail(photo)}
                  >
                    <img 
                      src={photo.imageUrl || "/placeholder.svg"} 
                      alt={photo.caption || 'Photo'} 
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="pt-3 space-y-2">
                      {photo.caption && (
                        <p className="text-sm line-clamp-2">{photo.caption}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {photo.sharingMode === 'friends' ? (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              Friends
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </div>
                        <span>Expires {formatDistanceToNow(new Date(photo.expiresAt), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Friends Feed Tab */}
        <TabsContent value="friends-feed" className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Friends Feed</h2>
            {friendsPhotos.length === 0 ? (
              <Card className="shadow-soft">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-2">No photos from friends yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    {friends.length === 0 ? 'Add friends to see their photos' : 'When friends share photos, they\'ll appear here'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {friendsPhotos.map((photo) => (
                  <Card 
                    key={photo.id} 
                    className="shadow-soft overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => openPhotoDetail(photo)}
                  >
                    <img 
                      src={photo.imageUrl || "/placeholder.svg"} 
                      alt={photo.caption || 'Photo'} 
                      className="w-full h-80 object-cover"
                    />
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#E8C5B5] rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-[#1F1F1F]">
                            {photo.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{photo.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(photo.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {photo.caption && (
                        <p className="text-sm">{photo.caption}</p>
                      )}

                      {/* Quick Reactions */}
                      <div className="flex gap-2 pt-2">
                        {REACTION_EMOJIS.map((emoji) => {
                          const reactions = getPhotoReactions(photo.id)
                          const userReaction = getUserReaction(photo.id, user?.id || '')
                          const isSelected = userReaction?.emoji === emoji
                          const count = reactions.filter(r => r.emoji === emoji).length
                          
                          return (
                            <Button
                              key={emoji}
                              size="sm"
                              variant={isSelected ? 'default' : 'outline'}
                              className={`text-lg ${isSelected ? 'bg-[#E8C5B5] hover:bg-[#d9b5a5] text-[#1F1F1F]' : 'bg-transparent'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReaction(photo.id, emoji)
                              }}
                            >
                              {emoji} {count > 0 && <span className="ml-1 text-xs">{count}</span>}
                            </Button>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-6">
          {/* Friend Code Card */}
          <Card className="shadow-soft bg-gradient-to-br from-[#E8C5B5]/10 to-[#E8C5B5]/5">
            <CardHeader>
              <CardTitle>Your Friend Code</CardTitle>
              <CardDescription>Share this code with friends to connect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={myFriendCode}
                  readOnly
                  className="font-mono text-lg font-bold"
                />
                <Button onClick={copyFriendCode} variant="outline" className="bg-transparent">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{request.fromUsername}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-[#E8C5B5] hover:bg-[#d9b5a5] text-[#1F1F1F]"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                        className="bg-transparent"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Add Friend Button */}
          <Button
            onClick={() => setIsAddFriendOpen(true)}
            className="w-full bg-[#1F1F1F] hover:bg-[#2F2F2F]"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Friend
          </Button>

          {/* Friends List */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No friends yet</p>
                  <p className="text-sm text-muted-foreground/70">Add friends to share photos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E8C5B5] rounded-full flex items-center justify-center">
                          <span className="font-medium text-[#1F1F1F]">
                            {friend.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{friend.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {formatDistanceToNow(new Date(friend.addedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveFriend(friend.friendCode.split('-')[1])}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Friend Dialog */}
      <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
            <DialogDescription>
              Enter your friend's code to send a friend request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="friend-code">Friend Code</Label>
              <Input
                id="friend-code"
                placeholder="ABCD12-EFGH"
                value={friendCode}
                onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFriendOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleAddFriend} disabled={!friendCode} className="bg-[#1F1F1F] hover:bg-[#2F2F2F]">
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Detail Dialog */}
      <Dialog open={isPhotoDetailOpen} onOpenChange={setIsPhotoDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#E8C5B5] rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-[#1F1F1F]">
                      {selectedPhoto.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <DialogTitle>{selectedPhoto.username}</DialogTitle>
                    <DialogDescription>
                      {formatDistanceToNow(new Date(selectedPhoto.timestamp), { addSuffix: true })}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                <img
                  src={selectedPhoto.imageUrl || "/placeholder.svg"}
                  alt={selectedPhoto.caption || 'Photo'}
                  className="w-full rounded-lg"
                />
                
                {selectedPhoto.caption && (
                  <p className="text-sm">{selectedPhoto.caption}</p>
                )}

                {/* Reactions */}
                <div className="space-y-3">
                  <Label>Reactions</Label>
                  <div className="flex gap-2">
                    {REACTION_EMOJIS.map((emoji) => {
                      const userReaction = getUserReaction(selectedPhoto.id, user?.id || '')
                      const isSelected = userReaction?.emoji === emoji
                      const reactions = selectedPhoto.reactions?.filter(r => r.emoji === emoji) || []
                      
                      return (
                        <Button
                          key={emoji}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`text-xl ${isSelected ? 'bg-[#E8C5B5] hover:bg-[#d9b5a5] text-[#1F1F1F]' : 'bg-transparent'}`}
                          onClick={() => handleReaction(selectedPhoto.id, emoji)}
                        >
                          {emoji}
                          {reactions.length > 0 && (
                            <span className="ml-2 text-sm">{reactions.length}</span>
                          )}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Reaction Details */}
                  {selectedPhoto.reactions && selectedPhoto.reactions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      {Object.entries(groupReactionsByEmoji(selectedPhoto.reactions)).map(([emoji, reacts]) => 
                        reacts.length > 0 && (
                          <div key={emoji} className="flex items-center gap-2 text-sm">
                            <span className="text-lg">{emoji}</span>
                            <span className="text-muted-foreground">
                              {reacts.map(r => r.username).join(', ')}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {selectedPhoto.userId === user?.id && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDelete(selectedPhoto.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Photo
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Leora Mascot */}
      {leoraMessage ? (
        <LeoraMascotEnhanced 
          section="photo-dump"
          customMessage={leoraMessage}
          autoHide={true}
          autoHideDelay={8000}
        />
      ) : (
        <LeoraMascotEnhanced 
          section="photo-dump"
          autoHide={true}
          autoHideDelay={6000}
        />
      )}
    </div>
  )
}
