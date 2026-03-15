import { useState, useEffect } from 'react'
import { api } from '../api'
import { useAuth } from '../contexts/AuthContext'

interface SubscriptionInfo {
    plan: string
    status: string
    currentPeriodEnd?: string
}

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '$0',
        period: '/month',
        description: 'Perfect for getting started',
        features: [
            'Up to 3 projects',
            'Basic task management',
            'Community support',
        ],
        cta: 'Current Plan',
        priceId: null,
        accent: 'slate',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$19',
        period: '/month',
        description: 'For growing teams & professionals',
        features: [
            'Unlimited projects',
            'Advanced task management',
            'Priority support',
            'Custom labels & tags',
            'Export & integrations',
        ],
        cta: 'Upgrade to Pro',
        priceId: 'pro',
        accent: 'indigo',
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: '$49',
        period: '/month',
        description: 'For large organizations',
        features: [
            'Everything in Pro',
            'Team collaboration',
            'Admin dashboard & analytics',
            'SSO & advanced security',
            'Dedicated support',
            'Custom onboarding',
        ],
        cta: 'Upgrade to Enterprise',
        priceId: 'enterprise',
        accent: 'emerald',
    },
]

const PLAN_HIERARCHY: Record<string, number> = {
    'free': 0,
    'pro': 1,
    'enterprise': 2
}

export default function Pricing() {
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'

    const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('success') === 'true') {
            setMessage({ type: 'success', text: '🎉 Subscription successful! Your plan is now active.' })
            window.history.replaceState({}, '', '/pricing')
        }
        if (params.get('canceled') === 'true') {
            setMessage({ type: 'error', text: 'Checkout was canceled. No charges were made.' })
            window.history.replaceState({}, '', '/pricing')
        }
        fetchSubscription()
    }, [])

    async function fetchSubscription() {
        try {
            const res = await api.get<SubscriptionInfo>('/api/stripe/subscription')
            setSubscription(res.data)
        } catch {
            setSubscription({ plan: 'free', status: 'inactive' })
        } finally {
            setLoading(false)
        }
    }

    async function handleCheckout(planId: string) {
        setCheckoutLoading(planId)
        setMessage(null)
        try {
            // The server reads the env var; we send the priceId value which the server validates
            const res = await api.post<{ url: string }>('/api/stripe/create-checkout-session', {
                planId: planId,
            })
            if (res.data.url) {
                window.location.href = res.data.url
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to start checkout. Please try again.' })
        } finally {
            setCheckoutLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="pricing-page">
                <div className="page-header text-center">
                    <h1 className="page-title skeleton-text w-48 mx-auto"></h1>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="stat-card skeleton h-96"></div>
                        <div className="stat-card skeleton h-96"></div>
                        <div className="stat-card skeleton h-96"></div>
                    </div>
                </div>
            </div>
        )
    }

    const currentPlan = subscription?.plan || 'free'
    const currentUserPlanLevel = PLAN_HIERARCHY[currentPlan] ?? 0

    return (
        <div className="pricing-page">
            <div className="page-header text-center">
                <h1 className="page-title">Choose Your Plan</h1>
                <p className="page-subtitle">
                    Start free, upgrade when you need more power.
                </p>
                <p className="mt-4 text-xs text-slate-500/80 italic max-w-2xl mx-auto px-4">
                    Demo Notice: This page is part of a freelance developer portfolio. Features in subscription plans are for demonstration purposes and do not necessarily represent active functionality.
                </p>
            </div>

            {message && (
                <div
                    className={`mt-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success'
                        ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-300'
                        : 'bg-red-900/30 border border-red-700/50 text-red-300'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {PLANS.map((plan) => {
                    const isCurrentPlan = currentPlan === plan.id
                    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

                    return (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${plan.popular
                                ? 'border-indigo-500/60 bg-slate-800/90 shadow-lg shadow-indigo-900/20'
                                : 'border-slate-700 bg-slate-800/60'
                                } ${isCurrentPlan && isActive ? 'ring-2 ring-indigo-500' : ''}`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Most Popular
                                </span>
                            )}

                            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                            <p className="text-sm text-slate-400 mt-1">{plan.description}</p>

                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                <span className="text-slate-400 text-sm">{plan.period}</span>
                            </div>

                            <ul className="mt-6 flex-1 space-y-3">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                                        <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                {isAdmin ? (
                                    <button disabled className="btn btn-secondary w-full opacity-60">
                                        Admin View
                                    </button>
                                ) : currentUserPlanLevel >= PLAN_HIERARCHY[plan.id] ? (
                                    <button disabled className="btn btn-secondary w-full opacity-60">
                                        {isCurrentPlan ? 'Current Plan' : 'Included'}
                                    </button>
                                ) : plan.priceId ? (
                                    <button
                                        onClick={() => handleCheckout(plan.priceId!)}
                                        disabled={checkoutLoading !== null}
                                        className="btn w-full btn-primary"
                                    >
                                        {checkoutLoading === plan.priceId ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Processing…
                                            </span>
                                        ) : (
                                            plan.cta
                                        )}
                                    </button>
                                ) : (
                                    <button disabled className="btn btn-secondary w-full opacity-60">
                                        Included
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {subscription?.currentPeriodEnd && subscription.status === 'active' && (
                <p className="mt-8 text-center text-sm text-slate-400">
                    Your <span className="font-semibold text-indigo-400">{currentPlan}</span> plan renews on{' '}
                    <span className="font-semibold text-white">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                </p>
            )}

        </div>
    )
}
