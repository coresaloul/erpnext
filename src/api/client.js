import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Extract CSRF token from document cookie if available
function getCsrfToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrf_token='))
  return cookieValue ? cookieValue.split('=')[1] : null
}

apiClient.interceptors.request.use((config) => {
  const token = getCsrfToken()
  if (token) {
    config.headers['X-Frappe-CSRF-Token'] = token
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // If session expired or unauthorized
    if (error.response && error.response.status === 401) {
      // Allow caller to handle redirect to login
    }
    
    // Parse Frappe error message
    let errorMessage = 'An unexpected error occurred.'
    if (error.response?.data?._server_messages) {
      try {
        const msgs = JSON.parse(error.response.data._server_messages)
        const parsed = msgs.map(m => {
          const parsedMsg = JSON.parse(m)
          return parsedMsg.message.replace(/<[^>]*>?/gm, '')
        })
        errorMessage = parsed.join(' ')
      } catch (e) {
        errorMessage = error.response.data._error_message || error.message
      }
    } else if (error.response?.data?.message) {
      errorMessage = typeof error.response.data.message === 'string' 
        ? error.response.data.message 
        : JSON.stringify(error.response.data.message)
    } else if (error.response?.data?.exc_type) {
      errorMessage = error.response.data.exc_type
    } else if (error.message) {
      errorMessage = error.message
    }

    error.friendlyMessage = errorMessage
    return Promise.reject(error)
  }
)

export default apiClient
