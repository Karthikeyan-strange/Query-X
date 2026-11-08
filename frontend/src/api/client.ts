/**
 * Centralized QueryX API Client.
 * Connects React Frontend to Spring Boot Backend (http://localhost:8080).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://queryx-backend-y1xq.onrender.com/api'

export function getAuthToken(): string | null {
  return localStorage.getItem('queryx_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('queryx_token', token)
}

export function clearAuth() {
  localStorage.removeItem('queryx_token')
  localStorage.removeItem('queryx_user')
}

export function getStoredUser(): any | null {
  const user = localStorage.getItem('queryx_user')
  return user ? JSON.parse(user) : null
}

export function setStoredUser(user: any) {
  localStorage.setItem('queryx_user', JSON.stringify(user))
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message || 'Request failed')
  }

  return response.json()
}

export const api = {
  // Authentication
  auth: {
    teamLogin: (data: { email: string; password: string }) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    customerLogin: (data: { email: string; orderId: string }) =>
      request<any>('/auth/customer/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<any>('/auth/me'),
  },

  // Dashboard KPIs
  dashboard: {
    getStats: () => request<any>('/dashboard/stats'),
  },

  // Complaints
  complaints: {
    getAll: (status?: string) => request<any[]>(`/complaints${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    getById: (id: string) => request<any>(`/complaints/${id}`),
    create: (data: any) => request<any>('/complaints', { method: 'POST', body: JSON.stringify(data) }),
    assign: (id: string, userId: string) => request<any>(`/complaints/${id}/assign?userId=${userId}`, { method: 'PATCH' }),
    updateStatus: (id: string, status: string) => request<any>(`/complaints/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  },

  // Orders & Tracking
  orders: {
    getByNumber: (orderNumber: string) => request<any>(`/orders/${encodeURIComponent(orderNumber)}`),
    getMyOrders: () => request<any[]>('/orders/my-orders'),
    trackShipment: (trackingNumber: string) => request<any>(`/orders/track/${encodeURIComponent(trackingNumber)}`),
  },

  // Regional Events
  regionalEvents: {
    getAll: () => request<any[]>('/regional-events'),
    getById: (id: string) => request<any>(`/regional-events/${id}`),
  },

  // Investigations & Responses
  investigations: {
    getAll: (status?: string) => request<any[]>(`/investigations${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    getById: (id: string) => request<any>(`/investigations/${id}`),
    getByComplaintId: (complaintId: string) => request<any[]>(`/investigations/complaint/${complaintId}`),
    trigger: (complaintId: string) => request<any>(`/investigations/trigger/${complaintId}`, { method: 'POST' }),
  },
  responses: {
    getByComplaintId: (complaintId: string) => request<any[]>(`/responses/complaint/${complaintId}`),
    approve: (responseId: string) => request<any>(`/responses/${responseId}/approve`, { method: 'POST' }),
  },
}
