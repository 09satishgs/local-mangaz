const PORT = import.meta.env.PORT;

export const API_BASE =
  typeof window !== 'undefined' && window.location.port === PORT
    ? '/api'
    : `http://${typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost'}:${PORT}/api`;
