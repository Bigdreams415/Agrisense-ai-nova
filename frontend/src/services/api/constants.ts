export const API_CONFIG = {
  BASE_URL:
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_URL ||
    'http://127.0.0.1:8000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

