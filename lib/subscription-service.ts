/**
 * Subscription Service for PayPal Integration
 * Handles premium subscriptions, trials, and feature access
 */

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "monthly" | "yearly"
  features: string[]
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "premium_monthly",
    name: "Premium Monthly",
    price: 4.99,
    interval: "monthly",
    features: [
      "Unlimited goals and notes",
      "Advanced analytics and insights",
      "Custom mascot personalities",
      "Priority support",
      "Export data feature",
      "Ad-free experience"
    ]
  },
  {
    id: "premium_yearly",
    name: "Premium Yearly",
    price: 49.99,
    interval: "yearly",
    features: [
      "All monthly features",
      "2 months free (20% savings)",
      "Early access to new features",
      "Exclusive themes and customization"
    ]
  }
]

export interface SubscriptionStatus {
  isActive: boolean
  plan: SubscriptionPlan | null
  expiresAt: string | null
  isTrial: boolean
  trialEndsAt: string | null
}

/**
 * Check if user has access to premium features
 */
export function hasPremiumAccess(user: { isPremium: boolean, premiumUntil?: string } | null): boolean {
  if (!user) return false
  if (!user.isPremium) return false
  
  // Check if subscription hasn't expired
  if (user.premiumUntil) {
    return new Date(user.premiumUntil) > new Date()
  }
  
  return user.isPremium
}

/**
 * Get days remaining in subscription
 */
export function getDaysRemaining(premiumUntil?: string): number {
  if (!premiumUntil) return 0
  
  const expiryDate = new Date(premiumUntil)
  const now = new Date()
  const diff = expiryDate.getTime() - now.getTime()
  
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

/**
 * Start free trial (7 days)
 */
export function startFreeTrial(userId: string): { isPremium: boolean, premiumUntil: string } {
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 7)
  
  return {
    isPremium: true,
    premiumUntil: trialEnd.toISOString()
  }
}

/**
 * Check if feature requires premium
 */
export function isPremiumFeature(feature: string): boolean {
  const premiumFeatures = [
    "unlimited_goals",
    "advanced_analytics",
    "custom_mascot",
    "data_export",
    "priority_support",
    "custom_themes"
  ]
  
  return premiumFeatures.includes(feature)
}

/**
 * Initialize PayPal subscription (placeholder for actual integration)
 * In production, this would communicate with PayPal API
 */
export async function initializePayPalSubscription(
  planId: string,
  userId: string
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  // Placeholder logic - replace with actual PayPal SDK integration
  console.log("[v0] Initializing PayPal subscription for plan:", planId, "user:", userId)
  
  // In production:
  // 1. Create PayPal subscription via API
  // 2. Get approval URL
  // 3. Redirect user to PayPal for payment
  // 4. Handle webhook for subscription confirmation
  // 5. Update user's premium status
  
  return {
    success: false,
    error: "Payment integration not yet active. This is a preview version."
  }
}

/**
 * Cancel subscription (placeholder)
 */
export async function cancelSubscription(
  subscriptionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  console.log("[v0] Canceling subscription:", subscriptionId, "for user:", userId)
  
  // In production:
  // 1. Call PayPal API to cancel subscription
  // 2. Update user's premium status
  // 3. Set expiry date to end of current billing period
  
  return {
    success: false,
    error: "Cancellation not yet active. Contact support."
  }
}
