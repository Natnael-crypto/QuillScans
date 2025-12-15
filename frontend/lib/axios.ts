import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL, // same-origin
    withCredentials: true, // IMPORTANT: send HTTP-only cookies
    timeout: 15_000,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = "/auth?mode=login";
        }
        return Promise.reject(error);
    }
);

export default api;
