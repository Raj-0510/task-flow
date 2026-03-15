export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface User {
    id: string
    email: string
    name?: string
    role?: Role
}

export interface Project {
    id: string
    title: string
    description?: string
    createdAt: string
    updatedAt: string
    _count?: {
        tasks: number
    }
}

export interface Task {
    id: string
    title: string
    completed: boolean
    projectId: string
    createdAt: string
    updatedAt: string
}

export interface DashboardResponse {
    totalProjects: number
    totalTasks: number
    recentProjects: Project[]
}
