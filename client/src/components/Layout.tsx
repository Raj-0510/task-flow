import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/auth.css' // using shared styles

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null)

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (user) {
            fetchSubscription()
        }
    }, [user])

    useEffect(() => {
        // Close menu when location changes
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    async function fetchSubscription() {
        try {
            const { api } = await import('../api')
            const res = await api.get('/api/stripe/subscription')
            setSubscriptionPlan(res.data.plan)
        } catch {
            setSubscriptionPlan('free')
        }
    }

    function handleLogout() {
        logout()
        navigate('/login', { replace: true })
    }

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="header-brand">
                    <Link to="/dashboard" className="brand-link">
                        <span className="brand-icon">⚡</span>
                        TaskFlow
                    </Link>
                </div>

                <nav className="header-nav">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/projects"
                        className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}
                    >
                        Projects
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/admin/users"
                            className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                        >
                            Users
                        </Link>
                    )}
                    <Link
                        to="/pricing"
                        className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
                    >
                        Pricing
                    </Link>
                </nav>

                <div className="header-user">
                    <div className="user-info">
                        <span className="user-name">{user?.name || user?.email}</span>
                        {subscriptionPlan && <span className="user-role badge" style={{ backgroundColor: subscriptionPlan === 'enterprise' ? '#059669' : subscriptionPlan === 'pro' ? '#4f46e5' : '#475569', color: 'white', opacity: 0.9 }}>{subscriptionPlan.toUpperCase()}</span>}
                        {user?.role && <span className="user-role badge">{user.role}</span>}
                    </div>
                    <button onClick={handleLogout} className="logout-button hidden md:block">
                        Log out
                    </button>
                    <button 
                        className="menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="mobile-drawer-overlay" 
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <div className={`mobile-drawer ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="mobile-drawer-header">
                    <span className="font-bold text-white flex items-center gap-2">
                        <span className="text-xl">⚡</span> TaskFlow
                    </span>
                    <button className="p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
                </div>
                <div className="mobile-drawer-content">
                    <div className="px-3 py-2 mb-4 border-b border-slate-800">
                        <div className="text-sm font-medium text-white truncate">{user?.name || user?.email}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{subscriptionPlan} • {user?.role}</div>
                    </div>
                    <Link to="/dashboard" className={`mobile-drawer-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/projects" className={`mobile-drawer-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>
                        <span>📁</span> Projects
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link to="/admin/users" className={`mobile-drawer-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                            <span>👥</span> Users
                        </Link>
                    )}
                    <Link to="/pricing" className={`mobile-drawer-link ${location.pathname === '/pricing' ? 'active' : ''}`}>
                        <span>💎</span> Pricing
                    </Link>
                </div>
                <div className="mobile-drawer-footer">
                    <button onClick={handleLogout} className="mobile-drawer-link w-full text-red-400 hover:bg-red-900/10">
                        <span>🚪</span> Log out
                    </button>
                </div>
            </div>

            <main className="layout-main container">
                <Outlet />
            </main>
        </div>
    )
}
