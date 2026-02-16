"use client"

import React from "react"
import { MascotProvider } from "@/context/MascotContext"
import { MascotSettingsDialog } from "@/components/mascot/mascot-settings-dialog"
import { useAuth } from "@/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Settings } from "lucide-react" // Import Settings icon
import {
  Home,
  Calendar,
  BookOpen,
  StickyNote,
  Target,
  Heart,
  Dumbbell,
  Shirt,
  Camera,
  Menu,
  Crown,
  LogOut,
  User,
} from "lucide-react"
import Link from "next/link"

const navigation = [
  { name: "Home", href: "/dashboard/home", icon: Home },
  { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { name: "Study", href: "/dashboard/study", icon: BookOpen },
  { name: "Notes", href: "/dashboard/notes", icon: StickyNote },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "Mood", href: "/dashboard/mood", icon: Heart },
  { name: "Sport", href: "/dashboard/sport", icon: Dumbbell },
  { name: "Outfits", href: "/dashboard/outfits", icon: Shirt },
  { name: "Photo Dump", href: "/dashboard/photo-dump", icon: Camera },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMascotSettingsOpen, setIsMascotSettingsOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <MascotProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center border-b">
              <h1 className="font-serif text-2xl font-bold gradient-text">Leora</h1>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className={`
                              group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all
                              ${
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              }
                            `}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
                <li className="mt-auto">
                  {!user?.isPremium && (
                    <Link
                      href="/subscription"
                      className="group -mx-2 flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all"
                    >
                      <Crown className="h-5 w-5 shrink-0 text-primary" />
                      <span className="text-primary">Upgrade to Premium</span>
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-card/95 backdrop-blur px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center border-b">
                  <h1 className="font-serif text-2xl font-bold gradient-text">Leora</h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                  group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all
                                  ${
                                    isActive
                                      ? "bg-primary/10 text-primary"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  }
                                `}
                              >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      {!user?.isPremium && (
                        <Link
                          href="/subscription"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="group -mx-2 flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 bg-gradient-to-r from-primary/10 to-accent/10"
                        >
                          <Crown className="h-5 w-5 shrink-0 text-primary" />
                          <span className="text-primary">Upgrade to Premium</span>
                        </Link>
                      )}
                    </li>
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 font-serif text-xl font-bold gradient-text">Leora</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/subscription" className="cursor-pointer">
                  <Crown className="mr-2 h-4 w-4" />
                  {user?.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsMascotSettingsOpen(true)} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Mascot Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card/95 backdrop-blur px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1" />
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:flex lg:items-center">
                        <span className="text-sm font-medium">{user?.name}</span>
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/subscription" className="cursor-pointer">
                        <Crown className="mr-2 h-4 w-4" />
                        {user?.isPremium ? "Manage Subscription" : "Upgrade to Premium"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsMascotSettingsOpen(true)} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Mascot Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="lg:pl-72">
          <div className="px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>

        {/* Mascot Settings Dialog */}
        <MascotSettingsDialog 
          open={isMascotSettingsOpen} 
          onOpenChange={setIsMascotSettingsOpen} 
        />
      </div>
    </MascotProvider>
  )
}
