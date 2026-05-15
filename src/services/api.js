import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,

    (error) => {

        const url = error.config?.url;

        if (
            error.response?.status === 401 &&
            !url.includes("/auth/login")
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;