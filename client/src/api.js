import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bloodlink-6da9.onrender.com/api/blood'
});

export default api;