import axios from 'axios';

// 1. Create a baseline configuration
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/user',
    withCredentials: true, // This is the Axios equivalent of credentials: 'include'
});

// 2. Set up the Response Interceptor
axiosInstance.interceptors.response.use(
    // If the request succeeds, just return the response normally
    (response) => {
        return response;
    },
    // If the request fails, check WHY it failed
    async (error) => {
        const originalRequest = error.config;

        // If the backend threw a 401 (Access Token Expired) AND we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried so we don't get stuck in an infinite loop

            try {
                // Silently ping the refresh endpoint. This reads the 7-day cookie and sets a new 15-min cookie.
                await axios.post('http://localhost:8000/api/user/refresh-token', {}, { withCredentials: true });

                // The browser now has a fresh access_token! 
                // Retry the exact original request that failed
                return axiosInstance(originalRequest);
                
            } catch (refreshError) {
                // If this fails, it means the 7-day token ALSO expired. Time to kick them to login.
                window.location.href = '/student/login';
                return Promise.reject(refreshError);
            }
        }

        // If it was any other error (like a 404 or 500), just throw it normally
        return Promise.reject(error);
    }
);

export default axiosInstance;