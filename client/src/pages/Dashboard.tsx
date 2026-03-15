import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { DashboardResponse } from '../types'

interface SubscriptionInfo {
  plan: string
  status: string
  currentPeriodEnd?: string
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [dashRes, subRes] = await Promise.all([
          api.get<DashboardResponse>('/api/dashboard'),
          api.get<SubscriptionInfo>('/api/stripe/subscription').catch(() => ({
            data: { plan: 'free', status: 'inactive' } as SubscriptionInfo,
          })),
        ])
        setData(dashRes.data)
        setSubscription(subRes.data)
      } catch (err: unknown) {
        const errorData = (err as { response?: { data?: { error?: string, message?: string } } })?.response?.data
        setError(errorData?.error ?? errorData?.message ?? 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="page-header">
        <h1 className="page-title skeleton-text w-48"></h1>
        <div className="stats-grid mt-6">
          <div className="stat-card skeleton"></div>
          <div className="stat-card skeleton"></div>
          <div className="stat-card skeleton"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-secondary mt-4">Retry</button>
      </div>
    )
  }

  const planLabel = subscription?.plan === 'enterprise'
    ? 'Enterprise'
    : subscription?.plan === 'pro'
      ? 'Pro'
      : 'Free'

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid mt-8">
        <div className="stat-card">
          <h3 className="stat-label">Total Projects</h3>
          <p className="stat-value">{data?.totalProjects || 0}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-label">Total Tasks</h3>
          <p className="stat-value">{data?.totalTasks || 0}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-label">Current Plan</h3>
          <p className="stat-value">{planLabel}</p>
          <div className="mt-3">
            {isActive ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                Active
              </span>
            ) : (
              <Link to="/pricing" className="btn-link text-sm">
                Upgrade →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="section-title">Recent Projects</h2>
          <Link to="/projects" className="btn-link">View all</Link>
        </div>

        {data?.recentProjects && data.recentProjects.length > 0 ? (
          <div className="projects-grid">
            {data.recentProjects.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3 className="project-card-title">{project.title}</h3>
                </div>
                <div className="project-card-meta">
                  <span>{project._count?.tasks || 0} tasks</span>
                  <span>•</span>
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No projects yet</h3>
            <p>Get started by creating your first project.</p>
            <Link to="/projects" className="btn btn-primary mt-4">Go to Projects</Link>
          </div>
        )}
      </div>
    </div>
  )
}