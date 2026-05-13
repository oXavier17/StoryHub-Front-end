import api from "./api";

const authService = {
    login: (data) => api.post("/auth/login", data),
    registro: (data) => api.post("/auth/registro", data),
};

export default authService;