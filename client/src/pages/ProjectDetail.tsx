import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import type { Project, Task } from '../types'
import { useAuth } from '../contexts/AuthContext'

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Task Creation State
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [creatingTask, setCreatingTask] = useState(false)

    // Edit Project State
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')
    const [savingProject, setSavingProject] = useState(false)

    const isViewer = user?.role === 'VIEWER'

    useEffect(() => {
        let mounted = true
        async function fetchProjectData() {
            try {
                const [projRes, tasksRes] = await Promise.all([
                    api.get<Project>(`/api/projects/${id}`),
                    api.get<Task[]>(`/api/projects/${id}/tasks`)
                ])
                if (mounted) {
                    setProject(projRes.data)
                    setEditTitle(projRes.data.title)
                    setEditDescription(projRes.data.description || '')
                    setTasks(tasksRes.data)
                }
            } catch (err: unknown) {
                if (mounted) {
                    const errorData = (err as { response?: { data?: { error?: string, message?: string } } })?.response?.data
                    setError(errorData?.error ?? errorData?.message ?? 'Failed to load project details')
                }
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchProjectData()
        return () => { mounted = false }
    }, [id])

    async function handleCreateTask(e: React.FormEvent) {
        e.preventDefault()
        if (!newTaskTitle.trim() || isViewer) return

        setCreatingTask(true)
        try {
            const response = await api.post<Task>(`/api/projects/${id}/tasks`, { title: newTaskTitle })
            setTasks([...tasks, response.data])
            setNewTaskTitle('')
        } catch (err: unknown) {
            alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to create task')
        } finally {
            setCreatingTask(false)
        }
    }

    async function handleToggleTask(taskId: string, currentCompleted: boolean) {
        if (isViewer) return

        // Optimistic update
        setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !currentCompleted } : t))

        try {
            await api.patch(`/api/tasks/${taskId}`, { completed: !currentCompleted })
        } catch {
            // Revert on error
            setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: currentCompleted } : t))
            alert('Failed to update task status')
        }
    }

    async function handleDeleteTask(taskId: string) {
        if (isViewer || !window.confirm('Are you sure you want to delete this task?')) return

        try {
            await api.delete(`/api/tasks/${taskId}`)
            setTasks(tasks.filter(t => t.id !== taskId))
        } catch {
            alert('Failed to delete task')
        }
    }

    async function handleUpdateProject(e: React.FormEvent) {
        e.preventDefault()
        if (isViewer || !editTitle.trim()) return

        setSavingProject(true)
        try {
            const response = await api.patch<Project>(`/api/projects/${id}`, { title: editTitle, description: editDescription })
            setProject(response.data)
            setIsEditing(false)
        } catch (err: unknown) {
            alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to update project')
        } finally {
            setSavingProject(false)
        }
    }

    async function handleDeleteProject() {
        if (isViewer || !window.confirm('Are you sure you want to delete this entire project? This action cannot be undone.')) return

        try {
            await api.delete(`/api/projects/${id}`)
            navigate('/projects')
        } catch {
            alert('Failed to delete project')
        }
    }

    if (loading) {
        return (
            <div className="page-header">
                <h1 className="page-title skeleton-text w-64 mb-4"></h1>
                <div className="skeleton-text w-full max-w-2xl h-16"></div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="alert-error">
                <p>{error || 'Project not found'}</p>
                <button onClick={() => navigate('/projects')} className="btn btn-secondary mt-4">Back to Projects</button>
            </div>
        )
    }

    return (
        <div className="project-detail-page">
            <div className="mb-6 flex">
                <button onClick={() => navigate('/projects')} className="text-muted hover:text-indigo-600 flex items-center gap-1 text-sm font-medium transition-colors">
                    <span>&larr;</span> Back to Projects
                </button>
            </div>

            <div className="bg-surface rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
                {isEditing ? (
                    <form onSubmit={handleUpdateProject}>
                        <input
                            type="text"
                            className="auth-input w-full text-xl font-bold mb-4"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                        />
                        <textarea
                            className="auth-input w-full min-h-[80px] mb-4"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Project description..."
                        />
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" disabled={savingProject}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={savingProject || !editTitle.trim()}>
                                {savingProject ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{project.title}</h1>
                                <p className="text-sm text-muted mt-1">Last updated {new Date(project.updatedAt).toLocaleDateString()}</p>
                            </div>
                            {!isViewer && (
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary text-sm px-3 py-1 flex-1 sm:flex-none">Edit</button>
                                    <button onClick={handleDeleteProject} className="btn text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm px-3 py-1 flex-1 sm:flex-none">Delete</button>
                                </div>
                            )}
                        </div>
                        {project.description && (
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{project.description}</p>
                        )}
                        {isViewer && <span className="inline-block mt-4 badge">Read-only View</span>}
                    </div>
                )}
            </div>

            <div className="tasks-section">
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Tasks</h2>

                {!isViewer && (
                    <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2 mb-6">
                        <input
                            type="text"
                            className="auth-input flex-1 m-0"
                            placeholder="What needs to be done?"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            disabled={creatingTask}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary w-full sm:w-auto"
                            disabled={creatingTask || !newTaskTitle.trim()}
                        >
                            Add Task
                        </button>
                    </form>
                )}

                {tasks.length > 0 ? (
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div key={task.id} className={`flex items-center justify-between p-4 bg-surface rounded-lg border ${task.completed ? 'border-slate-200 dark:border-slate-800 opacity-60' : 'border-slate-300 dark:border-slate-700'} transition-all`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleToggleTask(task.id, task.completed)}
                                        disabled={isViewer}
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50 cursor-pointer"
                                    />
                                    <span className={`text-slate-900 dark:text-slate-100 ${task.completed ? 'line-through text-slate-500' : ''}`}>
                                        {task.title}
                                    </span>
                                </div>
                                {!isViewer && (
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="text-slate-400 hover:text-red-500 p-2 opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity"
                                        style={{ opacity: isViewer ? 0 : undefined }}
                                        onMouseEnter={(e) => window.innerWidth > 640 && (e.currentTarget.style.opacity = '1')}
                                        onMouseLeave={(e) => window.innerWidth > 640 && (e.currentTarget.style.opacity = '')}
                                        title="Delete task"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-surface rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-muted">No tasks yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
