import { Link } from 'react-router-dom'
import '../styles/landing.css'

const FEATURES = [
    {
        title: 'Unlimited Projects',
        description: 'Create and ship as many projects as you want without limits.',
        icon: '🚀',
    },
    {
        title: 'Role-Based Access',
        description: 'Securely manage your team with built-in RBAC via JWT authentication.',
        icon: '🔒',
    },
    {
        title: 'Integrated Payments',
        description: 'Monetize instantly with our native Stripe checkout and webhooks.',
        icon: '💳',
    },
    {
        title: 'Beautiful UI',
        description: 'A modern, responsive dashboard built with React and TailwindCSS.',
        icon: '✨',
    },
]

const PRICING = [
    {
        name: 'Free',
        price: '$0',
        period: '/mo',
        description: 'Perfect for getting started.',
        features: ['Up to 3 projects', 'Basic task management', 'Community support'],
    },
    {
        name: 'Pro',
        price: '$19',
        period: '/mo',
        description: 'For growing teams & professionals.',
        features: ['Unlimited projects', 'Advanced task management', 'Priority support', 'Custom labels'],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '$49',
        period: '/mo',
        description: 'For large organizations.',
        features: ['Everything in Pro', 'Team collaboration', 'Admin dashboard', 'SSO security'],
    },
]

export default function Landing() {
    console.log("Current API URL>>");

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="brand">
                    <span className="brand-icon">⚡</span> TaskFlow
                </div>
                <div className="nav-links">
                    <Link to="/login" className="nav-link">Log in</Link>
                    <Link to="/register" className="nav-btn btn-primary">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section text-center">
                <div className="glass-pill mx-auto mb-6">v2.0 is now live 🎉</div>
                <h1 className="hero-title">
                    Manage Tasks With <span className="text-gradient">Lightning Speed</span>
                </h1>
                <p className="hero-subtitle max-w-2xl mx-auto mt-6">
                    The ultra-fast SaaS template that provides authentication, payments,
                    and a beautiful dashboard right out of the box. Ship your product in days, not months.
                </p>
                <div className="hero-actions mt-10 flex flex-col sm:flex-row gap-4 justify-center px-4">
                    <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto">Start for free</Link>
                    <a href="#features" className="btn btn-secondary btn-lg w-full sm:w-auto">See features</a>
                </div>

                {/* Dashboard Preview mockup */}
                <div className="hero-mockup mt-16">
                    <div className="mockup-window">
                        <div className="mockup-header">
                            <span className="dot bg-red-500"></span>
                            <span className="dot bg-yellow-400"></span>
                            <span className="dot bg-green-500"></span>
                        </div>
                        <div className="mockup-body border-t border-slate-800 bg-slate-900 w-full overflow-hidden flex">
                            <img src="/dashboard.png" alt="TaskFlow Dashboard" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-300" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="features-section py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Everything you need to ship</h2>
                        <p className="section-subtitle mt-4">Built with modern tools to give your startup an unfair advantage.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {FEATURES.map((feature, idx) => (
                            <div key={idx} className="feature-card glass-card">
                                <div className="feature-icon mb-6 text-4xl">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section py-16 md:py-24 bg-slate-950/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="section-title">Simple, transparent pricing</h2>
                        <p className="section-subtitle mt-4">No hidden fees. Upgrade when you need more power.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {PRICING.map((plan, idx) => (
                            <div key={idx} className={`pricing-card glass-card relative ${plan.popular ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/20 md:-translate-y-4' : ''}`}>
                                {plan.popular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                                )}
                                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-slate-400 text-sm">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-4">{plan.description}</p>

                                <ul className="mt-8 space-y-3 flex-1 mb-8">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                                            <span className="text-indigo-400">✓</span> {f}
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/register" className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section py-16 md:py-24 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="section-title text-3xl md:text-5xl max-w-3xl mx-auto">
                        Ready to see what TaskFlow can do for you?
                    </h2>
                    <p className="section-subtitle mt-6">
                        Join thousands of developers turning their ideas into reality.
                    </p>
                    <div className="mt-10 max-w-md mx-auto">
                        <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto">Create a Free Account</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer py-12 border-t border-slate-800 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} TaskFlow SaaS Developer Portfolio Demo.</p>
                <p className="mt-2 text-xs text-slate-600 italic px-4">
                    * This application is a freelance portfolio demonstration. Features in plans are illustrative and may not be functional in this build.
                </p>
            </footer>
        </div>
    )
}
