import axios from 'axios';

export const api = axios.create({
  baseURL: '/',
  withCredentials: true // Важливо для відправки HttpOnly кукі
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Більше не чистимо localStorage, бо токена там немає
      // Перенаправлення на логін обробляється в AuthContext (за бажанням можна через подію)
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);
