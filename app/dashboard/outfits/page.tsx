"use client"

import { CardFooter } from "@/components/ui/card"
import { Shirt } from "lucide-react" // Declare the Shirt variable

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import React from "react"
import { useState, useRef, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Plus, Trash2, Heart, Sparkles, RefreshCw, Check, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LeoraMascotEnhanced } from "@/components/mascot/leora-mascot-enhanced"
import type { ClothingItem, GeneratedOutfit, ClothingCategory } from "@/types/clothing"
import { 
  extractDominantColor,
  fileToBase64,
  createClothingItem
} from "@/lib/clothing-detection"
import { generateOutfit, getWeatherIcon, validateWardrobe, getMockWeather } from "@/lib/outfit-generation"
import { savedOutfitService } from "@/lib/saved-outfit-service"
import { generateLeoraFeedback } from "@/lib/leora-feedback"
import { getLeoraOutfitsMessage } from "@/lib/leora-section-messages"

const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  dress: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessories'
}

export default function OutfitsPage() {
  const { user } = useAuth()
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>("leora_clothing_items", [])
  const [generatedOutfits, setGeneratedOutfits] = useLocalStorage<GeneratedOutfit[]>("leora_generated_outfits", [])
  
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'generator' | 'saved' | 'manual'>('wardrobe')
  
  // Sync saved outfits from service on mount and when savedOutfits changes
  useEffect(() => {
    const outfits = savedOutfitService.getAll()
    setSavedOutfits(outfits)
  }, [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentOutfit, setCurrentOutfit] = useState<GeneratedOutfit | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all')
  const [savedOutfits, setSavedOutfits] = useLocalStorage<any[]>("leora_saved_outfits", [])
  const [leoraMessage, setLeoraMessage] = useState<string | null>(null)
  const [outfitName, setOutfitName] = useState('')
  const [outfitNote, setOutfitNote] = useState('')
  const [selectedOutfit, setSelectedOutfit] = useState<any | null>(null)
  const [isOutfitDetailOpen, setIsOutfitDetailOpen] = useState(false)
  const [forcedItemIds, setForcedItemIds] = useState<string[]>([])
  const [isRegenerating, setIsRegenerating] = useState(false)
  
  // Manual creation state
  const [manualSelection, setManualSelection] = useState<{
    topId?: string
    bottomId?: string
    dressId?: string
    shoesId?: string
    outerwearId?: string
    accessoryIds: string[]
  }>({ accessoryIds: [] })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Handle photo upload from gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    await processClothingImage(file)
  }

  // Handle camera capture
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    await processClothingImage(file)
  }

  // Process clothing image
  const processClothingImage = async (file: File) => {
    setIsProcessing(true)
    setIsAddDialogOpen(false)
    
    try {
      console.log('[v0] Processing clothing image...')
      
      // Convert to base64
      const imageUrl = await fileToBase64(file)
      
      // Store temporarily
      setTempImage(imageUrl)
      
      // ASK USER TO SELECT CATEGORY MANUALLY
      setIsCategoryDialogOpen(true)
      
    } catch (error) {
      console.error('[v0] Error processing image:', error)
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Create item with manual category
  const handleCategorySelected = async (category: ClothingCategory) => {
    if (!tempImage) return

    setIsProcessing(true)
    setIsCategoryDialogOpen(false)

    try {
      console.log('[v0] Creating item with manual category:', category)

      const newItem: ClothingItem = {
        id: crypto.randomUUID(),
        userId: user?.id || 'guest',
        imageUrl: tempImage,
        thumbnailUrl: tempImage,
        category: category,
        categoryConfidence: 100,
        dominantColor: '#808080',
        colors: ['#808080'],
        style: ['casual'],
        season: ['spring', 'summer', 'autumn', 'winter'],
        fabricWeight: 'medium',
        isFavorite: false,
        isActive: true,
        tags: [],
        wearCount: 0,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      setClothingItems([...clothingItems, newItem])
      setTempImage(null)
      
      toast({
        title: "Item added",
        description: `Added to ${CATEGORY_LABELS[category]}`
      })
      
    } catch (error) {
      console.error('[v0] Error creating item:', error)
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setClothingItems(
      clothingItems.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    )
  }

  // Delete item
  const deleteItem = (id: string) => {
    setClothingItems(clothingItems.filter(item => item.id !== id))
    toast({
      title: "Item removed",
      description: "Clothing item deleted from your wardrobe"
    })
  }

  // Update item category (manual correction)
  const updateItemCategory = (id: string, newCategory: ClothingCategory) => {
    setClothingItems(
      clothingItems.map(item =>
        item.id === id 
          ? { ...item, category: newCategory, categoryConfidence: 100, updatedAt: new Date().toISOString() }
          : item
      )
    )
    toast({
      title: "Category updated",
      description: `Changed to ${CATEGORY_LABELS[newCategory]}`
    })
  }

  // Toggle forced item
  const toggleForcedItem = (itemId: string) => {
    if (forcedItemIds.includes(itemId)) {
      setForcedItemIds(forcedItemIds.filter(id => id !== itemId))
    } else {
      setForcedItemIds([...forcedItemIds, itemId])
    }
  }
  
  // Generate new outfit
  const handleGenerateOutfit = (isRegenerate: boolean = false) => {
    console.log('[v0] Starting outfit generation...', isRegenerate ? '(REGENERATE)' : '(NEW)')

    if (isRegenerate) {
      setIsRegenerating(true)
    }

    const activeItems = clothingItems.filter(item => item.isActive)

    // VALIDATE with clear error messages
    const validation = validateWardrobe(activeItems)

    if (!validation.isValid) {
      toast({
        title: "Cannot generate outfit",
        description: validation.errorMessage,
        variant: "destructive"
      })
      setIsRegenerating(false)
      return
    }

    console.log('[v0] Forced items:', forcedItemIds)

    const outfit = generateOutfit(
      activeItems,
      new Date().toISOString(),
      user?.id || 'guest',
      forcedItemIds
    )

    if (!outfit) {
      toast({
        title: "Generation failed",
        description: forcedItemIds.length > 0
          ? "No compatible outfit found with selected items. Try different items."
          : "Could not create outfit. Please try again.",
        variant: "destructive"
      })
      setIsRegenerating(false)
      return
    }

    console.log('[v0] Outfit generated:', outfit)

    // Small delay for regenerate to show loading state
    setTimeout(() => {
      setCurrentOutfit(outfit)
      setActiveTab('generator')

      // Generate Leora feedback
      const weather = getMockWeather(new Date().toISOString())
      console.log('[v0] Weather data:', weather)
      const feedback = generateLeoraFeedback(outfit, clothingItems, weather, isRegenerate)
      console.log('[v0] Leora feedback:', feedback)
      setLeoraMessage(feedback)
      setTimeout(() => setLeoraMessage(null), 10000)

      setIsRegenerating(false)
    }, isRegenerate ? 800 : 0)
  }
  
  // Save current outfit
  const handleSaveOutfit = () => {
    if (!currentOutfit) return
    
    savedOutfitService.saveGeneratedOutfit(
      currentOutfit,
      user?.id || 'guest',
      outfitName || undefined,
      outfitNote || undefined
    )
    
    const updatedOutfits = savedOutfitService.getAll()
    setSavedOutfits(updatedOutfits)
    setIsSaveDialogOpen(false)
    setOutfitName('')
    setOutfitNote('')
    
    toast({
      title: "Outfit saved!",
      description: `You now have ${updatedOutfits.length} saved outfit${updatedOutfits.length !== 1 ? 's' : ''}`
    })
  }
  
  // Delete saved outfit
  const handleDeleteSaved = (id: string) => {
    savedOutfitService.delete(id)
    setSavedOutfits(savedOutfitService.getAll())
    setIsOutfitDetailOpen(false)
    setSelectedOutfit(null)
    toast({
      title: "Outfit deleted",
      description: "Removed from your saved outfits"
    })
  }
  
  // Open outfit detail
  const handleOpenOutfit = (outfit: any) => {
    console.log('[v0] Opening outfit detail:', outfit)
    setSelectedOutfit(outfit)
    setIsOutfitDetailOpen(true)
    
    // Generate Leora feedback for this outfit
    const weather = getMockWeather(outfit.createdAt)
    const feedback = generateLeoraFeedback(outfit, clothingItems, weather)
    console.log('[v0] Leora feedback for outfit:', feedback)
    setLeoraMessage(feedback)
    setTimeout(() => setLeoraMessage(null), 10000)
  }
  
  // Manual outfit - add item
  const handleManualSelect = (category: ClothingCategory, itemId: string) => {
    if (category === 'accessory') {
      setManualSelection({
        ...manualSelection,
        accessoryIds: [...manualSelection.accessoryIds, itemId]
      })
    } else {
      setManualSelection({
        ...manualSelection,
        [`${category}Id`]: itemId
      })
    }
  }
  
  // Save manual outfit
  const handleSaveManual = () => {
    if (!manualSelection.shoesId) {
      toast({
        title: "Missing shoes",
        description: "You must select shoes",
        variant: "destructive"
      })
      return
    }
    
    const hasDress = !!manualSelection.dressId
    const hasTopBottom = !!(manualSelection.topId && manualSelection.bottomId)
    
    if (!hasDress && !hasTopBottom) {
      toast({
        title: "Incomplete outfit",
        description: "Select either (Top + Bottom) OR a Dress",
        variant: "destructive"
      })
      return
    }
    
    savedOutfitService.saveManualOutfit(
      manualSelection as any,
      user?.id || 'guest',
      outfitName || undefined,
      outfitNote || undefined
    )
    
    const updatedOutfits = savedOutfitService.getAll()
    setSavedOutfits(updatedOutfits)
    setManualSelection({ accessoryIds: [] })
    setOutfitName('')
    setOutfitNote('')
    setActiveTab('saved')
    
    toast({
      title: "Manual outfit saved!",
      description: `You now have ${updatedOutfits.length} saved outfit${updatedOutfits.length !== 1 ? 's' : ''}`
    })
  }

  // Accept outfit
  const acceptOutfit = () => {
    if (!currentOutfit) return
    
    const accepted: GeneratedOutfit = {
      ...currentOutfit,
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      wornDate: new Date().toISOString()
    }
    
    setGeneratedOutfits([accepted, ...generatedOutfits])
    
    // Update wear count
    const itemIds = [
      accepted.topId,
      accepted.bottomId,
      accepted.dressId,
      accepted.outerwearId,
      accepted.shoesId
    ].filter(Boolean) as string[]
    
    setClothingItems(
      clothingItems.map(item =>
        itemIds.includes(item.id)
          ? { ...item, wearCount: item.wearCount + 1, lastWorn: new Date().toISOString() }
          : item
      )
    )
    
    toast({
      title: "Outfit saved!",
      description: "Marked as worn for today"
    })
    
    setCurrentOutfit(null)
  }

  // Filter items
  const filteredItems = selectedCategory === 'all'
    ? clothingItems
    : clothingItems.filter(item => item.category === selectedCategory)

  // Get item by ID
  const getItem = (id: string | undefined) => {
    if (!id) return null
    return clothingItems.find(item => item.id === id)
  }

  // Category counts
  const categoryCounts = clothingItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<ClothingCategory, number>)

  // Regenerate outfit
  const handleRegenerateOutfit = () => {
    handleGenerateOutfit(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Leora Outfits Message */}
        <div className="bg-gradient-to-r from-[#E8C5B5]/20 to-pink-100/20 border-2 border-[#E8C5B5]/40 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🐆</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1F1F1F]">{getLeoraOutfitsMessage()}</p>
            </div>
          </div>
        </div>

        {/* Mascot with custom message */}
        {leoraMessage && (
          <LeoraMascotEnhanced 
            section="outfits"
            customMessage={leoraMessage}
            autoHide={true}
            autoHideDelay={8000}
          />
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-serif font-bold text-[#1F1F1F] mb-2">
            My Wardrobe
          </h1>
          <p className="text-[#8F8F8F] text-lg">
            Organize your clothes and get daily outfit suggestions
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#1F1F1F]">{clothingItems.length}</div>
              <p className="text-sm text-[#8F8F8F]">Total Items</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-0">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-[#1F1F1F]">{savedOutfits.length}</div>
                <p className="text-sm text-[#8F8F8F]">Outfits Saved</p>
              </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#1F1F1F]">
                {clothingItems.filter(i => i.isFavorite).length}
              </div>
              <p className="text-sm text-[#8F8F8F]">Favorites</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <Button
                onClick={() => handleGenerateOutfit(false)}
                className="w-full"
                disabled={clothingItems.length < 3}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Outfit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="wardrobe">Wardrobe</TabsTrigger>
            <TabsTrigger value="generator">Generate</TabsTrigger>
            <TabsTrigger value="saved">My Outfits</TabsTrigger>
            <TabsTrigger value="manual">Create Manual</TabsTrigger>
          </TabsList>

          {/* Wardrobe Tab */}
          <TabsContent value="wardrobe" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Wardrobe</CardTitle>
                  <CardDescription>
                    {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in your collection
                    {forcedItemIds.length > 0 && (
                      <span className="ml-2 text-[#E8C5B5]">
                        • {forcedItemIds.length} selected for outfit
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {forcedItemIds.length > 0 && (
                    <Button 
                      onClick={() => setForcedItemIds([])} 
                      size="sm"
                      variant="outline"
                      className="bg-transparent"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Selection
                    </Button>
                  )}
                  <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Clothing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {(['all', 'top', 'bottom', 'dress', 'shoes', 'outerwear', 'accessory'] as const).map((cat) => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      className={selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-transparent'}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === 'all' ? 'All' : CATEGORY_LABELS[cat as ClothingCategory]}
                    </Button>
                  ))}
                </div>

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Shirt className="h-16 w-16 text-[#8F8F8F]/30 mx-auto mb-4" />
                    <p className="text-[#8F8F8F] mb-4">No items in this category yet</p>
                    <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => {
                      const isSelected = forcedItemIds.includes(item.id)
                      return (
                        <Card 
                          key={item.id} 
                          className={`overflow-hidden border-2 transition-all ${
                            isSelected ? 'border-[#E8C5B5] ring-2 ring-[#E8C5B5]/50' : ''
                          }`}
                        >
                          {/* Image */}
                          <div className="aspect-square bg-[#FAFAF9] relative">
                            <img
                              src={item.thumbnailUrl || "/placeholder.svg"}
                              alt={item.category}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Selection Checkbox */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className={`absolute top-2 left-2 ${
                                isSelected 
                                  ? 'bg-[#E8C5B5] hover:bg-[#d9b5a5]' 
                                  : 'bg-white/80 hover:bg-white'
                              }`}
                              onClick={() => toggleForcedItem(item.id)}
                            >
                              <Check 
                                className={`h-4 w-4 ${
                                  isSelected ? 'text-white' : 'text-transparent'
                                }`}
                              />
                            </Button>
                            
                            {/* Favorite Toggle */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                              onClick={() => toggleFavorite(item.id)}
                            >
                              <Heart 
                                className={`h-4 w-4 ${item.isFavorite ? 'fill-red-500 text-red-500' : 'text-[#8F8F8F]'}`}
                              />
                            </Button>
                          </div>

                          {/* Info */}
                          <CardContent className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    {CATEGORY_LABELS[item.category]}
                                    {item.categoryConfidence < 70 && ' ⚠️'}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuLabel>Change Category</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {(['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'] as ClothingCategory[]).map((cat) => (
                                    <DropdownMenuItem
                                      key={cat}
                                      onClick={() => updateItemCategory(item.id, cat)}
                                      className={item.category === cat ? 'bg-secondary' : ''}
                                    >
                                      {CATEGORY_LABELS[cat]}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: item.dominantColor }}
                                title={`Color: ${item.dominantColor}`}
                              />
                            </div>
                            {item.wearCount > 0 && (
                              <p className="text-xs text-[#8F8F8F]">
                                Worn {item.wearCount} {item.wearCount === 1 ? 'time' : 'times'}
                              </p>
                            )}
                          </CardContent>

                          {/* Actions */}
                          <CardFooter className="p-3 pt-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Outfits Tab */}
          <TabsContent value="saved" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle>My Saved Outfits</CardTitle>
                <CardDescription>
                  {savedOutfits.length} outfit{savedOutfits.length !== 1 ? 's' : ''} saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedOutfits.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-[#8F8F8F]/30 mx-auto mb-4" />
                    <p className="text-[#8F8F8F] mb-4">No saved outfits yet</p>
                    <Button onClick={() => setActiveTab('generator')} variant="outline">
                      Generate Your First Outfit
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {savedOutfits.map((outfit: any) => (
                      <Card 
                        key={outfit.id} 
                        className="border-2 cursor-pointer hover:border-[#E8C5B5] transition-all hover:shadow-lg"
                        onClick={() => handleOpenOutfit(outfit)}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-square bg-[#FAFAF9] rounded-lg mb-3 p-2 grid grid-cols-2 gap-2">
                            {outfit.topId && (
                              <img
                                src={getItem(outfit.topId)?.thumbnailUrl || "/placeholder.svg"}
                                alt="Top"
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                            {outfit.bottomId && (
                              <img
                                src={getItem(outfit.bottomId)?.thumbnailUrl || "/placeholder.svg"}
                                alt="Bottom"
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                            {outfit.dressId && (
                              <img
                                src={getItem(outfit.dressId)?.thumbnailUrl || "/placeholder.svg"}
                                alt="Dress"
                                className="w-full h-full object-cover rounded col-span-2"
                              />
                            )}
                            {outfit.shoesId && (
                              <img
                                src={getItem(outfit.shoesId)?.thumbnailUrl || "/placeholder.svg"}
                                alt="Shoes"
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          {outfit.name && (
                            <h4 className="font-medium text-[#1F1F1F] mb-1">{outfit.name}</h4>
                          )}
                          <p className="text-xs text-[#8F8F8F] mb-2">
                            {outfit.isManuallyCreated ? 'Manual' : 'Generated'} • 
                            Worn {outfit.wearCount}x
                          </p>
                          <p className="text-xs text-[#8F8F8F]">
                            Click to view details
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outfit Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            {!currentOutfit ? (
              <Card className="bg-white shadow-sm border-0">
                <CardContent>
                  <div className="text-center py-12">
                    <Sparkles className="h-16 w-16 text-[#E8C5B5] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">AI Outfit Generator</h3>
                    <p className="text-[#8F8F8F] mb-4">
                      Generate a complete outfit based on your wardrobe and today's weather
                    </p>
                    {forcedItemIds.length > 0 && (
                      <div className="bg-[#E8C5B5]/20 border-2 border-[#E8C5B5] rounded-lg p-4 mb-4 inline-block">
                        <p className="text-sm font-medium text-[#1F1F1F]">
                          {forcedItemIds.length} item{forcedItemIds.length !== 1 ? 's' : ''} selected
                        </p>
                        <p className="text-xs text-[#8F8F8F]">
                          The outfit will include your selected items
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Button 
                        onClick={() => handleGenerateOutfit(false)}
                        size="lg"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Outfit
                      </Button>
                      <p className="text-xs text-[#8F8F8F]">
                        Tip: Select items in your wardrobe to include them in the outfit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white shadow-sm border-0">
                <CardHeader>
                  <CardTitle>Your Generated Outfit</CardTitle>
                  <CardDescription>
                    {currentOutfit.temperature}°C • {currentOutfit.weatherConditions.condition}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Outfit Preview Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentOutfit.topId && (
                      <div className="space-y-2">
                        <div className="aspect-square bg-[#FAFAF9] rounded-lg overflow-hidden">
                          <img
                            src={getItem(currentOutfit.topId)?.thumbnailUrl || "/placeholder.svg"}
                            alt="Top"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#8F8F8F]">Top</p>
                          {forcedItemIds.includes(currentOutfit.topId) && (
                            <Badge className="bg-[#E8C5B5] text-[#1F1F1F] text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {currentOutfit.bottomId && (
                      <div className="space-y-2">
                        <div className="aspect-square bg-[#FAFAF9] rounded-lg overflow-hidden">
                          <img
                            src={getItem(currentOutfit.bottomId)?.thumbnailUrl || "/placeholder.svg"}
                            alt="Bottom"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#8F8F8F]">Bottom</p>
                          {forcedItemIds.includes(currentOutfit.bottomId) && (
                            <Badge className="bg-[#E8C5B5] text-[#1F1F1F] text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {currentOutfit.dressId && (
                      <div className="space-y-2 col-span-2">
                        <div className="aspect-square bg-[#FAFAF9] rounded-lg overflow-hidden">
                          <img
                            src={getItem(currentOutfit.dressId)?.thumbnailUrl || "/placeholder.svg"}
                            alt="Dress"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#8F8F8F]">Dress</p>
                          {forcedItemIds.includes(currentOutfit.dressId) && (
                            <Badge className="bg-[#E8C5B5] text-[#1F1F1F] text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {currentOutfit.shoesId && (
                      <div className="space-y-2">
                        <div className="aspect-square bg-[#FAFAF9] rounded-lg overflow-hidden">
                          <img
                            src={getItem(currentOutfit.shoesId)?.thumbnailUrl || "/placeholder.svg"}
                            alt="Shoes"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#8F8F8F]">Shoes</p>
                          {forcedItemIds.includes(currentOutfit.shoesId) && (
                            <Badge className="bg-[#E8C5B5] text-[#1F1F1F] text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {currentOutfit.outerwearId && (
                      <div className="space-y-2">
                        <div className="aspect-square bg-[#FAFAF9] rounded-lg overflow-hidden">
                          <img
                            src={getItem(currentOutfit.outerwearId)?.thumbnailUrl || "/placeholder.svg"}
                            alt="Jacket"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#8F8F8F]">Jacket</p>
                          {forcedItemIds.includes(currentOutfit.outerwearId) && (
                            <Badge className="bg-[#E8C5B5] text-[#1F1F1F] text-xs">Selected</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Leora Feedback */}
                  {leoraMessage && (
                    <div className="bg-[#E8C5B5]/20 border-2 border-[#E8C5B5] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">🐆</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-[#1F1F1F] mb-1">Leora says:</h4>
                          <p className="text-sm text-[#1F1F1F]">{leoraMessage}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => setIsSaveDialogOpen(true)}
                      className="flex-1 bg-[#E8C5B5] hover:bg-[#d9b5a5] text-[#1F1F1F]"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Save Outfit
                    </Button>
                    <Button 
                      onClick={() => handleGenerateOutfit(true)}
                      variant="outline"
                      className="flex-1 bg-transparent"
                      disabled={isRegenerating}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                      {isRegenerating ? 'Generating...' : 'Regenerate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Manual Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle>Create Your Own Outfit</CardTitle>
                <CardDescription>
                  Select items from your wardrobe to create a custom outfit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selection Display */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block">Selected Items</Label>
                    <div className="space-y-2 text-sm">
                      <div>Top: {manualSelection.topId ? '✓' : '○'}</div>
                      <div>Bottom: {manualSelection.bottomId ? '✓' : '○'}</div>
                      <div>Dress: {manualSelection.dressId ? '✓' : '○'}</div>
                      <div>Shoes: {manualSelection.shoesId ? '✓ Required' : '○ Required'}</div>
                      <div>Jacket: {manualSelection.outerwearId ? '✓' : '○ Optional'}</div>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Save Details</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Outfit name (optional)"
                        value={outfitName}
                        onChange={(e) => setOutfitName(e.target.value)}
                      />
                      <Button 
                        onClick={handleSaveManual}
                        className="w-full bg-[#1F1F1F] hover:bg-[#2F2F2F]"
                      >
                        Save Manual Outfit
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Item Selection */}
                <div>
                  <Label className="mb-3 block">Select from Your Wardrobe</Label>
                  <Tabs defaultValue="top">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="top">Tops</TabsTrigger>
                      <TabsTrigger value="bottom">Bottoms</TabsTrigger>
                      <TabsTrigger value="dress">Dresses</TabsTrigger>
                      <TabsTrigger value="shoes">Shoes</TabsTrigger>
                      <TabsTrigger value="outerwear">Jackets</TabsTrigger>
                    </TabsList>
                    {(['top', 'bottom', 'dress', 'shoes', 'outerwear'] as ClothingCategory[]).map(cat => (
                      <TabsContent key={cat} value={cat}>
                        <div className="grid gap-3 grid-cols-3 md:grid-cols-4">
                          {clothingItems.filter(item => item.category === cat).map(item => (
                            <div
                              key={item.id}
                              onClick={() => handleManualSelect(cat, item.id)}
                              className="cursor-pointer border-2 rounded-lg overflow-hidden hover:border-[#E8C5B5] transition"
                            >
                              <img
                                src={item.thumbnailUrl || "/placeholder.svg"}
                                alt={cat}
                                className="w-full aspect-square object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Clothing Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Clothing Item</DialogTitle>
              <DialogDescription>
                Take a photo or upload from your gallery
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="h-32 flex-col gap-2 bg-transparent"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-8 w-8" />
                <span>Take Photo</span>
              </Button>
              <Button
                variant="outline"
                className="h-32 flex-col gap-2 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8" />
                <span>Upload Photo</span>
              </Button>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleCameraCapture}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </DialogContent>
        </Dialog>

        {/* Outfit Detail Dialog */}
        <Dialog open={isOutfitDetailOpen} onOpenChange={setIsOutfitDetailOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedOutfit?.name || 'Outfit Details'}
              </DialogTitle>
              <DialogDescription>
                Created {selectedOutfit?.createdAt ? new Date(selectedOutfit.createdAt).toLocaleDateString() : ''}
                {' • '}
                {selectedOutfit?.isManuallyCreated ? 'Manual' : 'Generated'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOutfit && (
              <div className="space-y-6">
                {/* Outfit Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedOutfit.topId && (
                    <div className="space-y-2">
                      <img
                        src={getItem(selectedOutfit.topId)?.thumbnailUrl || "/placeholder.svg"}
                        alt="Top"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <p className="text-xs text-center text-[#8F8F8F]">Top</p>
                    </div>
                  )}
                  {selectedOutfit.bottomId && (
                    <div className="space-y-2">
                      <img
                        src={getItem(selectedOutfit.bottomId)?.thumbnailUrl || "/placeholder.svg"}
                        alt="Bottom"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <p className="text-xs text-center text-[#8F8F8F]">Bottom</p>
                    </div>
                  )}
                  {selectedOutfit.dressId && (
                    <div className="space-y-2">
                      <img
                        src={getItem(selectedOutfit.dressId)?.thumbnailUrl || "/placeholder.svg"}
                        alt="Dress"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <p className="text-xs text-center text-[#8F8F8F]">Dress</p>
                    </div>
                  )}
                  {selectedOutfit.shoesId && (
                    <div className="space-y-2">
                      <img
                        src={getItem(selectedOutfit.shoesId)?.thumbnailUrl || "/placeholder.svg"}
                        alt="Shoes"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <p className="text-xs text-center text-[#8F8F8F]">Shoes</p>
                    </div>
                  )}
                  {selectedOutfit.outerwearId && (
                    <div className="space-y-2">
                      <img
                        src={getItem(selectedOutfit.outerwearId)?.thumbnailUrl || "/placeholder.svg"}
                        alt="Jacket"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <p className="text-xs text-center text-[#8F8F8F]">Jacket</p>
                    </div>
                  )}
                </div>

                {/* Outfit Details */}
                <div className="space-y-2">
                  <h4 className="font-medium text-[#1F1F1F]">Outfit Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-[#8F8F8F]">Worn:</span> {selectedOutfit.wearCount} times</p>
                    {selectedOutfit.note && (
                      <p><span className="text-[#8F8F8F]">Note:</span> {selectedOutfit.note}</p>
                    )}
                  </div>
                </div>

                {/* Leora Feedback Section */}
                {leoraMessage && (
                  <div className="bg-[#E8C5B5]/20 border-2 border-[#E8C5B5] rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🐆</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1F1F1F] mb-1">Leora says:</h4>
                        <p className="text-sm text-[#1F1F1F]">{leoraMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsOutfitDetailOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteSaved(selectedOutfit.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Outfit
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Save Outfit Dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save This Outfit</DialogTitle>
              <DialogDescription>
                Give your outfit a name and add a note (optional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="outfit-name">Outfit Name</Label>
                <Input
                  id="outfit-name"
                  placeholder="e.g. Summer Casual"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="outfit-note">Note</Label>
                <Input
                  id="outfit-note"
                  placeholder="e.g. Perfect for weekend brunch"
                  value={outfitNote}
                  onChange={(e) => setOutfitNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOutfit}>
                Save Outfit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MANUAL Category Selection Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>What type of clothing is this?</DialogTitle>
              <DialogDescription>
                Select the category for this item
              </DialogDescription>
            </DialogHeader>
            
            {tempImage && (
              <div className="flex justify-center py-4">
                <img 
                  src={tempImage || "/placeholder.svg"} 
                  alt="Clothing preview"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="h-16 flex-col gap-1 bg-transparent hover:bg-[#E8C5B5]/20"
                  onClick={() => handleCategorySelected(category)}
                >
                  <span className="font-medium">{CATEGORY_LABELS[category]}</span>
                  <span className="text-xs text-[#8F8F8F]">
                    {category === 'top' && 'Shirts, sweaters, tops'}
                    {category === 'bottom' && 'Pants, jeans, skirts'}
                    {category === 'dress' && 'Dresses, jumpsuits'}
                    {category === 'shoes' && 'All footwear'}
                    {category === 'outerwear' && 'Jackets, coats'}
                    {category === 'accessory' && 'Bags, hats, jewelry'}
                  </span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-white p-6">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="h-8 w-8 animate-spin text-[#E8C5B5]" />
                <p className="text-[#1F1F1F] font-medium">Processing...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
