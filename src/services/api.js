import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

console.log("ENV:", import.meta.env);
console.log("API_URL:", API_URL);

alert(API_URL);

const api = axios.create({
    baseURL: API_URL,
});

export default api;