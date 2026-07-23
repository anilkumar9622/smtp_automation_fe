import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8449/api/v1", // change to your backend
});

// Attach token automatically
api.interceptors.request.use((config:any) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;