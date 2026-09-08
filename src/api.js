const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}

export const api = {
  auth: {
    requestOtp: (email) => request('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyOtp: (email, otp) => request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  },
  farms: {
    list: () => request('/api/farms'),
    create: (farm) => request('/api/farms', { method: 'POST', body: JSON.stringify(farm) }),
    update: (id, farm) => request(`/api/farms/${id}`, { method: 'PATCH', body: JSON.stringify(farm) }),
    remove: (id) => request(`/api/farms/${id}`, { method: 'DELETE' }),
  },
  diagnosis: (payload) => request('/api/diagnosis', { method: 'POST', body: JSON.stringify(payload) }),
  chat: (messages) => request('/api/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) }),
  schemes: { list: (params = '') => request(`/api/schemes${params}`) },
  weather: { current: (location) => request(`/api/weather?location=${encodeURIComponent(location)}`) },
  marketplace: { products: (params = '') => request(`/api/marketplace/products${params}`) },
  expert: { cases: () => request('/api/expert/cases') },
  admin: { overview: () => request('/api/admin/overview') },
}

export { API_BASE_URL }
