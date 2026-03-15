import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function ProjectNew() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!title.trim()) return

        setSaving(true)
        setError('')
        try {
            const response = await api.post<{ id: string }>('/api/projects', { title, description })
            navigate(`/projects/${response.data.id}`)
        } catch (err: unknown) {
            const errorData = (err as { response?: { data?: { error?: string, message?: string } } })?.response?.data
            setError(errorData?.error ?? errorData?.message ?? 'Failed to create project')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="modal-container p-4 sm:p-6 w-full max-w-lg mx-auto bg-surface rounded-lg shadow-md mt-4 sm:mt-10">
            <div className="mb-6 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-2">Create new project</h1>
                <p className="text-muted">Start a new project to organize your tasks.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group mb-4">
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                        type="text"
                        className="auth-input w-full"
                        placeholder="E.g. Website Redesign"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus
                    />
                </div>

                <div className="form-group mb-6">
                    <label className="block text-sm font-medium mb-1">Description <span className="text-muted font-normal">(optional)</span></label>
                    <textarea
                        className="auth-input w-full min-h-[100px] resize-y"
                        placeholder="What is this project about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {error && <p className="auth-error mb-4">{error}</p>}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        type="button"
                        className="btn btn-secondary w-full sm:w-auto"
                        onClick={() => navigate(-1)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary w-full sm:w-auto"
                        disabled={saving || !title.trim()}
                    >
                        {saving ? 'Creating…' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    )
}
