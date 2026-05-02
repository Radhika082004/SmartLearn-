export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

//Backend (Django) uses this to identify logged-in user
export const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('access');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper to handle JSON and auth
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const headers = {
        'Content-Type': 'application/json', //tells backend that we are sending json data
        ...getAuthHeaders(),
        ...options.headers,
    };
//API call
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle token refresh logic here in a real app, keeping it simple for now
    if (response.status === 401) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
             window.location.href = '/login';
        }
    }

    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        throw new Error(data?.error || data?.detail || 'An error occurred');
    }

    return data;
}
