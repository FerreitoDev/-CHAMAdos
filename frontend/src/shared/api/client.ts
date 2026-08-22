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

let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error)

        const originalRequest = error.config as typeof error.config & { _retry?: boolean }

        const is401 = error.response?.status === 401
        const alreadyRetried = originalRequest?._retry === true
        const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')

        if (is401 && !alreadyRetried && !isRefreshEndpoint && originalRequest) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return apiClient(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const { data } = await apiClient.post<{ accessToken: string }>('/auth/refresh')
                tokenStore.set(data.accessToken)
                processQueue(null, data.accessToken)
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                tokenStore.clear()
                tokenStore.triggerExpired()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    },
)
