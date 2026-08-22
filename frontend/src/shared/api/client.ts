import axios from 'axios'
import { tokenStore } from './token-store'

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
    const token = tokenStore.get()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error)

        const originalRequest = error.config as typeof error.config & { _retry?: boolean }

        const is401 = error.response?.status === 401
        const alreadyRetried = originalRequest?._retry === true
        const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')

        if (is401 && !alreadyRetried && !isRefreshEndpoint) {
            originalRequest._retry = true

            try {
                const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh')
                tokenStore.set(data.accessToken)
                return apiClient(originalRequest)
            } catch {
                tokenStore.clear()
                tokenStore.triggerExpired()
                return Promise.reject(error)
            }
        }

        return Promise.reject(error)
    },
)
