import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'

interface AdminUser {
    id: string
    email: string
    name: string | null
    role: Role
    createdAt: string
}

export default function AdminUsers() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/', { replace: true })
            return
        }
        fetchUsers()
    }, [user, navigate])

    async function fetchUsers() {
        try {
            const { data } = await api.get<AdminUser[]>('/api/admin/users')
            setUsers(data)
        } catch {
            setError('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    async function handleRoleChange(userId: string, newRole: Role) {
        setUpdatingId(userId)
        setFeedback(null)
        try {
            const { data } = await api.patch<AdminUser>(`/api/admin/users/${userId}/role`, { role: newRole })
            setUsers(users.map(u => u.id === userId ? { ...u, role: data.role } : u))
            setFeedback({ id: userId, msg: 'Role updated!', type: 'success' })
            setTimeout(() => setFeedback(f => f?.id === userId ? null : f), 2000)
        } catch (err: unknown) {
            const errorData = (err as { response?: { data?: { error?: string } } })?.response?.data
            setFeedback({ id: userId, msg: errorData?.error ?? 'Failed to update role', type: 'error' })
            // Revert the select
            fetchUsers()
        } finally {
            setUpdatingId(null)
        }
    }

    if (loading) {
        return (
            <div className="page-header">
                <h1 className="page-title skeleton-text w-48"></h1>
                <div className="skeleton-text w-full max-w-2xl h-48 mt-6"></div>
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
        <div className="admin-page">
            <div className="page-header mb-8">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage user roles and permissions.</p>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className={u.id === user?.id ? 'current-user-row' : ''}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar">{(u.name || u.email)[0].toUpperCase()}</div>
                                        <span>{u.name || '—'}</span>
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>
                                    {u.id === user?.id ? (
                                        <span className={`role-badge role-${u.role.toLowerCase()}`}>{u.role}</span>
                                    ) : (
                                        <div className="role-cell">
                                            <select
                                                className="role-select"
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                                                disabled={updatingId === u.id}
                                            >
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="MEMBER">MEMBER</option>
                                                <option value="VIEWER">VIEWER</option>
                                            </select>
                                            {feedback?.id === u.id && (
                                                <span className={`role-feedback ${feedback.type}`}>{feedback.msg}</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
