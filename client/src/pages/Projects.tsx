import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import type { Project } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await api.get<Project[]>('/api/projects')
                setProjects(response.data)
            } catch (err: unknown) {
                const errorData = (err as { response?: { data?: { error?: string, message?: string } } })?.response?.data
                setError(errorData?.error ?? errorData?.message ?? 'Failed to load projects')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    if (loading) {
        return (
            <div className="page-header">
                <h1 className="page-title skeleton-text w-48"></h1>
                <div className="projects-grid mt-6">
                    <div className="project-card skeleton" style={{ height: '120px' }}></div>
                    <div className="project-card skeleton" style={{ height: '120px' }}></div>
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

    return (
        <div className="projects-page">
            <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">Manage all your projects and tasks.</p>
                </div>
                {user?.role !== 'VIEWER' && (
                    <Link to="/projects/new" className="btn btn-primary w-full sm:w-auto">
                        Create Project
                    </Link>
                )}
            </div>

            {projects.length > 0 ? (
                <div className="projects-grid">
                    {projects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                            <div className="project-card-header mb-4">
                                <h3 className="project-card-title">{project.title}</h3>
                                {project.description && (
                                    <p className="project-card-description mt-2 text-muted">{project.description}</p>
                                )}
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
                    <h3>No projects found</h3>
                    <p>Get started by creating your first project.</p>
                    {user?.role !== 'VIEWER' && (
                        <Link to="/projects/new" className="btn btn-primary mt-4">Create Project</Link>
                    )}
                </div>
            )}
        </div>
    )
}
