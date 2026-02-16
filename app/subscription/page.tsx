'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, CreditCard, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const features = [
    'Unlimited notes & events',
    'Weekly agenda planning',
    'Study session tracking',
    'Goals management (monthly & yearly)',
    'Mood tracker with insights',
    'Sport activity logging',
    'Outfit organization',
    'Photo dump with 24h streaks',
    'Offline access',
    'Priority support',
  ]

  const handleSubscribe = async () => {
    setIsLoading(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock PayPal subscription success
    // In production, this would integrate with real PayPal API
    const premiumUntil = new Date()
    premiumUntil.setMonth(premiumUntil.getMonth() + 1)
    
    updateUser({
      isPremium: true,
      premiumUntil: premiumUntil.toISOString(),
    })
    
    setIsLoading(false)
    router.push('/dashboard/home')
  }

  if (user?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-soft-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">You're Premium!</CardTitle>
            <CardDescription>Thank you for supporting Leora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Premium until</p>
              <p className="text-2xl font-bold">
                {user.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString() : 'Active'}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Your Premium Benefits:</p>
              <ul className="space-y-2">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => router.push('/dashboard/home')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">Upgrade to Premium</h1>
          <p className="text-xl text-muted-foreground">Unlock all features and support Leora</p>
        </div>

        <Card className="shadow-soft-lg border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl">Premium Plan</CardTitle>
            <div className="flex items-baseline justify-center gap-2 pt-4">
              <span className="text-5xl font-bold gradient-text">1€</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <CardDescription className="pt-2">7-day free trial included</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Payment Information</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure payment processing via PayPal. Your subscription will automatically renew monthly. Cancel anytime.
              </p>
            </div>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Start 7-Day Free Trial
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our Terms of Service and Privacy Policy. 
              Your subscription will auto-renew at 1€/month after the trial period.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard/home')}>
            Continue with Free Plan
          </Button>
        </div>
      </div>
    </div>
  )
}
