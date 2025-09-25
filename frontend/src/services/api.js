import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Atualize conforme a URL do backend
});

// Interceptador para adicionar token ao header
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (credentials) => API.post("/users/login", credentials);
export const fetchUsers = () => API.get("/users");
export const registerUser = (data) => API.post("/users/register", data);

export default API;
