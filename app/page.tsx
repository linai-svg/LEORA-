"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Target, Brain, Heart, Dumbbell, Shirt, Camera, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard/home")
    }
  }, [isAuthenticated, router])

  const features = [
    { icon: Calendar, title: "Weekly Agenda", description: "Plan your week with ease" },
    { icon: Target, title: "Goal Tracking", description: "Set and achieve your goals" },
    { icon: Brain, title: "Study & Notes", description: "Organize your learning" },
    { icon: Heart, title: "Mood Tracker", description: "Track your emotional wellbeing" },
    { icon: Dumbbell, title: "Sport Activity", description: "Monitor your fitness journey" },
    { icon: Shirt, title: "Outfit Planner", description: "Organize your wardrobe" },
    { icon: Camera, title: "Photo Dump", description: "Share moments with friends" },
    { icon: Sparkles, title: "And More", description: "Discover all features" },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight gradient-text">
              Leora
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              Your all-in-one digital planner for a beautifully organized life
            </p>
          </div>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-xl">
            Transform your daily routine with our elegant planning tools. From weekly agendas to mood tracking, 
            everything you need in one aesthetic space.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 bg-transparent">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-2">
            Only 1€/month after 7-day free trial
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Everything you need to thrive
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Carefully designed features that work together to help you stay organized, 
            motivated, and mindful.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl p-12 md:p-20 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
            Start your journey today
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their daily organization with Leora
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
            <Link href="/register">Try 7 Days Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Leora. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
