import axios from "axios";
import { getToken } from "./utils/token";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

API.interceptors.request.use(
    (req) => {
        const token = getToken();
        if (token && !req.headers.Authorization) {
            req.headers.Authorization = `Bearer ${token}`;
        }
        return req;
    },
    (error) => {
        return Promise.reject(error); // Safe error handling
    }
);

export default API;
